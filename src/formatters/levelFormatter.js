import { getLevelString } from "../level/level";
import { funcSafetyCheck } from "../util/isFunction";

const levelFormatter = levelStringFormatterFn =>
	funcSafetyCheck(levelStringFormatterFn, `Invalid formatter ${levelStringFormatterFn}`, true)(
		(level, date, category, ...args) => {
			let levelString = getLevelString(level);
			if (levelStringFormatterFn) {
				levelString = levelStringFormatterFn(levelString);
			}
			return [levelString, date, category, ...args];
		}
	);

export default levelFormatter;
