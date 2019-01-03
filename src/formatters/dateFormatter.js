import { format } from "date-fns";
import { funcSafetyCheck } from "../util/isFunction";

const dateFormatter = (dateFormat, dateStringFormatterFn) =>
	funcSafetyCheck(dateStringFormatterFn, `Invalid formatter ${dateStringFormatterFn}`, true)(
		(level, date, category, ...args) => {
			let dateString = format(date, dateFormat);
			if (dateStringFormatterFn) {
				dateString = dateStringFormatterFn(dateString);
			}
			return [level, dateString, category, ...args];
		}
	);

export default dateFormatter;
