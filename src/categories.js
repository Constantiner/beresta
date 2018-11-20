import { addLoggerToHierarchy, initTree, updateAppenderOrLevel } from "./categoriesTree";
import { getLevelString, mayUseLevel, OFF } from "./level";
import { getNow } from "./util/dateUtil";

const ROOT_CATEGORY = "";
const categories = new Map();

const initRoot = () => {
	const rootLoggerDescription = { level: OFF };
	categories.set(ROOT_CATEGORY, rootLoggerDescription);
	initTree(ROOT_CATEGORY, rootLoggerDescription);
};

const resolveRootCategory = category => category || ROOT_CATEGORY;

const normalizeCategory = category => resolveRootCategory(category).replace(/[\\/]/, ".");

const createLoggerDescription = (originalLoggerDescription, logger) => {
	const loggerDescription = { logger };
	if (originalLoggerDescription) {
		return Object.assign(originalLoggerDescription, loggerDescription);
	}
	return loggerDescription;
};

const registerLogger = (category, logger) => {
	const loggerDescription = createLoggerDescription(categories.get(category), logger);
	categories.set(category, loggerDescription);
	addLoggerToHierarchy(category, loggerDescription, category === ROOT_CATEGORY);
	return logger;
};

const getLogger = category => {
	const loggerDescription = categories.get(category);
	if (loggerDescription) {
		return loggerDescription.logger;
	}
};

const setAppender = (category, appender) => {
	const loggerDescription = categories.get(category);
	loggerDescription.appender = appender;
	updateAppenderOrLevel(category, category === ROOT_CATEGORY);
};

const setLevel = (category, level) => {
	const loggerDescription = categories.get(category);
	loggerDescription.level = level;
	updateAppenderOrLevel(category, category === ROOT_CATEGORY);
};

const clearLevel = category => {
	const loggerDescription = categories.get(category);
	const isRoot = category === ROOT_CATEGORY;
	if (isRoot) {
		loggerDescription.level = OFF;
	} else {
		delete loggerDescription.level;
	}
	updateAppenderOrLevel(category, category === ROOT_CATEGORY);
};

const isLevelEnabled = (level, category) => {
	const loggerDescription = categories.get(category);
	const effectiveLevel = loggerDescription.level || loggerDescription.levelDerived;
	return mayUseLevel(level, effectiveLevel);
};

const processLogging = (loggerDescription, level, category, ...args) => {
	const appender = loggerDescription.appender || loggerDescription.appenderDerived;
	if (!appender) {
		return loggerDescription.logger;
	}
	const levelString = getLevelString(level);
	appender(levelString, getNow(), category, ...args);
	return loggerDescription.logger;
};

const log = (level, category, ...args) => {
	const loggerDescription = categories.get(category);
	const logger = loggerDescription.logger;
	if (!isLevelEnabled(level, category)) {
		return logger;
	}
	return processLogging(loggerDescription, level, category, ...args);
};

initRoot();

export {
	registerLogger,
	setAppender,
	setLevel,
	clearLevel,
	getLogger,
	ROOT_CATEGORY,
	isLevelEnabled,
	normalizeCategory,
	log
};
