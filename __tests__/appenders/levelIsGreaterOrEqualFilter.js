import levelIsGreaterOrEqualFilterAppender from "../../src/appenders/levelIsGreaterOrEqualFilter";
import { ALL, DEBUG, ERROR, FATAL, INFO, OFF, TRACE, WARN } from "../../src/level/level";
import { getMockFn, mockFnArgumentsExpectations } from "../test-utils/jestMockFns";

describe("levelIsGreaterOrEqualFilter appender tests", () => {
	it("should throw an error for invalid level", () => {
		const invalidLevel = "Something";
		try {
			levelIsGreaterOrEqualFilterAppender(invalidLevel);
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid level ${invalidLevel}`);
		}
	});
	it("should throw an error without arguments", () => {
		try {
			levelIsGreaterOrEqualFilterAppender();
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid level ${undefined}`);
		}
	});
	it("should throw an error with null level", () => {
		try {
			levelIsGreaterOrEqualFilterAppender(null);
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid level ${null}`);
		}
	});
	it("should throw an error without appender", () => {
		try {
			levelIsGreaterOrEqualFilterAppender(TRACE);
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid appender ${undefined}`);
		}
	});
	it("should throw an error with null appender", () => {
		try {
			levelIsGreaterOrEqualFilterAppender(OFF, null);
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid appender ${null}`);
		}
	});
	it("should throw an error with invalid appender", () => {
		const invalidAppender = "test";
		try {
			levelIsGreaterOrEqualFilterAppender(FATAL, invalidAppender);
			expect(true).toBe(false);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid appender ${invalidAppender}`);
		}
	});
	it("should call appender with the same level", () => {
		const appender = getMockFn(jest)(() => {}, "appender");
		const filterAppender = levelIsGreaterOrEqualFilterAppender(ERROR, appender);
		const args = [ERROR, new Date(), "test.test", "first", "second"];
		filterAppender(...args);
		expect(appender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(appender, 1, ...args);
	});
	it("should call appender with greater level", () => {
		const appender = getMockFn(jest)(() => {}, "appender");
		const filterAppender = levelIsGreaterOrEqualFilterAppender(ALL, appender);
		const args = [DEBUG, new Date(), "test.test", "first", "second"];
		filterAppender(...args);
		expect(appender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(appender, 1, ...args);
	});
	it("shouldn't call appender with less level", () => {
		const appender = getMockFn(jest)(() => {}, "appender");
		const filterAppender = levelIsGreaterOrEqualFilterAppender(WARN, appender);
		const args = [INFO, new Date(), "test.test", "first", "second"];
		filterAppender(...args);
		expect(appender).not.toBeCalled();
	});
});
