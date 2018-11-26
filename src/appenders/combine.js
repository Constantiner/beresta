import { isFunction } from "../util/isFunction";

const validateAppenders = appenders =>
	appenders.map(appender => {
		if (!isFunction(appender)) {
			throw new Error(`Invalid appender ${appender}`);
		}
		return appender;
	});

const getProceedAppendersFn = appenders => (level, date, category, ...args) =>
	appenders.forEach(appender => appender(level, date, category, ...args));

const combineAppender = (...appenders) => {
	if (appenders.length === 0) {
		throw new Error("You should provide at least one appender to combine");
	}
	return getProceedAppendersFn(validateAppenders(appenders));
};

export default combineAppender;
