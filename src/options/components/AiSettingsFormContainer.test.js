import {normalizeConfig, providerOptions} from './AiSettingsFormContainer';
import {initialState as initialAiState} from '../../common/reducers/ai';

describe('options/components/AiSettingsFormContainer', function() {
        it('should expose a non-empty list of providers', function() {
                expect(providerOptions).to.be.an('array').and.not.to.be.empty;
                providerOptions.forEach(({value, name}) => {
                        expect(value).to.be.a('string');
                        expect(name).to.be.a('string');
                });
        });

        it('should fallback to the initial state when config is missing', function() {
                expect(normalizeConfig()).to.deep.equal(initialAiState);
        });

        it('should trim values and preserve provided properties', function() {
                const config = {
                        provider: 'gemini',
                        endpoint: ' https://example.com ',
                        apiKey: ' secret ',
                        model: ' flash ',
                        additionalHeaders: ' {"x-test": "1"} ',
                        additionalParameters: ' {"temperature": 0.2} '
                };

                expect(normalizeConfig(config)).to.deep.equal({
                        ...initialAiState,
                        provider: 'gemini',
                        endpoint: 'https://example.com',
                        apiKey: 'secret',
                        model: 'flash',
                        additionalHeaders: '{"x-test": "1"}',
                        additionalParameters: '{"temperature": 0.2}'
                });
        });
});
