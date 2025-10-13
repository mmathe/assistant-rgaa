import {
        getAnalysisStatus,
        getAnalysisError,
        getAnalysisList,
        hasAnalysisResults
} from './aiAnalysis';

describe('common/selectors/aiAnalysis', function() {
        const state = {
                aiAnalysis: {
                        status: 'succeeded',
                        error: null,
                        items: {
                                A: {ruleId: 'A', result: 'C'},
                                B: {ruleId: 'B', result: 'NC'}
                        }
                }
        };

        it('should return analysis status', function() {
                expect(getAnalysisStatus(state)).to.equal('succeeded');
        });

        it('should return analysis error', function() {
                expect(getAnalysisError(state)).to.equal(null);
        });

        it('should return an ordered list of results', function() {
                expect(getAnalysisList(state)).to.deep.equal([
                        {ruleId: 'A', result: 'C'},
                        {ruleId: 'B', result: 'NC'}
                ]);
        });

        it('should detect presence of results', function() {
                expect(hasAnalysisResults(state)).to.equal(true);
        });
});
