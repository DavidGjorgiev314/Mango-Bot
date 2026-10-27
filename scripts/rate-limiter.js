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

// Drop expired entries periodically so the map does not grow for the whole
// lifetime of the process. unref() keeps this from holding the process open.
const cleanup = setInterval(() => {
	const now = Date.now();
	for (const [key, timestamp] of cooldowns) {
		if (now - timestamp > ONE_HOUR) cooldowns.delete(key);
	}
}, ONE_HOUR);
cleanup.unref();

module.exports = { canExecuteCommand };
