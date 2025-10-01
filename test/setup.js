require('babel-polyfill');
const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);

global.expect = chai.expect;

const storageData = {};
const storageLocal = {
        get(keys, callback) {
                if (keys === null) {
                        callback({...storageData});
                        return;
                }

                if (typeof keys === 'string') {
                        callback({[keys]: storageData[keys]});
                        return;
                }

                const result = {};
                keys.forEach((key) => {
                        result[key] = storageData[key];
                });
                callback(result);
        },
        set(items, callback) {
                Object.assign(storageData, items);
                if (callback) {
                        callback();
                }
        },
        remove(key, callback) {
                if (Array.isArray(key)) {
                        key.forEach((k) => delete storageData[k]);
                } else {
                        delete storageData[key];
                }
                if (callback) {
                        callback();
                }
        }
};

global.chrome = {
        storage: {
                local: storageLocal
        },
        runtime: {
                lastError: null
        }
};
