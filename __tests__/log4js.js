import { getMockFn, mockFnArgumentsExpectations } from "./test-utils/jestMockFns";

let ALL, TRACE, DEBUG, INFO, WARN, ERROR, FATAL, OFF, getLogger, getRootLogger, dateNow;
const resetModules = () => {
	jest.clearAllMocks().resetModules();
	dateNow = new Date();
	const getDateNow = () => dateNow;
	const dateUtil = require("../src/util/dateUtil");
	dateUtil.getNow = getDateNow;
	const log4js = require("../src/log4js");
	ALL = log4js.ALL;
	TRACE = log4js.TRACE;
	DEBUG = log4js.DEBUG;
	INFO = log4js.INFO;
	WARN = log4js.WARN;
	ERROR = log4js.ERROR;
	FATAL = log4js.FATAL;
	OFF = log4js.OFF;
	getLogger = log4js.getLogger;
	getRootLogger = log4js.getRootLogger;
};
describe("Integration tests for is level enabled", () => {
	const checkEnabled = (
		logger,
		isTraceEnabledExpected,
		isDebugEnabledExpected,
		isInfoEnabledExpected,
		isWarnEnabledExpected,
		isErrorEnabledExpected,
		isFatalEnabledExpected
	) => {
		const isTraceEnabled = logger.isTraceEnabled();
		const isDebugEnabled = logger.isDebugEnabled();
		const isInfoEnabled = logger.isInfoEnabled();
		const isWarnEnabled = logger.isWarnEnabled();
		const isErrorEnabled = logger.isErrorEnabled();
		const isFatalEnabled = logger.isFatalEnabled();
		expect(isTraceEnabled).toBe(isTraceEnabledExpected);
		expect(isDebugEnabled).toBe(isDebugEnabledExpected);
		expect(isInfoEnabled).toBe(isInfoEnabledExpected);
		expect(isWarnEnabled).toBe(isWarnEnabledExpected);
		expect(isErrorEnabled).toBe(isErrorEnabledExpected);
		expect(isFatalEnabled).toBe(isFatalEnabledExpected);
	};
	beforeEach(resetModules);
	it("should not allow anything by default", () => {
		const logger = getLogger("test.test.test");
		checkEnabled(logger, false, false, false, false, false, false);
	});
	it("should not allow anything for root logger by default", () => {
		const rootLogger = getRootLogger();
		checkEnabled(rootLogger, false, false, false, false, false, false);
	});
	it("should allow INFO and higher for root logger", () => {
		const rootLogger = getRootLogger().setLevel(INFO);
		checkEnabled(rootLogger, false, false, true, true, true, true);
	});
	it("should allow warn and higher set in root logger", () => {
		getRootLogger().setLevel(WARN);
		const logger = getLogger("test.test.test");
		checkEnabled(logger, false, false, false, true, true, true);
	});
	it("should not allow anything overridden", () => {
		getRootLogger().setLevel(DEBUG);
		getLogger("test/test").setLevel(OFF);
		const logger = getLogger("test.test.test");
		checkEnabled(logger, false, false, false, false, false, false);
	});
	it("should allow ERROR and higher overridden", () => {
		getRootLogger().setLevel(TRACE);
		getLogger("test\\test").setLevel(ERROR);
		const logger = getLogger("test.test/test");
		checkEnabled(logger, false, false, false, false, true, true);
	});
	it("should allow ALL overridden (on target)", () => {
		getRootLogger().setLevel(FATAL);
		getLogger("test.test").setLevel(ERROR);
		const logger = getLogger("test.test.test").setLevel(ALL);
		checkEnabled(logger, true, true, true, true, true, true);
	});
	it("should perform complex test", () => {
		const rootLogger = getRootLogger().setLevel(FATAL);
		const testTestLogger = getLogger("test.test").setLevel(ERROR);
		const testTestTestLogger = getLogger("test.test.test").setLevel(ALL);
		getLogger("test.test.test.first").setLevel(OFF);
		const testTestTestFirstTestLogger = getLogger("test.test.test.first.test");
		getLogger("test.test.test.first.second").setLevel(TRACE);
		const testTestTestFirstSecondTestLogger = getLogger("test.test.test.first.second.test");
		checkEnabled(rootLogger, false, false, false, false, false, true);
		checkEnabled(testTestLogger, false, false, false, false, true, true);
		checkEnabled(testTestTestLogger, true, true, true, true, true, true);
		checkEnabled(testTestTestFirstTestLogger, false, false, false, false, false, false);
		checkEnabled(testTestTestFirstSecondTestLogger, true, true, true, true, true, true);
		getLogger("test.test.test.first").setLevel(INFO);
		checkEnabled(rootLogger, false, false, false, false, false, true);
		checkEnabled(testTestLogger, false, false, false, false, true, true);
		checkEnabled(testTestTestLogger, true, true, true, true, true, true);
		checkEnabled(testTestTestFirstTestLogger, false, false, true, true, true, true);
		checkEnabled(testTestTestFirstSecondTestLogger, true, true, true, true, true, true);
	});
});
describe("Integration tests for logging", () => {
	beforeEach(resetModules);
	it("should not log anything by default", () => {
		const appender = getMockFn(jest)(() => null, "appender");
		const logger = getLogger("test.test.test").setAppender(appender);
		logger.debug("first", "second");
		expect(appender).not.toBeCalled();
	});
	it("should be called for nested logger", () => {
		const appender = getMockFn(jest)(() => null, "appender");
		getRootLogger()
			.setLevel(DEBUG)
			.setAppender(appender);
		const logger = getLogger("test.test/test");
		logger.debug("first", "second");
		expect(appender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(appender, 1, "DEBUG", dateNow, "test.test.test", "first", "second");
	});
	it("should be called for explicit appender for nested logger", () => {
		const rootAppender = getMockFn(jest)(() => null, "rootAppender");
		getRootLogger()
			.setLevel(DEBUG)
			.setAppender(rootAppender);
		const appender = getMockFn(jest)(() => null, "appender");
		const logger = getLogger("test.test.test").setAppender(appender);
		logger.debug("first", "second");
		expect(appender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(appender, 1, "DEBUG", dateNow, "test.test.test", "first", "second");
		expect(rootAppender).not.toBeCalled();
	});
	it("should be called for nested logger of explicit appender for nested logger", () => {
		const rootAppender = getMockFn(jest)(() => null, "rootAppender");
		getRootLogger()
			.setLevel(DEBUG)
			.setAppender(rootAppender);
		const appender = getMockFn(jest)(() => null, "appender");
		getLogger("test.test.test").setAppender(appender);
		getLogger("test.test.test.first").debug("first", "second");
		expect(appender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(appender, 1, "DEBUG", dateNow, "test.test.test.first", "first", "second");
		expect(rootAppender).not.toBeCalled();
	});
	it("should not be called for nested logger of explicit appender for nested logger", () => {
		const rootAppender = getMockFn(jest)(() => null, "rootAppender");
		getRootLogger()
			.setLevel(DEBUG)
			.setAppender(rootAppender);
		const appender = getMockFn(jest)(() => null, "appender");
		getLogger("test.test.test").setAppender(appender);
		getLogger("test.test.test.first").setLevel(OFF);
		getLogger("test.test.test.first.second").debug("first", "second");
		expect(appender).not.toBeCalled();
		expect(rootAppender).not.toBeCalled();
	});
	it("should be called for nested logger of explicit appender for nested logger with level", () => {
		const rootAppender = getMockFn(jest)(() => null, "rootAppender");
		getRootLogger()
			.setLevel(DEBUG)
			.setAppender(rootAppender);
		const appender = getMockFn(jest)(() => null, "appender");
		getLogger("test.test.test").setAppender(appender);
		getLogger("test.test.test.first").setLevel(WARN);
		getLogger("test.test.test.first.second").error("first", "second");
		expect(appender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(appender, 1, "ERROR", dateNow, "test.test.test.first.second", "first", "second");
		expect(rootAppender).not.toBeCalled();
	});
	it("should perform complex test", () => {
		const rootAppender = getMockFn(jest)(() => null, "rootAppender");
		const rootLogger = getRootLogger()
			.setLevel(FATAL)
			.setAppender(rootAppender);
		const testAppender = getMockFn(jest)(() => null, "testAppender");
		const testLogger = getLogger("test").setAppender(testAppender);
		const testTestLogger = getLogger("test.test").setLevel(ERROR);
		const testTestTestAppender = getMockFn(jest)(() => null, "testTestTestAppender");
		const testTestTestLogger = getLogger("test.test.test")
			.setLevel(ALL)
			.setAppender(testTestTestAppender);
		getLogger("test.test.test.first").setLevel(OFF);
		const testTestTestFirstTestLogger = getLogger("test.test.test.first.test");
		const testTestTestFirstSecondAppender = getMockFn(jest)(() => null, "testTestTestFirstSecondAppender");
		getLogger("test.test.test.first.second")
			.setLevel(TRACE)
			.setAppender(testTestTestFirstSecondAppender);
		const testTestTestFirstSecondTestLogger = getLogger("test.test.test.first.second.test");

		rootLogger.debug("first", "second");
		rootLogger.fatal("first", "second", "third");
		testLogger.error("second", "first");
		testTestLogger.error("third", "second", "first");
		testTestTestLogger.trace("second");
		testTestTestFirstTestLogger.fatal("nothing");
		testTestTestFirstSecondTestLogger.trace("everything");
		expect(rootAppender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(rootAppender, 1, "FATAL", dateNow, "", "first", "second", "third");
		expect(testAppender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(testAppender, 1, "ERROR", dateNow, "test.test", "third", "second", "first");
		expect(testTestTestAppender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(testTestTestAppender, 1, "TRACE", dateNow, "test.test.test", "second");
		expect(testTestTestFirstSecondAppender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(
			testTestTestFirstSecondAppender,
			1,
			"TRACE",
			dateNow,
			"test.test.test.first.second.test",
			"everything"
		);
	});
});
