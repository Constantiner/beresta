import combineAppender from "../../src/appenders/combine";
import { DEBUG, TRACE } from "../../src/level/level";
import { getMockFn, mockFnArgumentsExpectations } from "../test-utils/jestMockFns";

describe("Combine appender tests", () => {
	it("should throw a error without appenders", () => {
		const args = [TRACE, new Date(), "test.test", "first", "second"];
		try {
			const appender = combineAppender();
			expect(false).toBe(true);
			appender(...args);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe("You should provide at least one appender to combine");
		}
	});
	it("should work with single appender to combine", () => {
		const subAppender = getMockFn(jest)(() => {}, "subAppender");
		const args = [DEBUG, new Date(), "test.test", "first", "second"];
		const appender = combineAppender(subAppender);
		appender(...args);
		expect(subAppender).toBeCalledTimes(1);
		mockFnArgumentsExpectations(subAppender, 1, ...args);
	});
	it("should work with some appenders to combine", () => {
		const subAppender1 = getMockFn(jest)(() => {}, "subAppender1");
		const subAppender2 = getMockFn(jest)(() => {}, "subAppender2");
		const subAppender3 = getMockFn(jest)(() => {}, "subAppender3");
		const args = [DEBUG, new Date(), "test.test", "first", "second"];
		const appender = combineAppender(subAppender1, subAppender2, subAppender3);
		appender(...args);
		expect(subAppender1).toBeCalledTimes(1);
		mockFnArgumentsExpectations(subAppender1, 1, ...args);
		expect(subAppender2).toBeCalledTimes(1);
		mockFnArgumentsExpectations(subAppender2, 1, ...args);
		expect(subAppender3).toBeCalledTimes(1);
		mockFnArgumentsExpectations(subAppender3, 1, ...args);
	});
});
