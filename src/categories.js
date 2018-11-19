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
	return category;
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

const isLevelEnabled = (level, category) => {
	const loggerDescription = categories.get(category);
	const effectiveLevel = loggerDescription.level || loggerDescription.levelDerived;
	return mayUseLevel(level, effectiveLevel);
};

const log = (level, category, ...args) => {
	const loggerDescription = categories.get(category);
	const logger = loggerDescription.logger;
	if (!isLevelEnabled(level, category)) {
		return logger;
	}
	const appender = loggerDescription.appender || loggerDescription.appenderDerived;
	if (!appender) {
		return logger;
	}
	const levelString = getLevelString(level);
	appender(levelString, getNow(), category, ...args);
	return logger;
};

initRoot();

export { registerLogger, setAppender, setLevel, getLogger, ROOT_CATEGORY, isLevelEnabled, normalizeCategory, log };
