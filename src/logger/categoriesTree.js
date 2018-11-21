let tree;

const createTreeNode = (name, fullName, parent, loggerDescription) => {
	const node = {
		name: fullName,
		parent,
		loggerDescription,
		children: {}
	};
	if (parent) {
		parent.children[name] = node;
	}
	return node;
};

const initTree = (rootCategory, rootLoggerDescription) => {
	tree = createTreeNode(rootCategory, rootCategory, null, rootLoggerDescription);
};

const getCategoryBreadcrumbs = category => category.split(".");

const setDerivedAppender = (targetLoggerDescription, sourceLoggerDescription) => (
	(targetLoggerDescription.appenderDerived =
		sourceLoggerDescription.appender || sourceLoggerDescription.appenderDerived),
	false
);

const proceedChildAppender = (targetLoggerDescription, sourceLoggerDescription, appenderResolved) =>
	appenderResolved ||
	targetLoggerDescription.appender ||
	setDerivedAppender(targetLoggerDescription, sourceLoggerDescription);

const setDerivedLevel = (targetLoggerDescription, sourceLoggerDescription) => (
	(targetLoggerDescription.levelDerived = sourceLoggerDescription.level || sourceLoggerDescription.levelDerived),
	false
);

const proceedChildLevel = (targetLoggerDescription, sourceLoggerDescription, levelResolved) =>
	levelResolved || targetLoggerDescription.level || setDerivedLevel(targetLoggerDescription, sourceLoggerDescription);

const proceedChildren = (parentNode, levelResolved, appenderResolved) => subNode =>
	resolveLevelsAndAppendersForNode(
		subNode,
		proceedChildLevel(subNode.loggerDescription, parentNode.loggerDescription, levelResolved),
		proceedChildAppender(subNode.loggerDescription, parentNode.loggerDescription, appenderResolved)
	);

const resolveLevelsAndAppendersForNode = (node, isLevelResolved, isAppenderResolved) =>
	(isLevelResolved && isAppenderResolved) ||
	Object.values(node.children).forEach(proceedChildren(node, isLevelResolved, isAppenderResolved));

const getNode = (category, isRootNode) => {
	if (isRootNode) {
		return tree;
	}
	const categoryBreadcrumbs = getCategoryBreadcrumbs(category);
	return categoryBreadcrumbs.reduce((currentNode, part) => currentNode.children[part], tree);
};

const goToChildReducer = ({ currentNode, currentPath }, part) => {
	let node = currentNode.children[part];
	const newPath = [...currentPath, part];
	if (!node) {
		const name = newPath.join(".");
		const loggerDescription = {
			levelDerived: currentNode.loggerDescription.level || currentNode.loggerDescription.levelDerived,
			appenderDerived: currentNode.loggerDescription.appender || currentNode.loggerDescription.appenderDerived
		};
		node = createTreeNode(part, name, currentNode, loggerDescription);
	}
	return { currentNode: node, currentPath: newPath };
};

const addLoggerToHierarchy = (category, loggerDescription, isRoot) => {
	let node = isRoot
		? tree
		: getCategoryBreadcrumbs(category).reduce(goToChildReducer, { currentNode: tree, currentPath: [] }).currentNode;
	const existingLoggerDescription = node.loggerDescription;
	if (existingLoggerDescription !== loggerDescription) {
		node.loggerDescription = Object.assign(loggerDescription, existingLoggerDescription);
	}
	resolveLevelsAndAppendersForNode(node);
};

const updateAppenderOrLevel = (category, isRoot) => {
	const node = getNode(category, isRoot);
	resolveLevelsAndAppendersForNode(node);
};

export { initTree, addLoggerToHierarchy, updateAppenderOrLevel };
