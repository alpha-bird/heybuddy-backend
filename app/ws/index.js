const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      _User = require('../models/user'),
      _Session = require('../models/session');
/*
message_type : AUTHORIZATION,
access_token : token
*/
// 0 : away, 1 : available, -1 : not available

module.exports = (ws, req) => {
    var currentUser;
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        var msg_data = JSON.parse(message);

        switch(msg_data.message_type) {
            case 'AUTHORIZATION':
                return authUser(msg_data.token).then( user => {
                    currentUser = user
                    var data = {
                        success : user ? true : false,
                    }
                    return ws.send(JSON.stringify(data));
                });
            case 'SET_AVAILABILITY':
                return setAvailability( msg_data.sessionId, msg_data.value ).then( status => {
                    var data = {
                        success : status
                    }
                    return ws.send(JSON.stringify(data));
                })
            default:
                return;
        }
    });
    ws.on('close', function close() {
        setUnAvailable(currentUser._id).then( status => {
            if( status ) {
                console.log('disconnected');
            }
            else {
                console.log('failed');
            }
        })
    });
}

function authUser( token ) {
    if ( token === '' ) {
        return undefined
    }
    else {
        return utilities.tokenAuthenticate(token)
                .then( wrapper(function*(decoded){
                    var user = yield _User.findOneByEmail(decoded.data);
                    if ( user ) {
                        return user;
                    }
                    else {
                        return undefined
                    }
                })).catch( error => {
                    return undefined
                })
    }
}

function setAvailability( sessionId, value ) {
    return _Session.findSessionByID( sessionId ).then( wrapper(function*(session) {
                if ( session ) {
                    session.updateField( 'status', value );
                    yield session.saveToDataBase();
                    return true;
                }
                else {
                    return false;
                }
            }))
}

function setUnAvailable( userId ) {
    return _Session.findSessionByUserID( userId ).then( wrapper(function*(session) {
        if ( session ) {
            session.updateField( 'status', 0 );
            yield session.saveToDataBase();
            return true;
        }
        else {
            return false;
        }
    }))
}