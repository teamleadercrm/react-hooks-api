import reducer, { State } from '../reducer';
import { queryRequest, queryFailure, querySuccess } from '../actions';

const getInitialState = (initial?: Partial<State>) => reducer(initial as State, {} as any);

describe('Queries reducer', () => {
  it('sets an initial state', () => {
    const INITIAL_STATE = getInitialState();
    expect(INITIAL_STATE).toMatchSnapshot();
  });

  describe('queryRequest', () => {
    it('sets a loading flag for a query', () => {
      const INITIAL_STATE = getInitialState();

      const key = 'unique key';

      const RESULT_STATE = {
        'unique key': {
          loading: true,
        },
      };

      expect(reducer(INITIAL_STATE, queryRequest({ key, APIContext: {} }))).toEqual(RESULT_STATE);
    });

    it('does not overwrite a current query that already contained data', () => {
      const INITIAL_STATE = getInitialState({ 'unique key': { loading: false, ids: ['testid123'] } });

      const key = 'unique key';

      const RESULT_STATE = {
        'unique key': {
          loading: true,
          ids: ['testid123'],
        },
      };

      expect(reducer(INITIAL_STATE, queryRequest({ key, APIContext: {} }))).toEqual(RESULT_STATE);
    });
  });

  it('queryFailure', () => {
    const INITIAL_STATE = getInitialState({ 'unique key': { loading: true } });

    const key = 'unique key';
    const error = new Error('API-error');

    const RESULT_STATE = {
      'unique key': {
        loading: false,
        error,
      },
    };

    expect(reducer(INITIAL_STATE, queryFailure({ key, error }))).toEqual(RESULT_STATE);
  });

  it('querySuccess', () => {
    const INITIAL_STATE = getInitialState({ 'unique key': { loading: true } });

    const key = 'unique key';
    const ids = ['testid123'];
    const meta = { 'some meta key': 'some meta information' };
    const data = { 'some data key': 'some data' };

    const RESULT_STATE = {
      'unique key': {
        loading: false,
        ids,
        meta,
        data,
      },
    };

    expect(reducer(INITIAL_STATE, querySuccess({ key, ids, meta, data }))).toEqual(RESULT_STATE);
  });
});
