import {
	getLogger as getExistingLogger,
	isLevelEnabled as isRequestedLevelEnabled,
	log as performLog,
	normalizeCategory,
	registerLogger,
	setAppender,
	setLevel
} from "./categories";
import { getCapitalizedMethodForSymbol, getMethodForSymbol, isValidLevel, validForLoggingSymbols } from "./level";

const log = (level, category, ...args) => performLog(level, category, ...args);
const isLevelEnabled = (level, category) => isRequestedLevelEnabled(level, category);

const getLogger = category => {
	const normalizedCategory = normalizeCategory(category);
	const existingLogger = getExistingLogger(normalizedCategory);
	if (existingLogger) {
		return existingLogger;
	}
	const logger = validForLoggingSymbols.reduce((logger, level) => {
		const methodName = getMethodForSymbol(level);
		logger[methodName] = (...args) => log(level, normalizedCategory, ...args);
		const capitalizedMethodName = getCapitalizedMethodForSymbol(level);
		logger[`is${capitalizedMethodName}Enabled`] = () => isLevelEnabled(level, normalizedCategory);
		return logger;
	}, {});
	logger.setAppender = function _setAppender(appender) {
		setAppender(normalizedCategory, appender);
		return this;
	}.bind(logger);
	logger.setLevel = function _setLevel(level) {
		if (!isValidLevel(level)) {
			throw new Error(`Invalid level ${level}`);
		}
		setLevel(normalizedCategory, level);
		return this;
	}.bind(logger);
	registerLogger(normalizedCategory, logger);
	return logger;
};

const getRootLogger = () => getLogger();

export { getLogger, getRootLogger };
