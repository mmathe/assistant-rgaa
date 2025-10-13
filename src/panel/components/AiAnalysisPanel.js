import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import Icon from './Icon';

const STATUS_CLASSNAME = {
        C: 'is-valid',
        NC: 'is-invalid',
        NA: 'is-na'
};

class AiAnalysisPanel extends Component {
        constructor(props) {
                super(props);

                this.state = {
                        activeRuleId: null,
                        copyStatus: ''
                };

                this.handleGlobalShortcut = this.handleGlobalShortcut.bind(this);
                this.handleRunRequest = this.handleRunRequest.bind(this);
                this.handleDrawerClose = this.handleDrawerClose.bind(this);
                this.handleExport = this.handleExport.bind(this);
                this.handleCopy = this.handleCopy.bind(this);
        }

        componentDidMount() {
                window.addEventListener('keydown', this.handleGlobalShortcut, false);
        }

        componentWillUnmount() {
                window.removeEventListener('keydown', this.handleGlobalShortcut, false);
        }

        componentDidUpdate(prevProps) {
                if (prevProps.status === 'loading' && this.props.status === 'succeeded') {
                        this.setState({copyStatus: ''});
                }
        }

        getErrorMessage() {
                const {intl, error} = this.props;
                if (!error) {
                        return '';
                }

                const code = typeof error === 'string'
                        ? error
                        : (error.message || '');

                if (!code) {
                        return intl.formatMessage({id: 'AiAnalysis.error.generic'}, {details: ''});
                }

                if (code === 'AI_ANALYSIS_EMPTY_SELECTION') {
                        return intl.formatMessage({id: 'AiAnalysis.error.AI_ANALYSIS_EMPTY_SELECTION'});
                }

                if (code === 'AI_ANALYSIS_MISSING_ENDPOINT') {
                        return intl.formatMessage({id: 'AiAnalysis.error.AI_ANALYSIS_MISSING_ENDPOINT'});
                }

                if (code.indexOf('AI_ANALYSIS_HTTP_') === 0) {
                        const status = code.replace('AI_ANALYSIS_HTTP_', '');
                        return intl.formatMessage({id: 'AiAnalysis.error.http'}, {status});
                }

                return intl.formatMessage({id: 'AiAnalysis.error.generic'}, {details: code});
        }

        handleGlobalShortcut(event) {
                if (!this.props.canTrigger || this.props.isLoading) {
                        return;
                }

                if (event.altKey && (event.key === 'i' || event.key === 'I')) {
                        event.preventDefault();
                        this.props.onRun();
                }
        }

        handleRunRequest(event) {
                event.preventDefault();
                if (this.props.canTrigger && !this.props.isLoading) {
                        this.props.onRun();
                }
        }

        handleDrawerOpen(ruleId) {
                this.setState({
                        activeRuleId: ruleId
                });
        }

        handleDrawerClose() {
                this.setState({
                        activeRuleId: null
                });
        }

        getExportData() {
                const {results, contexts, model, lastRunAt, pageTitle, pageUrl} = this.props;

                return {
                        model,
                        generatedAt: lastRunAt,
                        page: {
                                title: pageTitle || '',
                                url: pageUrl || ''
                        },
                        results: results.map((result) => ({
                                ruleId: result.ruleId,
                                ruleTitle: result.ruleTitle,
                                ruleLevel: result.ruleLevel,
                                result: result.result,
                                comment: result.comment,
                                contexts: contexts[result.ruleId] || []
                        }))
                };
        }

        handleExport() {
                const data = this.getExportData();
                const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const timestamp = data.generatedAt ? data.generatedAt.replace(/[:.]/g, '-') : 'latest';
                link.href = url;
                link.download = `ai-analysis-${timestamp}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
        }

        handleCopy() {
                const data = JSON.stringify(this.getExportData(), null, 2);

                if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(data)
                                .then(() => this.setState({copyStatus: 'success'}))
                                .catch(() => this.setState({copyStatus: 'error'}));
                        return;
                }

                try {
                        const textarea = document.createElement('textarea');
                        textarea.value = data;
                        textarea.setAttribute('readonly', 'true');
                        textarea.style.position = 'absolute';
                        textarea.style.left = '-9999px';
                        document.body.appendChild(textarea);
                        textarea.select();
                        const successful = document.execCommand('copy');
                        document.body.removeChild(textarea);
                        this.setState({copyStatus: successful ? 'success' : 'error'});
                } catch (error) {
                        this.setState({copyStatus: 'error'});
                }
        }

        renderStatusMessage() {
                const {status} = this.props;

                if (status === 'failed' && this.props.error) {
                        return (
                                <div className="AiAnalysisPanel-message AiAnalysisPanel-message--error" role="alert">
                                        <span>{this.getErrorMessage()}</span>
                                        <button
                                                type="button"
                                                className="AiAnalysisPanel-messageDismiss"
                                                onClick={this.props.onResetError}
                                        >
                                                <FormattedMessage id="AiAnalysis.error.dismiss" />
                                        </button>
                                </div>
                        );
                }

                if (status === 'succeeded') {
                        return (
                                <div className="AiAnalysisPanel-message AiAnalysisPanel-message--success" role="status">
                                        <FormattedMessage id="AiAnalysis.status.success" />
                                </div>
                        );
                }

                if (status === 'loading') {
                        return (
                                <div className="AiAnalysisPanel-message AiAnalysisPanel-message--loading" role="status">
                                        <FormattedMessage id="AiAnalysis.status.loading" />
                                </div>
                        );
                }

                return null;
        }

        renderCopyFeedback() {
                if (!this.state.copyStatus) {
                        return null;
                }

                return (
                        <div
                                className={classNames('AiAnalysisPanel-copyFeedback', {
                                        'is-success': this.state.copyStatus === 'success',
                                        'is-error': this.state.copyStatus === 'error'
                                })}
                        >
                                <FormattedMessage
                                        id={this.state.copyStatus === 'success'
                                                ? 'AiAnalysis.copy.success'
                                                : 'AiAnalysis.copy.error'}
                                />
                        </div>
                );
        }

        renderTable() {
                const {results, intl, model, lastRunAt} = this.props;

                if (!results.length) {
                        return (
                                <p className="AiAnalysisPanel-empty">
                                        <FormattedMessage id="AiAnalysis.empty" />
                                </p>
                        );
                }

                return (
                        <div className="AiAnalysisPanel-tableWrapper">
                                <table className="AiAnalysisPanel-table">
                                        <thead>
                                                <tr>
                                                        <th scope="col">
                                                                <FormattedMessage id="AiAnalysis.table.rule" />
                                                        </th>
                                                        <th scope="col">
                                                                <FormattedMessage id="AiAnalysis.table.title" />
                                                        </th>
                                                        <th scope="col">
                                                                <FormattedMessage id="AiAnalysis.table.result" />
                                                        </th>
                                                        <th scope="col">
                                                                <FormattedMessage id="AiAnalysis.table.comment" />
                                                        </th>
                                                        <th scope="col">
                                                                <FormattedMessage id="AiAnalysis.table.lastRun" />
                                                        </th>
                                                        <th scope="col">
                                                                <FormattedMessage id="AiAnalysis.table.model" />
                                                        </th>
                                                        <th scope="col">
                                                                <FormattedMessage id="AiAnalysis.table.context" />
                                                        </th>
                                                </tr>
                                        </thead>
                                        <tbody>
                                                {results.map((result) => (
                                                        <tr key={result.ruleId}>
                                                                <th scope="row">{result.ruleId}</th>
                                                                <td>{result.ruleTitle}</td>
                                                                <td>
                                                                        <span
                                                                                className={classNames('AiAnalysisPanel-result', STATUS_CLASSNAME[result.result])}
                                                                        >
                                                                                <FormattedMessage id={`AiAnalysis.result.${result.result}`} />
                                                                        </span>
                                                                </td>
                                                                <td>{result.comment}</td>
                                                                <td>
                                                                        {result.receivedAt
                                                                                ? intl.formatDate(result.receivedAt, {
                                                                                        year: 'numeric',
                                                                                        month: '2-digit',
                                                                                        day: '2-digit'
                                                                                })
                                                                                : (lastRunAt
                                                                                        ? intl.formatDate(lastRunAt, {
                                                                                                year: 'numeric',
                                                                                                month: '2-digit',
                                                                                                day: '2-digit'
                                                                                        })
                                                                                        : '')}
                                                                </td>
                                                                <td>{result.model || model}</td>
                                                                <td>
                                                                        <button
                                                                                type="button"
                                                                                className="AiAnalysisPanel-contextButton"
                                                                                onClick={() => this.handleDrawerOpen(result.ruleId)}
                                                                        >
                                                                                <FormattedMessage id="AiAnalysis.table.context" />
                                                                        </button>
                                                                </td>
                                                        </tr>
                                                ))}
                                        </tbody>
                                </table>
                        </div>
                );
        }

        renderDrawer() {
                const {activeRuleId} = this.state;
                const {contexts} = this.props;

                if (!activeRuleId) {
                        return null;
                }

                const contextEntries = contexts[activeRuleId] || [];

                return (
                        <div className="AiAnalysisPanel-drawer" role="dialog" aria-modal="true">
                                <div className="AiAnalysisPanel-drawerContent">
                                        <header className="AiAnalysisPanel-drawerHeader">
                                                <h2>
                                                        <FormattedMessage id="AiAnalysis.drawer.title" />
                                                </h2>
                                                <button
                                                        type="button"
                                                        className="AiAnalysisPanel-drawerClose"
                                                        onClick={this.handleDrawerClose}
                                                >
                                                        <FormattedMessage id="AiAnalysis.drawer.close" />
                                                </button>
                                        </header>
                                        <div className="AiAnalysisPanel-drawerBody">
                                                {contextEntries.length === 0 && (
                                                        <p>
                                                                <FormattedMessage id="AiAnalysis.drawer.empty" />
                                                        </p>
                                                )}

                                                {contextEntries.length > 0 && (
                                                        <ul className="AiAnalysisPanel-contextList">
                                                                {contextEntries.map((entry, index) => (
                                                                        <li key={`${activeRuleId}-${index}`}>
                                                                                <code>{entry.selector || entry.xpath || entry.outerHtml}</code>
                                                                        </li>
                                                                ))}
                                                        </ul>
                                                )}
                                        </div>
                                </div>
                        </div>
                );
        }

        render() {
                const {intl, isLoading, canTrigger, configured} = this.props;
                const disabled = isLoading || !canTrigger;
                const buttonLabel = isLoading
                        ? intl.formatMessage({id: 'AiAnalysis.button.loading'})
                        : intl.formatMessage({id: 'AiAnalysis.button.label'});
                const tooltipId = !configured
                        ? 'AiAnalysis.button.tooltip.configure'
                        : 'AiAnalysis.button.tooltip.disabled';
                const tooltip = !canTrigger
                        ? intl.formatMessage({id: tooltipId})
                        : '';

                return (
                        <section className="AiAnalysisPanel" aria-live="polite">
                                <div className="AiAnalysisPanel-toolbar">
                                        <button
                                                type="button"
                                                className={classNames('AiAnalysisPanel-button', {
                                                        'is-loading': isLoading,
                                                        'is-disabled': disabled
                                                })}
                                                onClick={this.handleRunRequest}
                                                title={tooltip}
                                                aria-busy={isLoading}
                                                aria-disabled={disabled}
                                                accessKey="i"
                                                disabled={disabled}
                                        >
                                                <Icon name="sparkles" className="AiAnalysisPanel-buttonIcon" />
                                                <span className="AiAnalysisPanel-buttonLabel">{buttonLabel}</span>
                                                {isLoading && <span className="AiAnalysisPanel-spinner" aria-hidden="true" />}
                                        </button>

                                        <div className="AiAnalysisPanel-actions">
                                                <button
                                                        type="button"
                                                        className="AiAnalysisPanel-secondary"
                                                        onClick={this.handleExport}
                                                        disabled={this.props.results.length === 0}
                                                >
                                                        <FormattedMessage id="AiAnalysis.actions.export" />
                                                </button>
                                                <button
                                                        type="button"
                                                        className="AiAnalysisPanel-secondary"
                                                        onClick={this.handleCopy}
                                                        disabled={this.props.results.length === 0}
                                                >
                                                        <FormattedMessage id="AiAnalysis.actions.copy" />
                                                </button>
                                        </div>
                                </div>

                                {this.renderStatusMessage()}
                                {this.renderCopyFeedback()}
                                {this.renderTable()}
                                {this.renderDrawer()}
                        </section>
                );
        }
}

AiAnalysisPanel.propTypes = {
        intl: intlShape.isRequired,
        onRun: PropTypes.func.isRequired,
        onResetError: PropTypes.func.isRequired,
        status: PropTypes.string.isRequired,
        error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        isLoading: PropTypes.bool,
        canTrigger: PropTypes.bool,
        configured: PropTypes.bool,
        results: PropTypes.array,
        contexts: PropTypes.object,
        model: PropTypes.string,
        lastRunAt: PropTypes.string,
        pageTitle: PropTypes.string,
        pageUrl: PropTypes.string
};

AiAnalysisPanel.defaultProps = {
        error: null,
        isLoading: false,
        canTrigger: false,
        configured: true,
        results: [],
        contexts: {},
        model: '',
        lastRunAt: null,
        pageTitle: '',
        pageUrl: ''
};

export default injectIntl(AiAnalysisPanel);
