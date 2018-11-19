import { getNow } from "../../src/util/dateUtil";

describe("Date util tests", () => {
	it("should return date", () => {
		const now = getNow();
		expect(now).toBeInstanceOf(Date);
	});
});
