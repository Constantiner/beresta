let tree;

const createTreeNode = (name, fullName, parent, loggerDescription) => {
	const node = {
		name: fullName,
		parent,
		loggerDescription,
		children: new Map()
	};
	if (parent) {
		parent.children.set(name, node);
	}
	return node;
};

const initTree = (rootCategory, rootLoggerDescription) => {
	tree = createTreeNode(rootCategory, rootCategory, null, rootLoggerDescription);
};

const getCategoryBreadcrumbs = category => category.split(".");

const resolveLevelsAndAppendersForNode = (node, levelResolved = false, appenderResolved = false) => {
	if (levelResolved && appenderResolved) {
		return;
	}
	[...node.children.values()].forEach(subNode => {
		let subLevelResolved = levelResolved;
		if (!subLevelResolved && subNode.loggerDescription) {
			if (subNode.loggerDescription.level) {
				subLevelResolved = true;
			} else {
				subNode.loggerDescription.levelDerived =
					node.loggerDescription.level || node.loggerDescription.levelDerived;
			}
		}
		let subAppenderResolved = appenderResolved;
		if (!subAppenderResolved && subNode.loggerDescription) {
			if (subNode.loggerDescription.appender) {
				subAppenderResolved = true;
			} else {
				subNode.loggerDescription.appenderDerived =
					node.loggerDescription.appender || node.loggerDescription.appenderDerived;
			}
		}
		resolveLevelsAndAppendersForNode(subNode, subLevelResolved, subAppenderResolved);
	});
};

const getNode = (category, isRootNode = false) => {
	if (isRootNode) {
		return tree;
	}
	const categoryBreadcrumbs = getCategoryBreadcrumbs(category);
	return categoryBreadcrumbs.reduce((currentNode, part) => currentNode.children.get(part), tree);
};

const addLoggerToHierarchy = (category, loggerDescription, isRoot = false) => {
	let node = isRoot
		? tree
		: getCategoryBreadcrumbs(category).reduce(
				({ currentNode, currentPath }, part) => {
					let node = currentNode.children.get(part);
					const newPath = [...currentPath, part];
					if (!node) {
						const name = newPath.join(".");
						const loggerDescription = {
							levelDerived:
								currentNode.loggerDescription.level || currentNode.loggerDescription.levelDerived,
							appenderDerived:
								currentNode.loggerDescription.appender || currentNode.loggerDescription.appenderDerived
						};
						node = createTreeNode(part, name, currentNode, loggerDescription);
					} else {
						const loggerDescription = node.loggerDescription;
						if (!loggerDescription) {
							const loggerDescription = {
								levelDerived:
									currentNode.loggerDescription.level || currentNode.loggerDescription.levelDerived,
								appenderDerived:
									currentNode.loggerDescription.appender ||
									currentNode.loggerDescription.appenderDerived
							};
							node.loggerDescription = loggerDescription;
						} else {
							loggerDescription.levelDerived =
								currentNode.loggerDescription.level || currentNode.loggerDescription.levelDerived;
							loggerDescription.appenderDerived =
								currentNode.loggerDescription.appender || currentNode.loggerDescription.appenderDerived;
						}
					}
					return { currentNode: node, currentPath: newPath };
				},
				{ currentNode: tree, currentPath: [] }
		  ).currentNode;
	const existingLoggerDescription = node.loggerDescription;
	if (existingLoggerDescription !== loggerDescription) {
		node.loggerDescription = Object.assign(loggerDescription, existingLoggerDescription);
	}
	resolveLevelsAndAppendersForNode(node);
};

const updateAppenderOrLevel = (category, isRoot = false) => {
	const node = getNode(category, isRoot);
	resolveLevelsAndAppendersForNode(node);
};

export { initTree, addLoggerToHierarchy, updateAppenderOrLevel };
