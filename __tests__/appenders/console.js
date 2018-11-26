import consoleAppender from "../../src/appenders/console";
import { DEBUG, ERROR, FATAL, INFO, TRACE, WARN } from "../../src/level/level";
import { getMockFn, mockFnArgumentsExpectations, mockFnExpectations } from "../test-utils/jestMockFns";

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
	it("should call console's debug with some layout", () => {
		const { trace, debug, info, warn, error } = createConsoleMocks();
		const layoutResult = ["first.first", "second.second"];
		const layout = getMockFn(jest)(() => layoutResult, "layout");
		const consoleApp = consoleAppender(layout);
		const args = [DEBUG, new Date(), "test.test", "first", "second"];
		consoleApp(...args);
		expect(trace).not.toBeCalled();
		expect(debug).toBeCalledTimes(1);
		mockFnArgumentsExpectations(debug, 1, ...layoutResult);
		expect(info).not.toBeCalled();
		expect(warn).not.toBeCalled();
		expect(error).not.toBeCalled();
		expect(layout).toBeCalledTimes(1);
		mockFnExpectations(layout, 1, layoutResult, ...args);
	});
	it("shouldn't work with console's debug and layout returning not array", () => {
		const { trace, debug, info, warn, error } = createConsoleMocks();
		const layoutResult = 1;
		const layout = getMockFn(jest)(() => layoutResult, "layout");
		const consoleApp = consoleAppender(layout);
		const args = [DEBUG, new Date(), "test.test", "first", "second"];
		try {
			consoleApp(...args);
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(trace).not.toBeCalled();
			expect(debug).not.toBeCalled();
			expect(info).not.toBeCalled();
			expect(warn).not.toBeCalled();
			expect(error).not.toBeCalled();
			expect(layout).toBeCalledTimes(1);
			mockFnExpectations(layout, 1, layoutResult, ...args);
		}
	});
	it("shouldn't work with invalid layout function", () => {
		const invalidLayout = "Invalid layout function";
		try {
			consoleAppender(invalidLayout);
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid layout function ${invalidLayout}`);
		}
	});
});
