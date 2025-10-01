import * as reference from '../common/sagas/reference';
import * as options from '../common/sagas/options';
import * as ai from '../common/sagas/ai';



/**
 *	Exports all sagas of the application.
 */
export default function* sagas() {
        yield [
                options.watchOpen(),
                reference.watchSetReferenceVersion(),
                ai.watchSaveConfig()
        ];
}
