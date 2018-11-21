const combineAppender = (...appenders) => {
	if (appenders.length === 0) {
		throw new Error("You should provide at least one appender to combine");
	}
	return (level, date, category, ...args) => appenders.forEach(appender => appender(level, date, category, ...args));
};

export default combineAppender;
