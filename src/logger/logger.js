import {
	getCapitalizedMethodForSymbol,
	getMethodForSymbol,
	isValidLevel,
	validForLoggingSymbols
} from "../level/level";
import compose from "../util/compose";
import { isFunction } from "../util/isFunction";
import {
	clearAppender,
	clearLevel,
	getLogger as getExistingLogger,
	isLevelEnabled,
	log,
	normalizeCategory,
	registerLogger,
	setAppender,
	setLevel
} from "./categories";

const getObjectSequenceFromTemplateLiteral = (strings, ...args) =>
	strings.reduce((acc, string, i) => {
		if (string !== "") {
			acc.push(string);
		}
		if (i < args.length) {
			acc.push(args[i]);
		}
		return acc;
	}, []);

const makeBaseLogger = category => ({
	logger: validForLoggingSymbols.reduce((logger, level) => {
		const methodName = getMethodForSymbol(level);
		logger[methodName] = (...args) => log(level, category, ...args);
		logger[`$${methodName}`] = (strings, ...args) =>
			log(level, category, ...getObjectSequenceFromTemplateLiteral(strings, ...args));
		const capitalizedMethodName = getCapitalizedMethodForSymbol(level);
		logger[`is${capitalizedMethodName}Enabled`] = () => isLevelEnabled(level, category);
		return logger;
	}, {}),
	category
});

const configureSetAppender = ({ logger, category }) => (
	(logger.setAppender = function _setAppender(appender) {
		if (!isFunction(appender)) {
			throw new Error(`Invalid appender ${appender}`);
		}
		setAppender(category, appender);
		return logger;
	}),
	{ logger, category }
);

const configureClearAppender = ({ logger, category }) => (
	(logger.clearAppender = function _clearAppender() {
		clearAppender(category);
		return logger;
	}),
	{ logger, category }
);

const configureSetLevel = ({ logger, category }) => (
	(logger.setLevel = function _setLevel(level) {
		if (!isValidLevel(level)) {
			throw new Error(`Invalid level ${level}`);
		}
		setLevel(category, level);
		return logger;
	}),
	{ logger, category }
);

const configureClearLevel = ({ logger, category }) => (
	(logger.clearLevel = function _clearLevel() {
		clearLevel(category);
		return logger;
	}),
	{ logger, category }
);

const configureGetLoggerFuncs = getLoggerFunction => ({ logger, category }) => {
	logger.getLogger = getLoggerFunction;
	logger.getRootLogger = () => getLoggerFunction();
	return { logger, category };
};
const createLogger = (category, getLoggerFunction) =>
	compose(
		registerLogger,
		configureGetLoggerFuncs(getLoggerFunction),
		configureClearLevel,
		configureSetLevel,
		configureClearAppender,
		configureSetAppender,
		makeBaseLogger
	)(category);

const getLogger = function getLogger(category) {
	const normalizedCategory = normalizeCategory(category);
	return getExistingLogger(normalizedCategory) || createLogger(normalizedCategory, getLogger);
};

const getRootLogger = () => getLogger();

export { getLogger, getRootLogger };
