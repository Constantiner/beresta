import dateFormatter from "../../src/formatters/dateFormatter";
import { TRACE } from "../../src/level/level";

const YEAR = 2018;
const MONTH = 5;
const DAY = 14;
const HOURS = 16;
const MINUTES = 23;
const SECONDS = 41;
const MS = 234;
const createDate = () => new Date(YEAR, MONTH, DAY, HOURS, MINUTES, SECONDS, MS);

describe("Date formatter tests", () => {
	it("should convert date to string without formatter", () => {
		const formatter = dateFormatter();
		const baseArgs = ["test.test", "first", "second"];
		const args = [TRACE, createDate(), ...baseArgs];
		const [resultingLevel, resultingFormattedDate, ...resultingBaseArgs] = formatter(...args);
		expect(resultingLevel).toEqual(TRACE);
		expect(resultingFormattedDate).toMatch(
			new RegExp(
				`^${YEAR}-${(MONTH + 1)
					.toString()
					.padStart(2, "0")}-${DAY}T${HOURS}:${MINUTES}:${SECONDS}.${MS}[+-]\\d{2}:\\d{2}$`,
				"m"
			)
		);
		expect(resultingBaseArgs).toEqual(baseArgs);
	});
	it("should convert date to string with formatter", () => {
		const formatter = dateFormatter("DD MMM YYYY HH:mm:ss,SSS");
		const baseArgs = ["test.test", "first", "second"];
		const args = [TRACE, createDate(), ...baseArgs];
		const [resultingLevel, resultingFormattedDate, ...resultingBaseArgs] = formatter(...args);
		expect(resultingLevel).toEqual(TRACE);
		expect(resultingFormattedDate).toBe("14 Jun 2018 16:23:41,234");
		expect(resultingBaseArgs).toEqual(baseArgs);
	});
	it("shouldn't return convert function with invalid formatter", () => {
		const additionalFormatter = "invalidFormatter";
		try {
			dateFormatter("DD MMM YYYY HH:mm:ss,SSS", additionalFormatter);
			expect(false).toBe(true);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`Invalid formatter ${additionalFormatter}`);
		}
	});
	it("should convert date to string with additional formatting", () => {
		const additionalFormatter = levelString => `[${levelString.padEnd(30, ".")}]`;
		const formatter = dateFormatter("DD MMM YYYY HH:mm:ss,SSS", additionalFormatter);
		const baseArgs = ["test.test", "first", "second"];
		const args = [TRACE, createDate(), ...baseArgs];
		const [resultingLevel, resultingFormattedDate, ...resultingBaseArgs] = formatter(...args);
		expect(resultingLevel).toEqual(TRACE);
		expect(resultingFormattedDate).toBe("[14 Jun 2018 16:23:41,234......]");
		expect(resultingBaseArgs).toEqual(baseArgs);
	});
});
