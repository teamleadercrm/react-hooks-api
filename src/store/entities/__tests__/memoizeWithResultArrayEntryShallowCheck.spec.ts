import { memoizeWithResultArrayEntryShallowCheck } from '../memoizeWithResultArrayEntryShallowCheck';

describe('memoizeWithResultArrayEntryShallowCheck', () => {
  it('does a shallow equality check on the arguments', () => {
    const aFunction = (argument) => {
      return {};
    };
    const memoizedFunction = memoizeWithResultArrayEntryShallowCheck(aFunction);

    // We use a string because a shallow compare will result in true
    const firstResult = memoizedFunction('argument');
    const secondResult = memoizedFunction('argument');
    expect(firstResult).toBe(secondResult);

    // Test with objects to make sure we don't do deep equality checks
    const firstResultWithObject = memoizedFunction({});
    const secondResultWithObject = memoizedFunction({});
    expect(firstResultWithObject).not.toBe(secondResultWithObject);
  });

  it('shallowly compares the entries of an array when the result is an array', () => {
    const aFunctionWithShallowArrayEntries = (argument) => {
      return ['test', 'test2'];
    };
    const memoizedFunction = memoizeWithResultArrayEntryShallowCheck(aFunctionWithShallowArrayEntries);

    // We use a different argument in order to trigger
    // the result equality check
    const firstResult = memoizedFunction({});
    const secondResult = memoizedFunction({});
    expect(firstResult).toBe(secondResult);

    const aFunctionWithObjectArrayEntries = (argument) => {
      return [{}, {}];
    };
    const memoizedFunctionWithObjects = memoizeWithResultArrayEntryShallowCheck(aFunctionWithObjectArrayEntries);

    const firstResultWithObjects = memoizedFunctionWithObjects({});
    const secondResultWithObjects = memoizedFunctionWithObjects({});
    expect(firstResultWithObjects).not.toBe(secondResultWithObjects);
  });
});
