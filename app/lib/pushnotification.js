var Config = require('../config');
var oneSignal = require('onesignal-promise')({ appId: Config.ONESIGNAL_APP_ID, apiKey: Config.ONESIGNAL_API_KEY });

const PushNotification = {
    send : ( tokenIds, contents, headings ) => {
        return new Promise( (resolve ,reject) => {
            var data = {
                contents: { 'en' : contents },
                headings: { 'en' : headings },
                ios_badgeType : 'Increase',
                ios_badgeCount : 1,
                include_player_ids : tokenIds
            }
            oneSignal.createNotification(data).then( errors => {
                if( errors ) {
                    console.log('Sending push notification failed!', errors)
                    resolve(false)
                }
                else {
                    console.log('Sending push notification successed!')
                    resolve(true)
                }
            })
        })
    }
}

module.exports = PushNotification;