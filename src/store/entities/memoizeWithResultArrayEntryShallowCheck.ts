const shallow = (previous: any, next: any) => {
  return previous === next;
};

const shallowOnArray = (previous: any, next: any) => {
  if (Array.isArray(previous) && Array.isArray(next)) {
    return previous.every((item, index) => shallow(item, next[index]));
  }

  /**
   * return false because we only want to support
   * a shallow check on array entries, if the result
   * is not an array (shallow / different object)
   * we should return a new result
   */
  return false;
};

export const memoizeWithResultArrayEntryShallowCheck = (func: (...args: any[]) => any) => {
  let lastArgs: any[] | null = null;
  let lastResult: any | null = null;
  return (...args: any[]) => {
    if (
      lastArgs !== null &&
      lastArgs.length === args.length &&
      args.every((value, index) => shallow(value, lastArgs![index]))
    ) {
      return lastResult;
    }
    lastArgs = args;
    const result = func(...args);
    return shallowOnArray(lastResult, result) ? lastResult : (lastResult = result);
  };
};
