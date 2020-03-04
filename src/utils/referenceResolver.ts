const convertPathToKeys = (path: string) => {
  return path.split('.');
};

const resolveForCondition = (condition: (item: object | object[]) => boolean) => (object: object, keys: string[]) => {
  try {
    const item = object[keys[0]];

    // Item isn't an object, no point in digging deeper
    if (item === null || typeof item !== 'object') {
      return null;
    }

    if (condition(item)) {
      return item;
    }

    const nextKeys = keys.filter((_, index) => index !== 0);

    // No more paths to look for, we've run out of keys
    if (nextKeys.length === 0) {
      return null;
    }

    // if the item is an array, we need to dig deeper for possible references
    if (Array.isArray(item)) {
      return item.map(arrayItem =>
        resolveForCondition(condition)(arrayItem, nextKeys)
      );
    }

    // remove first key from array, we've checked it, keep digging deeper
    return resolveForCondition(condition)(item, nextKeys);
  } catch (exception) {
    throw new Error("Couldn't resolve path for object");
  }
};

const isRelationship = (item: object) => {
  if (typeof item !== 'object') {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(item, 'type') && Object.prototype.hasOwnProperty.call(item, 'id');
};

const isListOfRelationships = (item: object | object[]) => {
  if (!Array.isArray(item)) {
    return false;
  }

  return isRelationship(item[0]);
};

const resolveReferences = resolveForCondition(item => isListOfRelationships(item) || isRelationship(item));

export { convertPathToKeys };
export default resolveReferences;
