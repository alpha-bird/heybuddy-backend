const request = require('request')
const Wreck = require('wreck');
const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const facebookApiUrl = 'https://graph.facebook.com';

const getAccessToken = () => new Promise((resolve, reject) => {
  /* eslint-disable max-len */
  var url = `${facebookApiUrl}/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&grant_type=client_credentials`
  var options = {
      method : 'GET',
      uri : url
  }
  request(options, (err, res, payload) => {
    /* eslint-enable max-len */
      if (err) {
        reject(err);
      } else {
        const pl = JSON.parse(payload);
        if (pl.access_token) {
          resolve(pl.access_token);
        } else {
          reject('Could not find an access_token');
        }
      }
    });
});

const validateClientToken = (accessToken, clientToken) => new Promise((resolve, reject) => {
    var options = {
        method : 'GET',
        uri : `${facebookApiUrl}/debug_token?input_token=${clientToken}&access_token=${accessToken}`
    }
    request(options, (err, res, payload) => {
        if (err) {
            resolve(false);
        } else {
            const pl = JSON.parse(payload);
            if( pl.error ) {
                resolve(false)
            }
            else {
                resolve(true);
            }
        }
    });
});

const getFirstName = (facebookId, accessToken) => new Promise((resolve, reject) => {
  Wreck.get(`${facebookApiUrl}/${facebookId}/?fields=first_name&access_token=${accessToken}`,
  (err, res, payload) => {
    if (err) {
      reject(err);
    } else {
      const pl = JSON.parse(payload);
      resolve(pl.first_name);
    }
  });
});

const getLastName = (facebookId, accessToken) => new Promise((resolve, reject) => {
  Wreck.get(`${facebookApiUrl}/${facebookId}/?fields=last_name&access_token=${accessToken}`,
  (err, res, payload) => {
    if (err) {
      reject(err);
    } else {
      const pl = JSON.parse(payload);
      resolve(pl.last_name);
    }
  });
});

const getPicture = (facebookId, accessToken) => new Promise((resolve, reject) => {
  /* eslint-disable max-len */
  Wreck.get(`${facebookApiUrl}/${facebookId}/?fields=picture&type=large&access_token=${accessToken}`,
  /* eslint-enable max-len */
  (err, res, payload) => {
    if (err) {
      reject(err);
    } else {
      const pl = JSON.parse(payload);
      resolve(pl.picture.data.url);
    }
  });
});

const getFacebookProfile = (facebookId, accessToken) => {
  const firstName = getFirstName(facebookId, accessToken);
  const lastName = getLastName(facebookId, accessToken);
  const profileImageUrl = getPicture(facebookId, accessToken);
  return Promise.all([firstName, lastName, profileImageUrl])
    .then(([firstName, lastName, profileImageUrl]) => {
      return {
        firstName,
        lastName,
        profileImageUrl,
      };
    });
};


module.exports = {
    getAccessToken,
    validateClientToken,
    getFirstName,
    getLastName,
    getPicture,
    getFacebookProfile
}