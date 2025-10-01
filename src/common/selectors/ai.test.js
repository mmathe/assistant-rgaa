import {getConfig, getProvider, getEndpoint} from './ai';

describe('common/selectors/ai', function() {
        const state = {
                ai: {
                        provider: 'bedrock',
                        endpoint: 'https://example.com',
                        model: 'claude'
                }
        };

        it('should return the entire config', function() {
                expect(getConfig(state)).to.equal(state.ai);
        });

        it('should return the selected provider', function() {
                expect(getProvider(state)).to.equal('bedrock');
        });

        it('should return the selected endpoint', function() {
                expect(getEndpoint(state)).to.equal('https://example.com');
        });
});
