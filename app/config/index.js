const App_Settings = {
    APP_PORT : process.env.PORT || process.env.APP_PORT || 8080,
    
    DB_URI : process.env.DB_URI || '',
    DB_USER : process.env.DB_USER || '',
    DB_PASSWORD : process.env.DB_PASSWORD || '',

    SALT_ROUNDS : process.env.SALT_ROUNDS || 10,
    APP_SECRET : process.env.APP_SECRET || 'buddysecret',

    AZURE_CONNECTION : process.env.AZURE_CONNECTION || '',
    AZURE_BLOB_URL : process.env.AZURE_BLOB_URL || '',

    PUBNUB_AUTH_KEY : process.env.PUBNUB_AUTH_KEY || 'server-auth',
    PUBNUB_SUBSCRIBE_KEY : process.env.PUBNUB_SUBSCRIBE_KEY || '',
    PUBNUB_PUBLISH_KEY : process.env.PUBNUB_PUBLISH_KEY || '',
    PUBNUB_SECRET_KEY : process.env.PUBNUB_SECRET_KEY || '',

    ONESIGNAL_APP_ID : process.env.ONESIGNAL_APP_ID || '',
    ONESIGNAL_API_KEY : process.env.ONESIGNAL_API_KEY || '',

    TWILIO_ACCOUNT_SID : process.env.TWILIO_ACCOUNT_SID || '',
    TWILIO_AUTH_TOKEN : process.env.TWILIO_AUTH_TOKEN || '',
    SESSION: {
        cookieKey: 'longrandomtextherejusttobesureitdoesntgethacked'
    },

    TWITTER_CONSUMER_KEY : process.env.TWITTER_CONSUMER_KEY || '',
    TWITTER_CONSUMER_SECRET_KEY : process.env.TWITTER_CONSUMER_SECRET_KEY || ''
}

module.exports = App_Settings;