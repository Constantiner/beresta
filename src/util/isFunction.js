const isFunction = fn => typeof fn === "function";

const identity = fn => fn;

const funcSafetyCheckAllowingNoFunction = (fn, message) => {
	if (fn && !isFunction(fn)) {
		throw new Error(message);
	}
	return identity;
};

const strictFuncSafetyCheck = (fn, message) => {
	if (!isFunction(fn)) {
		throw new Error(message);
	}
	return identity;
};

const funcSafetyCheck = (fn, message, noFunctionIsAcceptable) =>
	noFunctionIsAcceptable ? funcSafetyCheckAllowingNoFunction(fn, message) : strictFuncSafetyCheck(fn, message);

export { isFunction, funcSafetyCheck };
