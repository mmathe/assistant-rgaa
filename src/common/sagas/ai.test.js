import {call, put} from 'redux-saga/effects';
import {SAVE_CONFIG, setConfig} from '../actions/ai';
import {setOption} from '../api/options';
import {saveConfigWorker, watchSaveConfig} from './ai';

describe('common/sagas/ai', function() {
        it('should persist the config and dispatch setConfig', function() {
                const config = {provider: 'openai'};
                const iterator = saveConfigWorker({payload: {config}});

                expect(iterator.next().value).to.deep.equal(call(setOption, 'aiConfig', config));
                expect(iterator.next().value).to.deep.equal(put(setConfig(config)));
                expect(iterator.next().done).to.be.true;
        });

        it('should watch SAVE_CONFIG actions', function() {
                const iterator = watchSaveConfig();
                const effect = iterator.next().value;

                expect(effect && effect.TAKE && effect.TAKE.pattern).to.equal(SAVE_CONFIG);
        });
});
