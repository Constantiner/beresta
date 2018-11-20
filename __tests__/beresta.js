import { getMockFn, mockFnArgumentsExpectations } from "./test-utils/jestMockFns";

let ALL, TRACE, DEBUG, INFO, WARN, ERROR, FATAL, OFF, getLogger, getRootLogger, dateNow;
const resetModules = () => {
	jest.clearAllMocks().resetModules();
	dateNow = new Date();
	const getDateNow = () => dateNow;
	const dateUtil = require("../src/util/dateUtil");
	dateUtil.getNow = getDateNow;
	const beresta = require("../src/beresta");
	ALL = beresta.ALL;
	TRACE = beresta.TRACE;
	DEBUG = beresta.DEBUG;
	INFO = beresta.INFO;
	WARN = beresta.WARN;
	ERROR = beresta.ERROR;
	FATAL = beresta.FATAL;
	OFF = beresta.OFF;
	getLogger = beresta.getLogger;
	getRootLogger = beresta.getRootLogger;
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
		const logger = getRootLogger()
			.setLevel(WARN)
			.getLogger("test.test.test");
		checkEnabled(logger, false, false, false, true, true, true);
	});
	it("should not allow anything overridden", () => {
		const logger = getRootLogger()
			.setLevel(DEBUG)
			.getLogger("test/test")
			.setLevel(OFF)
			.getLogger("test.test.test");
		checkEnabled(logger, false, false, false, false, false, false);
	});
	it("should allow ERROR and higher overridden", () => {
		const logger = getRootLogger()
			.setLevel(TRACE)
			.getLogger("test\\test")
			.setLevel(ERROR)
			.getLogger("test.test/test");
		checkEnabled(logger, false, false, false, false, true, true);
	});
	it("should allow ALL overridden (on target)", () => {
		const logger = getRootLogger()
			.setLevel(FATAL)
			.getLogger("test.test")
			.setLevel(ERROR)
			.getLogger("test.test.test")
			.setLevel(ALL);
		checkEnabled(logger, true, true, true, true, true, true);
	});
	it("should allow ALL overridden (on target) alternative order", () => {
		const logger = getLogger("test.test")
			.setLevel(ERROR)
			.getRootLogger()
			.setLevel(FATAL)
			.getLogger("test.test.test")
			.setLevel(ALL);
		checkEnabled(logger, true, true, true, true, true, true);
	});
	it("should perform complex test", () => {
		const testTestTestTestLogger = getLogger("test.test.test.test").setLevel(ALL);
		const testTestTestLogger = getLogger("test.test.test.test.first")
			.setLevel(OFF)
			.getLogger("test.test.test")
			.setLevel(ERROR);
		const testTestTestTestFirstTestLogger = getLogger("test.test.test.test.first.second")
			.setLevel(TRACE)
			.getLogger("test.test.test.test.first.test");
		const testTestTestTestFirstSecondTestLogger = getLogger("test.test.test.test.first.second.test");
		const rootLogger = getRootLogger().setLevel(FATAL);
		checkEnabled(rootLogger, false, false, false, false, false, true);
		checkEnabled(testTestTestLogger, false, false, false, false, true, true);
		checkEnabled(testTestTestTestLogger, true, true, true, true, true, true);
		checkEnabled(testTestTestTestFirstTestLogger, false, false, false, false, false, false);
		checkEnabled(testTestTestTestFirstSecondTestLogger, true, true, true, true, true, true);
		getLogger("test.test.test.test.first").setLevel(INFO);
		checkEnabled(rootLogger, false, false, false, false, false, true);
		checkEnabled(testTestTestLogger, false, false, false, false, true, true);
		checkEnabled(testTestTestTestLogger, true, true, true, true, true, true);
		checkEnabled(testTestTestTestFirstTestLogger, false, false, true, true, true, true);
		checkEnabled(testTestTestTestFirstSecondTestLogger, true, true, true, true, true, true);
		rootLogger.setLevel(ALL);
		checkEnabled(rootLogger, true, true, true, true, true, true);
		checkEnabled(testTestTestLogger, false, false, false, false, true, true);
		checkEnabled(testTestTestTestLogger, true, true, true, true, true, true);
		checkEnabled(testTestTestTestFirstTestLogger, false, false, true, true, true, true);
		checkEnabled(testTestTestTestFirstSecondTestLogger, true, true, true, true, true, true);
	});
});
describe("Integration tests for appenders", () => {
	beforeEach(resetModules);
	it("should not log anything by default", () => {
		const appender = getMockFn(jest)(() => null, "appender");
		getLogger("test.test.test")
			.setAppender(appender)
			.debug("first", "second");
		expect(appender).not.toBeCalled();
	});
	it("should be called for nested logger", () => {
		const appender = getMockFn(jest)(() => null, "appender");
		getRootLogger()
			.setLevel(DEBUG)
			.setAppender(appender)
			.getLogger("test.test/test")
			.debug("first", "second");
		expect(appender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(appender, 1, "DEBUG", dateNow, "test.test.test", "first", "second");
	});
	it("should be called for explicit appender for nested logger", () => {
		const rootAppender = getMockFn(jest)(() => null, "rootAppender");
		const appender = getMockFn(jest)(() => null, "appender");
		getRootLogger()
			.setLevel(DEBUG)
			.setAppender(rootAppender)
			.getLogger("test.test.test")
			.setAppender(appender)
			.debug("first", "second");
		expect(appender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(appender, 1, "DEBUG", dateNow, "test.test.test", "first", "second");
		expect(rootAppender).not.toBeCalled();
	});
	it("should be called for nested logger of explicit appender for nested logger", () => {
		const rootAppender = getMockFn(jest)(() => null, "rootAppender");
		const appender = getMockFn(jest)(() => null, "appender");
		getRootLogger()
			.setLevel(DEBUG)
			.setAppender(rootAppender)
			.getLogger("test.test.test")
			.setAppender(appender)
			.getLogger("test.test.test.first")
			.debug("first", "second");
		expect(appender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(appender, 1, "DEBUG", dateNow, "test.test.test.first", "first", "second");
		expect(rootAppender).not.toBeCalled();
	});
	it("should not be called for nested logger of explicit appender for nested logger", () => {
		const rootAppender = getMockFn(jest)(() => null, "rootAppender");
		const appender = getMockFn(jest)(() => null, "appender");
		getRootLogger()
			.setLevel(DEBUG)
			.setAppender(rootAppender)
			.getLogger("test.test.test")
			.setAppender(appender)
			.getLogger("test.test.test.first")
			.setLevel(OFF)
			.getLogger("test.test.test.first.second")
			.debug("first", "second");
		expect(appender).not.toBeCalled();
		expect(rootAppender).not.toBeCalled();
	});
	it("should be called for nested logger of explicit appender for nested logger with level", () => {
		const rootAppender = getMockFn(jest)(() => null, "rootAppender");
		const appender = getMockFn(jest)(() => null, "appender");
		getRootLogger()
			.setLevel(DEBUG)
			.setAppender(rootAppender)
			.getLogger("test.test.test")
			.setAppender(appender)
			.getLogger("test.test.test.first")
			.setLevel(WARN)
			.getLogger("test.test.test.first.second")
			.error("first", "second");
		expect(appender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(appender, 1, "ERROR", dateNow, "test.test.test.first.second", "first", "second");
		expect(rootAppender).not.toBeCalled();
	});
	it("should perform complex test", () => {
		const testAppender = getMockFn(jest)(() => null, "testAppender");
		const testLogger = getLogger("test").setAppender(testAppender);
		const testTestLogger = getLogger("test.test").setLevel(ERROR);
		const testTestTestAppender = getMockFn(jest)(() => null, "testTestTestAppender");
		const testTestTestLogger = getLogger("test.test.test")
			.setLevel(ALL)
			.setAppender(testTestTestAppender);
		const testTestTestFirstTestLogger = getLogger("test.test.test.first")
			.setLevel(OFF)
			.getLogger("test.test.test.first.test");
		const testTestTestFirstSecondAppender = getMockFn(jest)(() => null, "testTestTestFirstSecondAppender");
		const rootAppender = getMockFn(jest)(() => null, "rootAppender");
		const rootLogger = getRootLogger()
			.setLevel(FATAL)
			.setAppender(rootAppender);
		const testTestTestFirstSecondTestLogger = getLogger("test.test.test.first.second")
			.setLevel(TRACE)
			.setAppender(testTestTestFirstSecondAppender)
			.getLogger("test.test.test.first.second.test");
		const testTestTestAppender2 = getMockFn(jest)(() => null, "testTestTestAppender2");
		const rootAppender2 = getMockFn(jest)(() => null, "rootAppender2");

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
		expect(testTestTestAppender2).not.toBeCalled();
		expect(rootAppender2).not.toBeCalled();

		rootAppender.mockClear();
		testAppender.mockClear();
		testTestTestAppender2.mockClear();
		testTestTestFirstSecondAppender.mockClear();
		testTestTestAppender.mockClear();
		rootAppender2.mockClear();

		testTestTestLogger.setAppender(testTestTestAppender2);
		rootLogger
			.setAppender(rootAppender2)
			.debug("first", "second")
			.fatal("first", "second", "third");
		testLogger.error("second", "first");
		testTestLogger.error("third", "second", "first");
		testTestTestLogger.trace("second");
		testTestTestFirstTestLogger.fatal("nothing");
		testTestTestFirstSecondTestLogger.trace("everything");
		expect(rootAppender2).toBeCalledTimes(1);
		mockFnArgumentsExpectations(rootAppender2, 1, "FATAL", dateNow, "", "first", "second", "third");
		expect(testAppender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(testAppender, 1, "ERROR", dateNow, "test.test", "third", "second", "first");
		expect(testTestTestAppender2).toBeCalledTimes(1);
		mockFnArgumentsExpectations(testTestTestAppender2, 1, "TRACE", dateNow, "test.test.test", "second");
		expect(testTestTestFirstSecondAppender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(
			testTestTestFirstSecondAppender,
			1,
			"TRACE",
			dateNow,
			"test.test.test.first.second.test",
			"everything"
		);
		expect(testTestTestAppender).not.toBeCalled();
		expect(rootAppender).not.toBeCalled();
	});
});
describe("General integration tests", () => {
	beforeEach(resetModules);
	it("should not accept invalid levels", () => {
		const invalidLevel = "ERROR";
		try {
			getLogger("test.test.test").setLevel(invalidLevel);
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid level ${invalidLevel}`);
		}
	});
	it("should not accept setLevel without level", () => {
		try {
			getLogger("test.test.test").setLevel();
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid level ${undefined}`);
		}
	});
	it("should not accept setLevel with null", () => {
		try {
			getLogger("test.test.test").setLevel(null);
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid level ${null}`);
		}
	});
	it("should not accept setAppender without appender", () => {
		try {
			getLogger("test.test.test").setAppender();
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid appender ${undefined}`);
		}
	});
	it("should not accept setAppender with null", () => {
		try {
			getLogger("test.test.test").setAppender(null);
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid appender ${null}`);
		}
	});
	it("should not accept setAppender which is not a function", () => {
		const invalidAppender = [1, 2, 3];
		try {
			getLogger("test.test.test").setAppender(invalidAppender);
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid appender ${invalidAppender}`);
		}
	});
	it("should work fine without appenders", () => {
		const rootLogger = getRootLogger().setLevel(ALL);
		const logger = rootLogger.debug("test");
		expect(logger).toBe(rootLogger);
	});
});
