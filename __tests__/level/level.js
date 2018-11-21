import {
	DEBUG,
	ERROR,
	FATAL,
	getCapitalizedMethodForSymbol,
	getLevelString,
	getMethodForSymbol,
	WARN
} from "../../src/level/level";

describe("Level tests", () => {
	it("should return debug for DEBUG as method name", () => {
		const expected = "debug";
		const result = getMethodForSymbol(DEBUG);
		expect(result).toBe(expected);
	});
	it("should return warn for WARN as method name twice to test cache", () => {
		const expected = "warn";
		const result1 = getMethodForSymbol(WARN);
		const result2 = getMethodForSymbol(WARN);
		expect(result1).toBe(expected);
		expect(result2).toBe(expected);
	});
	it("should return Error for ERROR as capitalized method name", () => {
		const expected = "Error";
		const result = getCapitalizedMethodForSymbol(ERROR);
		expect(result).toBe(expected);
	});
	it("should return Fatal for FATAL as capitalized method name twice to test cache", () => {
		const expected = "Fatal";
		const result1 = getCapitalizedMethodForSymbol(FATAL);
		const result2 = getCapitalizedMethodForSymbol(FATAL);
		expect(result1).toBe(expected);
		expect(result2).toBe(expected);
	});
	it("should return Error for ERROR as level string", () => {
		const expected = "ERROR";
		const result = getLevelString(ERROR);
		expect(result).toBe(expected);
	});
	it("should return Fatal for FATAL as level string twice to test cache", () => {
		const expected = "FATAL";
		const result1 = getLevelString(FATAL);
		const result2 = getLevelString(FATAL);
		expect(result1).toBe(expected);
		expect(result2).toBe(expected);
	});
});
