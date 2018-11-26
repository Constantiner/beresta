import { isValidLevel, mayUseLevel } from "../level/level";
import { funcSafetyCheck } from "../util/isFunction";

const getFilterFn = (levelToMatch, appender) =>
	funcSafetyCheck(appender, `Invalid appender ${appender}`)((level, date, category, ...args) => {
		if (mayUseLevel(level, levelToMatch)) {
			appender(level, date, category, ...args);
		}
	});

const levelIsGreaterOrEqualFilterAppender = (levelToMatch, appender) => {
	if (!isValidLevel(levelToMatch)) {
		throw new Error(`Invalid level ${levelToMatch}`);
	}
	return getFilterFn(levelToMatch, appender);
};

export default levelIsGreaterOrEqualFilterAppender;
