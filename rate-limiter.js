const cooldowns = new Map();

const ONE_HOUR = 60 * 60 * 1000;

function canExecuteCommand(userId, commandName, ownerId) {
	if (userId === ownerId) return true;

	const key = `${userId}_${commandName}`;
	const lastExecuted = cooldowns.get(key);

	if (!lastExecuted || Date.now() - lastExecuted > ONE_HOUR) {
		cooldowns.set(key, Date.now());
		return true;
	}

	return false;
}

module.exports = { canExecuteCommand };
