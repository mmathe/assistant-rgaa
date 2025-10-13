import {connect} from 'react-redux';
import {compose} from 'recompose';
import AiAnalysisPanel from './AiAnalysisPanel';
import {runAnalysis, resetAnalysisError} from '../../common/actions/aiAnalysis';
import {getAnalysisStatus, getAnalysisError, getAnalysisList, getAnalysisModel, getAnalysisLastRunAt, getAnalysisContexts} from '../../common/selectors/aiAnalysis';
import {getConfig as getAiConfig} from '../../common/selectors/ai';
import {getPageTitle, getPageUrl} from '../../common/selectors/panel';
import {getEnabledIds} from '../../common/selectors/tests';

const mapStateToProps = (state) => {
        const status = getAnalysisStatus(state);
        const results = getAnalysisList(state);
        const aiConfig = getAiConfig(state);
        const enabledIds = getEnabledIds(state);
        const configured = Boolean(aiConfig && aiConfig.endpoint);

        return {
                status,
                error: getAnalysisError(state),
                isLoading: status === 'loading',
                canTrigger: configured && enabledIds.length > 0,
                configured,
                results,
                contexts: getAnalysisContexts(state),
                model: getAnalysisModel(state),
                lastRunAt: getAnalysisLastRunAt(state),
                pageTitle: getPageTitle(state),
                pageUrl: getPageUrl(state)
        };
};

const mapDispatchToProps = (dispatch) => ({
        onRun: () => dispatch(runAnalysis()),
        onResetError: () => dispatch(resetAnalysisError())
});

export default compose(
        connect(mapStateToProps, mapDispatchToProps)
)(AiAnalysisPanel);
