var Config = require('../config');
var PubNub = require('pubnub');

//PubNub handler
const pubnubHandle = new PubNub(
    Object.assign({}, { subscribeKey : Config.PUBNUB_SUBSCRIBE_KEY, publishKey : Config.PUBNUB_PUBLISH_KEY, secretKey : Config.PUBNUB_SECRET_KEY }, {
        error: error => {
            console.error('Failed to initialize PubNub:', error);
        }
    })
);

const PubNubManager = {
    executeGrant : ( options ) =>
        new Promise((resolve, reject) => {
            pubnubHandle.grant(options,
                status => {
                    if (status.error) {
                        reject(new Error(`Grant failed: ${status.category}`));
                    }
                    else {
                        resolve();
                    }
                });
        }),
}

module.exports = PubNubManager;