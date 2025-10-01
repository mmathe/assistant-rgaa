import reducer, {initialState} from './ai';
import {setConfig} from '../actions/ai';

describe('common/reducers/ai', function() {
        it('should return the initial state by default', function() {
                expect(reducer(undefined, {type: '@@INIT'})).to.deep.equal(initialState);
        });

        it('should merge the provided config on SET_CONFIG', function() {
                const config = {
                        provider: 'gemini',
                        model: 'flash'
                };

                expect(reducer(initialState, setConfig(config))).to.deep.equal({
                        ...initialState,
                        ...config
                });
        });
});
