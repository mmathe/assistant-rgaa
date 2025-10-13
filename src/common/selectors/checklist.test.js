import {isTestDone, getTestComment, areAllTestsDone} from './checklist';

describe('common/selectors/checklist', function() {
        describe('isTestDone', function() {
                it('should read the done flag from an object entry', function() {
                        const state = {
                                checklist: {
                                        '1.1.1': {
                                                done: true,
                                                comment: 'Commentaire'
                                        }
                                }
                        };

                        expect(isTestDone(state, '1.1.1')).to.equal(true);
                });

                it('should fallback to boolean entries for backward compatibility', function() {
                        const state = {
                                checklist: {
                                        '1.1.1': true
                                }
                        };

                        expect(isTestDone(state, '1.1.1')).to.equal(true);
                });
        });

        describe('getTestComment', function() {
                it('should return the stored comment', function() {
                        const state = {
                                checklist: {
                                        '1.1.1': {
                                                done: false,
                                                comment: 'Analyse IA'
                                        }
                                }
                        };

                        expect(getTestComment(state, '1.1.1')).to.equal('Analyse IA');
                });

                it('should return an empty string when no comment is stored', function() {
                        const state = {
                                checklist: {
                                        '1.1.1': true
                                }
                        };

                        expect(getTestComment(state, '1.1.1')).to.equal('');
                });
        });

        describe('areAllTestsDone', function() {
                it('should check all tests with the new structure', function() {
                        const state = {
                                checklist: {
                                        '1.1.1': {
                                                done: true,
                                                comment: ''
                                        },
                                        '1.1.2': {
                                                done: true,
                                                comment: 'ok'
                                        }
                                }
                        };
                        const tests = [{id: '1.1.1'}, {id: '1.1.2'}];

                        expect(areAllTestsDone(state, tests)).to.equal(true);
                });
        });
});
