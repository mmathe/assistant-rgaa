import reducer from './checklist';
import {setTestDone, setTestComment, reset} from '../actions/checklist';

describe('common/reducers/checklist', function() {
        it('should return the initial state by default', function() {
                expect(reducer(undefined, {type: '@@INIT'})).to.deep.equal({});
        });

        it('should store the done flag while preserving comments', function() {
                const initial = {
                        '1.1.1': {
                                done: false,
                                comment: 'Analyse initiale'
                        }
                };

                expect(reducer(initial, setTestDone('1.1.1', true))).to.deep.equal({
                        '1.1.1': {
                                done: true,
                                comment: 'Analyse initiale'
                        }
                });
        });

        it('should update the comment without altering the done flag', function() {
                const state = reducer({}, setTestDone('1.1.1', false));
                const withComment = reducer(state, setTestComment('1.1.1', 'Nouvelle justification'));

                expect(withComment).to.deep.equal({
                        '1.1.1': {
                                done: false,
                                comment: 'Nouvelle justification'
                        }
                });
        });

        it('should reset to the initial state', function() {
                const state = reducer({}, setTestComment('1.1.1', 'Quelque chose'));
                expect(reducer(state, reset())).to.deep.equal({});
        });
});
