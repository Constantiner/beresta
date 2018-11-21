const ALL = Symbol.for("@constantiner/beresta.ALL");
const TRACE = Symbol.for("@constantiner/beresta.TRACE");
const DEBUG = Symbol.for("@constantiner/beresta.DEBUG");
const INFO = Symbol.for("@constantiner/beresta.INFO");
const WARN = Symbol.for("@constantiner/beresta.WARN");
const ERROR = Symbol.for("@constantiner/beresta.ERROR");
const FATAL = Symbol.for("@constantiner/beresta.FATAL");
const OFF = Symbol.for("@constantiner/beresta.OFF");

const validForLoggingSymbols = [TRACE, DEBUG, INFO, WARN, ERROR, FATAL];
const allValidLoggingSymbols = [ALL, TRACE, DEBUG, INFO, WARN, ERROR, FATAL, OFF];

const isValidLevel = level => allValidLoggingSymbols.indexOf(level) > -1;

const mayUseLevel = (candidateLevel, useAgainstLevel) => {
	const useAgainstLevelIndex = allValidLoggingSymbols.indexOf(useAgainstLevel);
	const candidateLevelIndex = allValidLoggingSymbols.indexOf(candidateLevel);
	return candidateLevelIndex >= useAgainstLevelIndex;
};

const methodsCache = {};
const capitalizedMethodsCache = {};

const getFromCache = (cache, symbol) => cache[symbol];
const setToCache = (cache, symbol, str) => ((cache[symbol] = str), str);
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

const getMethodForSymbol = symbol =>
	getFromCache(methodsCache, symbol) ||
	setToCache(
		methodsCache,
		symbol,
		Symbol.keyFor(symbol)
			.split(".")
			.pop()
			.toLowerCase()
	);

const getCapitalizedMethodForSymbol = symbol =>
	getFromCache(capitalizedMethodsCache, symbol) ||
	setToCache(capitalizedMethodsCache, symbol, capitalize(getMethodForSymbol(symbol)));

const getLevelString = symbol => getMethodForSymbol(symbol).toUpperCase();

export {
	ALL,
	TRACE,
	DEBUG,
	INFO,
	WARN,
	ERROR,
	FATAL,
	OFF,
	getMethodForSymbol,
	getCapitalizedMethodForSymbol,
	validForLoggingSymbols,
	getLevelString,
	mayUseLevel,
	isValidLevel
};
