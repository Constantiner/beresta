import { TRACE, DEBUG, INFO, WARN, ERROR, FATAL } from "../../src/level/level";
import consoleAppender from "../../src/appenders/console";
import { getMockFn, mockFnArgumentsExpectations } from "../test-utils/jestMockFns";

const replaceConsoleMethods = (trace, debug, info, warn, error) => {
	global.console.warn = warn;
	global.console.trace = trace;
	global.console.debug = debug;
	global.console.info = info;
	global.console.error = error;
};
const createConsoleMocks = () => {
	const trace = getMockFn(jest)(() => {}, "trace");
	const debug = getMockFn(jest)(() => {}, "debug");
	const info = getMockFn(jest)(() => {}, "info");
	const warn = getMockFn(jest)(() => {}, "warn");
	const error = getMockFn(jest)(() => {}, "error");
	replaceConsoleMethods(trace, debug, info, warn, error);
	return { trace, debug, info, warn, error };
};
describe("Console appender tests", () => {
	it("should call console's trace without layout", () => {
		const { trace, debug, info, warn, error } = createConsoleMocks();
		const consoleApp = consoleAppender();
		const args = [TRACE, new Date(), "test.test", "first", "second"];
		consoleApp(...args);
		expect(trace).toBeCalledTimes(1);
		mockFnArgumentsExpectations(trace, 1, ...args);
		expect(debug).not.toBeCalled();
		expect(info).not.toBeCalled();
		expect(warn).not.toBeCalled();
		expect(error).not.toBeCalled();
	});
	it("should call console's debug without layout", () => {
		const { trace, debug, info, warn, error } = createConsoleMocks();
		const consoleApp = consoleAppender();
		const args = [DEBUG, new Date(), "test.test", "first", "second"];
		consoleApp(...args);
		expect(trace).not.toBeCalled();
		expect(debug).toBeCalledTimes(1);
		mockFnArgumentsExpectations(debug, 1, ...args);
		expect(info).not.toBeCalled();
		expect(warn).not.toBeCalled();
		expect(error).not.toBeCalled();
	});
	it("should call console's info without layout", () => {
		const { trace, debug, info, warn, error } = createConsoleMocks();
		const consoleApp = consoleAppender();
		const args = [INFO, new Date(), "test.test", "first", "second"];
		consoleApp(...args);
		expect(trace).not.toBeCalled();
		expect(debug).not.toBeCalled();
		expect(info).toBeCalledTimes(1);
		mockFnArgumentsExpectations(info, 1, ...args);
		expect(warn).not.toBeCalled();
		expect(error).not.toBeCalled();
	});
	it("should call console's warn without layout", () => {
		const { trace, debug, info, warn, error } = createConsoleMocks();
		const consoleApp = consoleAppender();
		const args = [WARN, new Date(), "test.test", "first", "second"];
		consoleApp(...args);
		expect(trace).not.toBeCalled();
		expect(debug).not.toBeCalled();
		expect(info).not.toBeCalled();
		expect(warn).toBeCalledTimes(1);
		mockFnArgumentsExpectations(warn, 1, ...args);
		expect(error).not.toBeCalled();
	});
	it("should call console's error without layout", () => {
		const { trace, debug, info, warn, error } = createConsoleMocks();
		const consoleApp = consoleAppender();
		const args = [ERROR, new Date(), "test.test", "first", "second"];
		consoleApp(...args);
		expect(trace).not.toBeCalled();
		expect(debug).not.toBeCalled();
		expect(info).not.toBeCalled();
		expect(warn).not.toBeCalled();
		expect(error).toBeCalledTimes(1);
		mockFnArgumentsExpectations(error, 1, ...args);
	});
	it("should call console's error for FATAL without layout", () => {
		const { trace, debug, info, warn, error } = createConsoleMocks();
		const consoleApp = consoleAppender();
		const args = [FATAL, new Date(), "test.test", "first", "second"];
		consoleApp(...args);
		expect(trace).not.toBeCalled();
		expect(debug).not.toBeCalled();
		expect(info).not.toBeCalled();
		expect(warn).not.toBeCalled();
		expect(error).toBeCalledTimes(1);
		mockFnArgumentsExpectations(error, 1, ...args);
	});
});
