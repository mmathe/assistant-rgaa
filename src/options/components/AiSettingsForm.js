import React, {PropTypes} from 'react';
import {FormattedMessage} from 'react-intl';
import renderIf from 'render-if';

/**
 * AiSettingsForm renders a form for configuring AI provider settings.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.values - Current form values for AI settings.
 * @param {Function} props.setValues - Function to update form values.
 * @param {Function} props.onSubmit - Callback when the form is submitted.
 * @param {Function} props.onChange - Callback when any form field changes.
 * @param {boolean} props.showSuccessMessage - Whether to show a success message after saving.
 * @param {Array<{value: string, name: string}>} props.providers - List of available AI providers.
 *
 * @returns {JSX.Element} The rendered form component.
 */
function AiSettingsForm({values, setValues, onSubmit, onChange, showSuccessMessage, providers}) {
        const handleChange = (event) => {
                const {name, value} = event.target;
                setValues({
                        ...values,
                        [name]: value
                });
                onChange();
        };

        const handleSubmit = (event) => {
                event.preventDefault();
                onSubmit(values);
        };

        const {
                provider = 'openai',
                endpoint = '',
                apiKey = '',
                model = '',
                additionalHeaders = '',
                additionalParameters = ''
        } = values;

        return (
                <form onSubmit={handleSubmit} className="Options-section Options-aiSettings">
                        <h2 className="Options-sectionTitle">
                                <FormattedMessage id="Options.aiSettings.title" />
                        </h2>

                        <div className="Options-field">
                                <label htmlFor="Options-aiProvider">
                                        <FormattedMessage id="Options.aiSettings.provider.label" />
                                </label>
                                <select
                                        id="Options-aiProvider"
                                        name="provider"
                                        value={provider}
                                        onChange={handleChange}
                                >
                                        {providers.map(({value, name}) => (
                                                <option key={`ai-provider-${value}`} value={value}>
                                                        {name}
                                                </option>
                                        ))}
                                </select>
                        </div>

                        <div className="Options-field">
                                <label htmlFor="Options-aiEndpoint">
                                        <FormattedMessage id="Options.aiSettings.endpoint.label" />
                                </label>
                                <input
                                        id="Options-aiEndpoint"
                                        name="endpoint"
                                        type="url"
                                        value={endpoint}
                                        onChange={handleChange}
                                        placeholder="https://api.openai.com/v1"
                                />
                                <p className="Options-help">
                                        <FormattedMessage id="Options.aiSettings.endpoint.help" />
                                </p>
                        </div>

                        <div className="Options-field">
                                <label htmlFor="Options-aiApiKey">
                                        <FormattedMessage id="Options.aiSettings.apiKey.label" />
                                </label>
                                <input
                                        id="Options-aiApiKey"
                                        name="apiKey"
                                        type="password"
                                        value={apiKey}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                />
                                <p className="Options-help">
                                        <FormattedMessage id="Options.aiSettings.apiKey.help" />
                                </p>
                        </div>

                        <div className="Options-field">
                                <label htmlFor="Options-aiModel">
                                        <FormattedMessage id="Options.aiSettings.model.label" />
                                </label>
                                <input
                                        id="Options-aiModel"
                                        name="model"
                                        type="text"
                                        value={model}
                                        onChange={handleChange}
                                        placeholder="gpt-4o"
                                />
                        </div>

                        <div className="Options-field">
                                <label htmlFor="Options-aiAdditionalHeaders">
                                        <FormattedMessage id="Options.aiSettings.additionalHeaders.label" />
                                </label>
                                <textarea
                                        id="Options-aiAdditionalHeaders"
                                        name="additionalHeaders"
                                        value={additionalHeaders}
                                        onChange={handleChange}
                                />
                                <p className="Options-help">
                                        <FormattedMessage id="Options.aiSettings.additionalHeaders.help" />
                                </p>
                        </div>

                        <div className="Options-field">
                                <label htmlFor="Options-aiAdditionalParameters">
                                        <FormattedMessage id="Options.aiSettings.additionalParameters.label" />
                                </label>
                                <textarea
                                        id="Options-aiAdditionalParameters"
                                        name="additionalParameters"
                                        value={additionalParameters}
                                        onChange={handleChange}
                                />
                                <p className="Options-help">
                                        <FormattedMessage id="Options.aiSettings.additionalParameters.help" />
                                </p>
                        </div>

                        <div className="Options-submit">
                                <button>
                                        <FormattedMessage id="Options.aiSettings.submit" />
                                </button>
                        </div>

                        {renderIf(showSuccessMessage)(() => (
                                <p className="Options-success">
                                        <FormattedMessage id="Options.aiSettings.successMessage" />
                                </p>
                        ))}
                </form>
        );
}

AiSettingsForm.propTypes = {
        values: PropTypes.object.isRequired,
        setValues: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        showSuccessMessage: PropTypes.bool.isRequired,
        providers: PropTypes.arrayOf(PropTypes.shape({
                value: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired
        })).isRequired
};

export default AiSettingsForm;
