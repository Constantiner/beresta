import levelFormatter from "../../src/formatters/levelFormatter";
import { ERROR, INFO, TRACE } from "../../src/level/level";

describe("Level formatter tests", () => {
	it("should convert level to string", () => {
		const formatter = levelFormatter();
		const baseArgs = [new Date(), "test.test", "first", "second"];
		const args = [TRACE, ...baseArgs];
		const resultingArgs = formatter(...args);
		expect(resultingArgs).toEqual(["TRACE", ...baseArgs]);
	});
	it("shouldn't return convert function with invalid formatter", () => {
		const additionalFormatter = "invalidFormatter";
		try {
			levelFormatter(additionalFormatter);
			expect(false).toBe(true);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid formatter ${additionalFormatter}`);
		}
	});
	it("should convert level to string with additional formatting", () => {
		const additionalFormatter = levelString => `[${levelString.padEnd(10, ".")}]`;
		const formatter = levelFormatter(additionalFormatter);
		const baseArgs = [new Date(), "test.test", "first", "second"];
		const args = [TRACE, ...baseArgs];
		const resultingArgs = formatter(...args);
		expect(resultingArgs).toEqual(["[TRACE.....]", ...baseArgs]);
	});
	it("should convert level to string with additional formatting to cut", () => {
		const additionalFormatter = levelString => `[${levelString.substr(0, 3).padEnd(3, " ")}]`;
		const formatter = levelFormatter(additionalFormatter);
		const baseArgs = [new Date(), "test.test", "first", "second"];
		const args = [ERROR, ...baseArgs];
		const resultingArgs = formatter(...args);
		expect(resultingArgs).toEqual(["[ERR]", ...baseArgs]);
	});
	it("should convert level to string with additional formatting to extend", () => {
		const additionalFormatter = levelString => `[${levelString.substr(0, 5).padEnd(5, " ")}]`;
		const formatter = levelFormatter(additionalFormatter);
		const baseArgs = [new Date(), "test.test", "first", "second"];
		const args = [INFO, ...baseArgs];
		const resultingArgs = formatter(...args);
		expect(resultingArgs).toEqual(["[INFO ]", ...baseArgs]);
	});
});
