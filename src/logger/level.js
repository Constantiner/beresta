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

const methodsCache = {};
const capitalizedMethodsCache = {};
const levelStringsCache = {};
const levelIndicesCache = {};

const getFromCache = (cache, symbol) => cache[symbol];
const setToCache = (cache, symbol, value) => ((cache[symbol] = value), value);

const getLevelIndex = level =>
	getFromCache(levelIndicesCache, level) ||
	setToCache(levelIndicesCache, level, allValidLoggingSymbols.indexOf(level));

const mayUseLevel = (candidateLevel, useAgainstLevel) =>
	getLevelIndex(candidateLevel) >= getLevelIndex(useAgainstLevel);

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

const getLevelString = symbol =>
	getFromCache(levelStringsCache, symbol) ||
	setToCache(levelStringsCache, symbol, getMethodForSymbol(symbol).toUpperCase());

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
