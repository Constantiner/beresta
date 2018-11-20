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

const makeBaseLogger = category =>
	validForLoggingSymbols.reduce((logger, level) => {
		const methodName = getMethodForSymbol(level);
		logger[methodName] = (...args) => log(level, category, ...args);
		const capitalizedMethodName = getCapitalizedMethodForSymbol(level);
		logger[`is${capitalizedMethodName}Enabled`] = () => isLevelEnabled(level, category);
		return logger;
	}, {});

const configureSetAppender = (logger, category) => (
	(logger.setAppender = function _setAppender(appender) {
		setAppender(category, appender);
		return logger;
	}),
	logger
);

const configureSetLevel = (logger, category) => (
	(logger.setLevel = function _setLevel(level) {
		if (!isValidLevel(level)) {
			throw new Error(`Invalid level ${level}`);
		}
		setLevel(category, level);
		return logger;
	}),
	logger
);

const createLogger = (category, getLoggerFunction) => {
	const logger = makeBaseLogger(category);
	configureSetAppender(logger, category);
	configureSetLevel(logger, category);
	logger.getLogger = getLoggerFunction;
	logger.getRootLogger = () => getLoggerFunction();
	return registerLogger(category, logger);
};

const getLogger = function getLogger(category) {
	const normalizedCategory = normalizeCategory(category);
	const existingLogger = getExistingLogger(normalizedCategory);
	if (existingLogger) {
		return existingLogger;
	}
	return createLogger(normalizedCategory, getLogger);
};

const getRootLogger = () => getLogger();

export { getLogger, getRootLogger };
