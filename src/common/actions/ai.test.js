import {setConfig, saveConfig, SET_CONFIG, SAVE_CONFIG} from './ai';

describe('common/actions/ai', function() {
        it('should create an action to set the config', function() {
                const config = {provider: 'gemini'};
                expect(setConfig(config)).to.deep.equal({
                        type: SET_CONFIG,
                        payload: {config}
                });
        });

        it('should create an action to save the config', function() {
                const config = {endpoint: 'https://example.com'};
                expect(saveConfig(config)).to.deep.equal({
                        type: SAVE_CONFIG,
                        payload: {config}
                });
        });
});
