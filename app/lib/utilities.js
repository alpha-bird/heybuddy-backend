const bcrypt = require('bcrypt'),
      jwt = require('jsonwebtoken'),
      base64 = require('base-64'),
      azure = require('azure-storage'),
      Config = require('../config');

const Utilities = {
    comparePassword : ( passwordFromClient, dbhash ) => {
            return new Promise( (resolve, reject) => {
                bcrypt.compare( passwordFromClient, dbhash, function(err, res) {
                    if(err) reject(err);
                    else resolve(res);
                });
            });
        },

    getHashPassword : ( passwordFromClient ) => {
            return new Promise( ( resolve, reject ) => {
                bcrypt.hash( passwordFromClient, parseInt(Config.SALT_ROUNDS), function(err, hash) {
                    if(err) {
                        reject(err);
                    }
                    else {
                        resolve(hash);
                    }
                });
            });
        },

    generateJWT : ( data )  => {
            var token = jwt.sign( { data : data }, Config.APP_SECRET, { expiresIn : 60*60*24 } ); // expire in 24 hours
            return token;
        },
    
    tokenAuthenticate : ( token ) => {
            return new Promise( (resolve, reject) => {
                if(token) {
                    jwt.verify(token, Config.APP_SECRET, function(err, decoded) {
                        if ( err ) {
                            reject(err);
                        } 
                        else {
                            resolve(decoded);
                        }
                    });
                }
                else{
                    resolve(null);
                }
            });
        },
    
    randomFourDigit : () => {
            var val = Math.floor(1000 + Math.random() * 9000);
            console.log(val);
            return val;
        },

    isUserContainedException : ( exceptions, item ) => {
            for( var index = 0; index < exceptions.length; index ++ ) {
                if( exceptions[index].toString() === item._id.toString() )
                    return true
            }
            return false;
        },
    
    getBlobNameWillUpload : () => {
            var date = new Date();
            var utcStr = date.toUTCString();
            
            return base64.encode(utcStr);
        }
}

module.exports = Utilities;