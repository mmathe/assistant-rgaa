import reducer, {initialState} from './aiAnalysis';
import {RUN_ANALYSIS, runAnalysisSuccess, runAnalysisFailure, resetAnalysisError} from '../actions/aiAnalysis';

describe('common/reducers/aiAnalysis', function() {
        it('should return the initial state by default', function() {
                expect(reducer(undefined, {type: '@@INIT'})).to.deep.equal(initialState);
        });

        it('should set loading status on RUN_ANALYSIS', function() {
                const state = reducer(initialState, {type: RUN_ANALYSIS});
                expect(state.status).to.equal('loading');
                expect(state.error).to.equal(null);
        });

        it('should store results on RUN_ANALYSIS_SUCCESS', function() {
                const payload = {
                        receivedAt: '2024-01-01T00:00:00.000Z',
                        model: 'gpt-test',
                        items: {
                                'RGAA-3-2016-1.1.1': {
                                        ruleId: 'RGAA-3-2016-1.1.1',
                                        result: 'C'
                                }
                        },
                        contexts: {
                                'RGAA-3-2016-1.1.1': [{selector: 'img'}]
                        }
                };

                const state = reducer(initialState, runAnalysisSuccess(payload));
                expect(state.status).to.equal('succeeded');
                expect(state.model).to.equal(payload.model);
                expect(state.items).to.deep.equal(payload.items);
                expect(state.contexts).to.deep.equal(payload.contexts);
        });

        it('should store error on RUN_ANALYSIS_FAILURE', function() {
                const error = 'AI_ANALYSIS_HTTP_500';
                const state = reducer(initialState, runAnalysisFailure(error));
                expect(state.status).to.equal('failed');
                expect(state.error).to.equal(error);
        });

        it('should reset error on RESET_ANALYSIS_ERROR', function() {
                const errored = reducer(initialState, runAnalysisFailure('error'));
                const cleared = reducer(errored, resetAnalysisError());
                expect(cleared.error).to.equal(null);
        });
});
