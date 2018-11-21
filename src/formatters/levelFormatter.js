import { getLevelString } from "../level/level";

const levelFormatter = levelStringFormatterFn => (level, date, category, ...args) => {
	let levelString = getLevelString(level);
	if (levelStringFormatterFn) {
		levelString = levelStringFormatterFn(levelString);
	}
	return [levelString, date, category, ...args];
};

export default levelFormatter;
