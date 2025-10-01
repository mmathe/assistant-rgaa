import {compose, withProps, withState, lifecycle} from 'recompose';
import {connect} from 'react-redux';
import {saveConfig} from '../../common/actions/ai';
import {getConfig} from '../../common/selectors/ai';
import {initialState as initialAiState} from '../../common/reducers/ai';
import AiSettingsForm from './AiSettingsForm';

export const providerOptions = [
        {value: 'openai', name: 'OpenAI'},
        {value: 'azure-openai', name: 'Azure OpenAI'},
        {value: 'gemini', name: 'Google Gemini'},
        {value: 'bedrock', name: 'AWS Bedrock'},
        {value: 'mistral', name: 'Mistral AI'},
        {value: 'custom', name: 'Personnalisé'}
];

export const normalizeConfig = (config = {}) => ({
        ...initialAiState,
        ...config,
        provider: config.provider || initialAiState.provider,
        endpoint: (config.endpoint || '').trim(),
        apiKey: (config.apiKey || '').trim(),
        model: (config.model || '').trim(),
        additionalHeaders: (config.additionalHeaders || '').trim(),
        additionalParameters: (config.additionalParameters || '').trim()
});

const mapStateToProps = (state) => ({
        config: getConfig(state)
});

const mapDispatchToProps = (dispatch, {toggleSuccessMessage}) => ({
        onChange() {
                toggleSuccessMessage(false);
        },

        onSubmit(config) {
                dispatch(saveConfig(normalizeConfig(config)));
                toggleSuccessMessage(true);
        }
});

export default compose(
        withState('showSuccessMessage', 'toggleSuccessMessage', false),
        connect(mapStateToProps, mapDispatchToProps),
        withProps({
                providers: providerOptions
        }),
        withState('values', 'setValues', ({config}) => normalizeConfig(config)),
        lifecycle({
                componentDidUpdate(prevProps) {
                        if (prevProps.config !== this.props.config) {
                                this.props.setValues(normalizeConfig(this.props.config));
                        }
                }
        })
)(AiSettingsForm);
