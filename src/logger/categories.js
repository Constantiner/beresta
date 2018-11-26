import { addLoggerToHierarchy, initTree, updateAppenderOrLevel } from "./categoriesTree";
import { mayUseLevel, OFF } from "../level/level";
import { getNow } from "../util/dateUtil";

const ROOT_CATEGORY = "";
const categories = {};

const initRoot = () => {
	const rootLoggerDescription = { level: OFF };
	categories[ROOT_CATEGORY] = rootLoggerDescription;
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

const registerLogger = ({ category, logger }) => {
	const loggerDescription = createLoggerDescription(categories[category], logger);
	categories[category] = loggerDescription;
	addLoggerToHierarchy(category, loggerDescription, category === ROOT_CATEGORY);
	return logger;
};

const getLogger = category => {
	const loggerDescription = categories[category];
	if (loggerDescription) {
		return loggerDescription.logger;
	}
};

const setAppender = (category, appender) => {
	const loggerDescription = categories[category];
	loggerDescription.appender = appender;
	updateAppenderOrLevel(category, category === ROOT_CATEGORY);
};

const clearAppender = category => {
	const loggerDescription = categories[category];
	delete loggerDescription.appender;
	updateAppenderOrLevel(category, category === ROOT_CATEGORY);
};

const setLevel = (category, level) => {
	const loggerDescription = categories[category];
	loggerDescription.level = level;
	updateAppenderOrLevel(category, category === ROOT_CATEGORY);
};

const clearLevel = category => {
	const loggerDescription = categories[category];
	const isRoot = category === ROOT_CATEGORY;
	if (isRoot) {
		loggerDescription.level = OFF;
	} else {
		delete loggerDescription.level;
	}
	updateAppenderOrLevel(category, category === ROOT_CATEGORY);
};

const isLevelEnabled = (level, category) => {
	const loggerDescription = categories[category];
	const effectiveLevel = loggerDescription.level || loggerDescription.levelDerived;
	return mayUseLevel(level, effectiveLevel);
};

const processLogging = (loggerDescription, level, category, ...args) => {
	const appender = loggerDescription.appender || loggerDescription.appenderDerived;
	if (!appender) {
		return loggerDescription.logger;
	}
	appender(level, getNow(), category, ...args);
	return loggerDescription.logger;
};

const log = (level, category, ...args) => processLogging(categories[category], level, category, ...args);

initRoot();

export {
	registerLogger,
	setAppender,
	clearAppender,
	setLevel,
	clearLevel,
	getLogger,
	isLevelEnabled,
	normalizeCategory,
	log
};
