const Google = require('googleapis');

const OAuth2 = Google.auth.OAuth2;

const googleAuthClientId = process.env.GOOGLE_AUTH_CLIENT_ID;
const googleAuthClientSecret = process.env.GOOGLE_AUTH_CLIENT_SECRET;
const googleUrl = process.env.GOOGLE_REDIRECT_URI;

const oauthClient = new OAuth2(googleAuthClientId, googleAuthClientSecret, googleUrl);

/* eslint-disable import/prefer-default-export */
const getGoogleTokens = (serverAuthCode) => new Promise((resolve, reject) => {
/* eslint-enable import/prefer-default-export */
  oauthClient.getToken(serverAuthCode, (err, tokens) => {
    if (err) {
      reject(err);
    } else {
      resolve(tokens);
    }
  });
});

module.exports = getGoogleTokens