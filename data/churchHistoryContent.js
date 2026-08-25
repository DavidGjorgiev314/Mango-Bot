// Church History Progression content.
// Items are ordered chronologically (earliest first).
//
// `badgeUrl` is the public URL of the badge PNG. Discord embeds can only show
// images served over https, so host your PNGs (Imgur, a CDN, GitHub raw, etc.)
// and paste the URL here. Leave it null until you have the image.

const progression = [
  {
    id: 'didache',
    name: 'The Didache',
    type: 'document',
    works: [
      {
        id: 'didache',
        title: 'The Didache',
        badgeUrl: null,
        questions: [
          {
            question: 'What does the Greek word "Didache" mean?',
            options: ['Worship', 'Teaching', 'Communion', 'Prophecy'],
            correctIndex: 1,
          },
          {
            question: 'By what fuller title is the Didache commonly known?',
            options: [
              'The Rule of the Apostles',
              'The Preaching of the Twelve',
              'The Teaching of the Twelve Apostles',
              'The Tradition of the Elders',
            ],
            correctIndex: 2,
          },
          {
            question: 'The Didache opens by presenting which two ways?',
            options: [
              'The Way of Light and the Way of Darkness',
              'The Way of Life and the Way of Death',
              'The Way of Faith and the Way of Works',
              'The Way of Grace and the Way of Judgment',
            ],
            correctIndex: 1,
          },
          {
            question: 'What is the first command of the Way of Life?',
            options: [
              'Love your neighbor as yourself',
              'Love God with all your heart',
              "Keep the Lord's Day holy",
              'Be baptized without delay',
            ],
            correctIndex: 1,
          },
          {
            question: 'What does the Didache list as the second commandment of the Way of Life?',
            options: [
              'Love your neighbor as yourself',
              'Honor the Sabbath',
              'Give alms every day',
              'Fast twice a week',
            ],
            correctIndex: 0,
          },
          {
            question: 'On which days does the Didache instruct Christians to fast?',
            options: [
              'Monday and Thursday',
              'Tuesday and Saturday',
              'Wednesday and Friday',
              'Thursday and Saturday',
            ],
            correctIndex: 2,
          },
          {
            question: 'What prayer does the Didache instruct believers to pray three times a day?',
            options: [
              'The Hail Mary',
              'The Nicene Creed',
              "The Lord's Prayer",
              'The Jesus Prayer',
            ],
            correctIndex: 2,
          },
          {
            question: 'For baptism, what kind of water does the Didache prefer first?',
            options: [
              'Living (running) water',
              'Water blessed by a bishop',
              'Water drawn from the temple',
              'Water that has been prayed over',
            ],
            correctIndex: 0,
          },
          {
            question: 'If no running water is available for baptism, the Didache says to use what?',
            options: [
              'Warm water',
              'Cold water',
              'Water mixed with oil',
              'Water mixed with wine',
            ],
            correctIndex: 1,
          },
          {
            question: 'If there is neither running nor cold water, what does the Didache direct?',
            options: [
              'Pour water on the head three times',
              'Baptize in the sea only',
              'Postpone baptism until water is found',
              'Anoint with oil instead of water',
            ],
            correctIndex: 0,
          },
          {
            question: 'In what name does the Didache instruct baptism to be performed?',
            options: [
              'The name of Jesus only',
              'The name of the Lord',
              'The name of the Father, and of the Son, and of the Holy Spirit',
              'The name of the Father alone',
            ],
            correctIndex: 2,
          },
          {
            question: 'Before a baptism, who does the Didache instruct to fast?',
            options: [
              'The candidate and the baptizer',
              'Only the candidate',
              'The entire church',
              'No one',
            ],
            correctIndex: 0,
          },
          {
            question: 'In the Didache, in what order are the Eucharist elements given thanks?',
            options: [
              'The bread first, then the cup',
              'The cup first, then the bread',
              'Only the bread',
              'Only the cup',
            ],
            correctIndex: 1,
          },
          {
            question: 'Who does the Didache permit to receive the Eucharist?',
            options: [
              'Only the baptized',
              'Anyone present',
              'Only the clergy',
              'Only catechumens',
            ],
            correctIndex: 0,
          },
          {
            question: 'When the Didache says "Give not that which is holy to the dogs," it is warning about which holy thing?',
            options: [
              'The Gospel',
              'Alms',
              'The Eucharist',
              'Baptismal water',
            ],
            correctIndex: 2,
          },
          {
            question: 'The Didache warns against itinerant teachers who do what?',
            options: [
              'Preach without a commission',
              'Ask for money',
              'Speak in tongues',
              'Heal the sick',
            ],
            correctIndex: 1,
          },
          {
            question: 'How long does the Didache say a traveling apostle may stay?',
            options: [
              'One day (or a second if needed)',
              'Three days',
              'A full week',
              'Seven days',
            ],
            correctIndex: 0,
          },
          {
            question: 'What does the Didache say should NOT be done to a prophet "speaking in the Spirit"?',
            options: [
              'Test or judge him',
              'Believe him',
              'Support him',
              'Invite him to stay',
            ],
            correctIndex: 0,
          },
          {
            question: 'Which two church offices does the Didache instruct communities to appoint?',
            options: [
              'Bishops and deacons',
              'Priests and prophets',
              'Apostles and elders',
              'Teachers and scribes',
            ],
            correctIndex: 0,
          },
          {
            question: 'Which quality does the Didache NOT require of bishops and deacons?',
            options: [
              'Meekness',
              'Truthfulness',
              'A wealthy household',
              'Proven character',
            ],
            correctIndex: 2,
          },
          {
            question: 'On which day does the Didache instruct believers to assemble?',
            options: [
              'The Sabbath (Saturday)',
              "The Lord's Day (Sunday)",
              'The first day of the month',
              'The eve of Passover',
            ],
            correctIndex: 1,
          },
          {
            question: 'What does the Didache instruct believers to do before gathering to break bread?',
            options: [
              'Fast for seven days',
              'Confess their transgressions',
              'Give alms to the poor',
              'Be baptized again',
            ],
            correctIndex: 1,
          },
          {
            question: 'To what period is the Didache generally dated?',
            options: [
              'The 2nd century BC',
              'The 1st century AD',
              'The 4th century AD',
              'The 7th century AD',
            ],
            correctIndex: 1,
          },
          {
            question: 'In what language was the Didache originally written?',
            options: ['Greek', 'Latin', 'Aramaic', 'Hebrew'],
            correctIndex: 0,
          },
          {
            question: 'What is the Didache\'s relationship to the New Testament?',
            options: [
              'It is one of the Gospels',
              'It is an early Christian writing outside the New Testament',
              'It was removed from the New Testament in 325 AD',
              'It is part of the Old Testament',
            ],
            correctIndex: 1,
          },
          {
            question: 'Which practice does the Way of Death in the Didache condemn?',
            options: [
              'The charging of interest',
              'The killing of the unborn',
              'The eating of meat',
              'The owning of property',
            ],
            correctIndex: 1,
          },
          {
            question: 'The Way of Death forbids becoming which of the following?',
            options: [
              'A sorcerer',
              'A money-changer',
              'A soldier',
              'A physician',
            ],
            correctIndex: 0,
          },
          {
            question: 'To whom does the Didache instruct the faithful to give their firstfruits?',
            options: [
              'The poor',
              'The prophets',
              'The priests',
              'The widows',
            ],
            correctIndex: 1,
          },
          {
            question: 'In its final chapter, how does the Didache tell believers to prepare for the last days?',
            options: [
              'Sell their possessions',
              'Keep their lamps burning and be ready',
              'Build a new temple',
              'Flee to the mountains',
            ],
            correctIndex: 1,
          },
          {
            question: 'When and by whom was the Didache rediscovered in modern times?',
            options: [
              'In 1500 by a Roman monk',
              'In 1873 by a Greek metropolitan',
              'In 1947 at Qumran',
              'In the 4th century at Rome',
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'clement-of-rome',
    name: 'Clement of Rome',
    type: 'father',
    works: [
      {
        id: 'first-epistle-of-clement',
        title: 'First Epistle of Clement',
        badgeUrl: null,
        questions: [],
      },
      {
        id: 'second-epistle-of-clement',
        title: 'Second Epistle of Clement',
        badgeUrl: null,
        questions: [],
      },
    ],
  },
];

module.exports = { progression };
