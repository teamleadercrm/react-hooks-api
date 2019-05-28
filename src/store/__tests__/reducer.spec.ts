import reducer, { State } from '../reducer';
import { cacheQueryResult } from '../actions';
import generateQueryCacheKey from '../../utils/generateQueryCacheKey';

const getInitialState = (initial?: Partial<State>) => reducer(initial as State, {} as any);

describe('reducer', () => {
  it('initial', () => {
    const INITIAL_STATE = getInitialState();
    expect(INITIAL_STATE).toMatchSnapshot();
  });

  it('CACHE_QUERY_RESULT', () => {
    const INITIAL_STATE = getInitialState();

    const payload = {
      domain: 'users',
      action: 'list',
      options: {},
      data: { data: {} },
    };

    const key = generateQueryCacheKey({
      domain: payload.domain,
      action: payload.action,
      options: payload.options,
    });

    const resultState = {
      queries: {
        [key]: payload.data,
      },
    };

    expect(reducer(INITIAL_STATE, cacheQueryResult(payload))).toEqual(resultState);
  });
});
