const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  AttachmentBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { progression } = require('../../data/churchHistoryContent');
const {
  readProgress,
  writeProgress,
  getUser,
  getCooldownRemainingMs,
  recordAttempt,
} = require('../../data/churchHistoryStore');

const BADGES_DIR = path.join(__dirname, '../../assets/badges');

// userId -> { workId, index, score }
const activeExams = new Map();

const PASS_PERCENT = 0.7;
const EXAM_SECONDS = 60;

function formatRemaining(ms) {
  const totalMinutes = Math.ceil(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

module.exports = {
  category: 'churchhistory',
  data: new SlashCommandBuilder()
    .setName('church-exam')
    .setDescription('Take an exam on a Church History document or Church Father'),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const userId = interaction.user.id;

    if (activeExams.has(userId)) {
      return interaction.editReply({
        content: '❌ You already have an exam in progress. Finish it or let it time out first.',
      });
    }

    const entries = progression.filter((item) => item.works?.length);
    if (entries.length === 0) {
      return interaction.editReply({ content: '❌ No Church History content is available yet.' });
    }

    // Page 1: choose a document or Church Father.
    const entryRows = entries.map((item, index) =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`chp_item_${index}`)
          .setLabel(item.name)
          .setStyle(item.type === 'father' ? ButtonStyle.Secondary : ButtonStyle.Primary)
      )
    );

    const entryEmbed = new EmbedBuilder()
      .setTitle('⛪ Church History Progression')
      .setDescription(
        'Choose a document or Church Father to study.\n\n' +
        entries
          .map((item, index) => {
            const available = item.works.some((work) => work.questions.length > 0);
            return `**${index + 1}.** ${item.name} — ${available ? '✅ Exams available' : '🔒 Coming soon'}`;
          })
          .join('\n')
      )
      .setColor(0x8b5cf6)
      .setFooter({ text: 'Chronological order: earliest first' });

    let message = await interaction.editReply({
      embeds: [entryEmbed],
      components: entryRows,
    });

    // Choose document / father.
    let entryInteraction;
    try {
      entryInteraction = await message.awaitMessageComponent({
        filter: (i) => i.user.id === userId,
        time: EXAM_SECONDS * 1000,
        componentType: ComponentType.Button,
      });
    } catch {
      return interaction.editReply({
        content: '⌛ Selection timed out. Run `/church-exam` again when ready.',
        embeds: [],
        components: [],
      });
    }

    await entryInteraction.deferUpdate();

    const itemIndex = Number(entryInteraction.customId.split('_')[2]);
    const item = entries[itemIndex];
    if (!item) {
      return interaction.editReply({ content: '❌ Invalid selection.', embeds: [], components: [] });
    }

    const works = item.works.filter((work) => work.questions.length > 0);

    if (works.length === 0) {
      return interaction.editReply({
        content: `🔒 **${item.name}** exams are not available yet.`,
        embeds: [],
        components: [],
      });
    }

    let work = works[0];

    // Page 2: if the father has more than one work, ask which one.
    if (works.length > 1) {
      const workRows = works.map((w, index) =>
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`chp_work_${index}`)
            .setLabel(w.title)
            .setStyle(ButtonStyle.Primary)
        )
      );

      const workEmbed = new EmbedBuilder()
        .setTitle(`📖 ${item.name}`)
        .setDescription('Choose a work to take the exam for:')
        .setColor(0x8b5cf6);

      message = await interaction.editReply({
        embeds: [workEmbed],
        components: workRows,
      });

      let workInteraction;
      try {
        workInteraction = await message.awaitMessageComponent({
          filter: (i) => i.user.id === userId,
          time: EXAM_SECONDS * 1000,
          componentType: ComponentType.Button,
        });
      } catch {
        return interaction.editReply({
          content: '⌛ Selection timed out. Run `/church-exam` again when ready.',
          embeds: [],
          components: [],
        });
      }

      await workInteraction.deferUpdate();

      const workIndex = Number(workInteraction.customId.split('_')[2]);
      work = works[workIndex];
      if (!work) {
        return interaction.editReply({ content: '❌ Invalid selection.', embeds: [], components: [] });
      }
    }

    // Enforce the 24-hour retake cooldown for this specific work.
    const progress = readProgress();
    const userData = getUser(progress, userId);
    const cooldownRemaining = getCooldownRemainingMs(userData, work.id);

    if (cooldownRemaining > 0) {
      return interaction.editReply({
        content: `⏳ You can retake **${work.title}** in **${formatRemaining(cooldownRemaining)}**.`,
        embeds: [],
        components: [],
      });
    }

    // Start the exam loop.
    const total = work.questions.length;
    const exam = {
      workId: work.id,
      index: 0,
      score: 0,
    };
    activeExams.set(userId, exam);

    try {
      while (exam.index < total) {
        const question = work.questions[exam.index];

        const questionEmbed = new EmbedBuilder()
          .setTitle(`📜 ${item.name} — ${work.title}`)
          .setDescription(`**Question ${exam.index + 1} of ${total}**\n\n${question.question}`)
          .setColor(0x8b5cf6)
          .setFooter({ text: `Score so far: ${exam.score}/${total}` });

        const answerRows = question.options.map((option, index) =>
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`chp_ans_${index}`)
              .setLabel(`${String.fromCharCode(65 + index)}) ${option}`)
              .setStyle(ButtonStyle.Primary)
          )
        );

        message = await interaction.editReply({
          embeds: [questionEmbed],
          components: answerRows,
        });

        let answer;
        try {
          answer = await message.awaitMessageComponent({
            filter: (i) => i.user.id === userId,
            time: EXAM_SECONDS * 1000,
            componentType: ComponentType.Button,
          });
        } catch {
          activeExams.delete(userId);
          return interaction.editReply({
            content: '⌛ Exam timed out.',
            embeds: [],
            components: [],
          });
        }

        const chosenIndex = Number(answer.customId.split('_')[2]);
        const correct = chosenIndex === question.correctIndex;
        if (correct) exam.score += 1;

        const feedbackRows = question.options.map((option, index) => {
          const style =
            index === question.correctIndex
              ? ButtonStyle.Success
              : index === chosenIndex
                ? ButtonStyle.Danger
                : ButtonStyle.Secondary;

          return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`chp_ans_${index}`)
              .setLabel(`${String.fromCharCode(65 + index)}) ${option}`)
              .setStyle(style)
              .setDisabled(true)
          );
        });

        const correctLabel = `${String.fromCharCode(65 + question.correctIndex)}) ${question.options[question.correctIndex]}`;
        const feedbackEmbed = new EmbedBuilder()
          .setTitle(`📜 ${item.name} — ${work.title}`)
          .setDescription(
            correct
              ? `✅ Correct!\n\n**Question ${exam.index + 1} of ${total}**\n${question.question}`
              : `❌ Wrong.\n\n**Question ${exam.index + 1} of ${total}**\n${question.question}\n\nCorrect answer: **${correctLabel}**`
          )
          .setColor(correct ? 0x22c55e : 0xef4444)
          .setFooter({ text: `Score so far: ${exam.score}/${total}` });

        await answer.update({ embeds: [feedbackEmbed], components: feedbackRows });

        exam.index += 1;

        // Brief pause so the user can read whether they got it right.
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      activeExams.delete(userId);
      return finishExam(interaction, userId, item, work, exam.score);
    } catch (err) {
      activeExams.delete(userId);
      console.error(err);
      return interaction.editReply({
        content: '❌ Something went wrong during the exam.',
        embeds: [],
        components: [],
      });
    }
  },
};

async function finishExam(interaction, userId, item, work, score) {
  const total = work.questions.length;
  const percent = total > 0 ? score / total : 0;
  const passed = percent >= PASS_PERCENT;

  const progress = readProgress();
  const userData = getUser(progress, userId);
  const newlyEarned = recordAttempt(userData, work.id, score, total);
  writeProgress(progress);

  const workStats = userData.works[work.id];
  const lines = [
    `**${item.name}** — ${work.title}`,
    `Score: **${score}/${total}** (${Math.round(percent * 100)}%)`,
    `Passing score: **${Math.round(PASS_PERCENT * 100)}%**`,
    `Attempts: **${workStats.attempts}**`,
    `Best score: **${workStats.bestScore}/${total}**`,
  ];

  if (passed) {
    lines.push('');
    lines.push(newlyEarned
      ? '🎉 **Badge earned!** This has been added to your profile.'
      : '✅ You passed, but you already have this badge.');
  } else {
    lines.push('');
    lines.push('Keep studying — you need 70% or above to earn the badge.');
  }

  const embed = new EmbedBuilder()
    .setTitle(newlyEarned ? '🎉 Exam Passed!' : 'Exam Complete')
    .setDescription(lines.join('\n'))
    .setColor(passed ? 0x22c55e : 0xef4444);

  await interaction.editReply({ embeds: [embed], components: [] });

  if (passed) {
    await announcePass(interaction, userId, item, work, score, total);
  }
}

async function announcePass(interaction, userId, item, work, score, total) {
  const displayName =
    interaction.member?.displayName ??
    interaction.guild?.members.cache.get(userId)?.displayName ??
    interaction.user.username;

  const percent = Math.round((score / total) * 100);

  const announcement = new EmbedBuilder()
    .setTitle('🎉 Exam Passed!')
    .setDescription(
      `**${displayName}** passed **${item.name}** — ${work.title} with **${score}/${total}** (${percent}%)!`
    )
    .setColor(0x22c55e);

  const files = [];

  if (work.badgeUrl) {
    announcement.setImage(work.badgeUrl);
  } else {
    const badgePath = path.join(BADGES_DIR, `${work.id}.png`);
    if (fs.existsSync(badgePath)) {
      const fileName = `${work.id}.png`;
      files.push(new AttachmentBuilder(badgePath, { name: fileName }));
      announcement.setImage(`attachment://${fileName}`);
    }
  }

  try {
    await interaction.channel.send({ embeds: [announcement], files });
  } catch (err) {
    console.error('Failed to announce exam pass:', err);
  }
}
