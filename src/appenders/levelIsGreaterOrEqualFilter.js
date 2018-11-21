import { isValidLevel, mayUseLevel } from "../level/level";

const levelIsGreaterOrEqualFilterAppender = (levelToMatch, appender) => {
	if (!isValidLevel(levelToMatch)) {
		throw new Error(`Invalid level ${levelToMatch}`);
	}
	if (typeof appender !== "function") {
		throw new Error(`Invalid appender ${appender}`);
	}
	return (level, date, category, ...args) => {
		if (mayUseLevel(level, levelToMatch)) {
			appender(level, date, category, ...args);
		}
	};
};

export default levelIsGreaterOrEqualFilterAppender;
