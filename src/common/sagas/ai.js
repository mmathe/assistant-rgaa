import {takeEvery} from 'redux-saga';
import {call, put} from 'redux-saga/effects';
import {setOption} from '../api/options';
import {SAVE_CONFIG, setConfig} from '../actions/ai';

/**
 *
 */
export function* saveConfigWorker({payload: {config}}) {
        yield call(setOption, 'aiConfig', config);
        yield put(setConfig(config));
}

/**
 *
 */
export function* watchSaveConfig() {
        yield* takeEvery(SAVE_CONFIG, saveConfigWorker);
}
