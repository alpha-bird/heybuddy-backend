var Config = require('../config');
var oneSignal = require('onesignal-promise')({ appId: Config.ONESIGNAL_APP_ID, apiKey: Config.ONESIGNAL_API_KEY });

const PushNotification = {
    sendPush : ( data ) => {
        return oneSignal.createNotification( data );
    }
}

module.exports = PushNotification;