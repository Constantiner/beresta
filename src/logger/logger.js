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

const configureLogMethodForLevel = ({ category, logger, level }) => {
	const methodName = getMethodForSymbol(level);
	logger[methodName] = (...args) => (isLevelEnabled(level, category) ? log(level, category, ...args) : logger);
	return { category, logger, level };
};

const configureTaggedTemplateLiteralMethodForLevel = ({ category, logger, level }) => {
	const methodName = getMethodForSymbol(level);
	logger[`$${methodName}`] = (strings, ...args) =>
		isLevelEnabled(level, category)
			? log(level, category, ...getObjectSequenceFromTemplateLiteral(strings, ...args))
			: logger;
	return { category, logger, level };
};

const configureIsLevelEnabledMethod = ({ category, logger, level }) => {
	const capitalizedMethodName = getCapitalizedMethodForSymbol(level);
	logger[`is${capitalizedMethodName}Enabled`] = () => isLevelEnabled(level, category);
	return { category, logger, level };
};

const configureLoggerWithLevelFuncs = category => (logger, level) =>
	compose(
		configureIsLevelEnabledMethod,
		configureTaggedTemplateLiteralMethodForLevel,
		configureLogMethodForLevel
	)({ category, logger, level }).logger;

const makeBaseLogger = category => ({
	logger: validForLoggingSymbols.reduce(configureLoggerWithLevelFuncs(category), {}),
	category
});

const configureSetAppender = ({ logger, category }) => (
	(logger.setAppender = appender => {
		if (!isFunction(appender)) {
			throw new Error(`Invalid appender ${appender}`);
		}
		setAppender(category, appender);
		return logger;
	}),
	{ logger, category }
);

const configureClearAppender = ({ logger, category }) => (
	(logger.clearAppender = () => {
		clearAppender(category);
		return logger;
	}),
	{ logger, category }
);

const configureSetLevel = ({ logger, category }) => (
	(logger.setLevel = level => {
		if (!isValidLevel(level)) {
			throw new Error(`Invalid level ${level}`);
		}
		setLevel(category, level);
		return logger;
	}),
	{ logger, category }
);

const configureClearLevel = ({ logger, category }) => (
	(logger.clearLevel = () => {
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

const getLogger = category => {
	const normalizedCategory = normalizeCategory(category);
	return getExistingLogger(normalizedCategory) || createLogger(normalizedCategory, getLogger);
};

const getRootLogger = () => getLogger();

export { getLogger, getRootLogger };
