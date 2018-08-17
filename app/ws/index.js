const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      moment = require('moment'),
      _User = require('../models/user'),
      _Session = require('../models/session');
/*
message_type : AUTHORIZATION,
access_token : token
*/
// 0 : away, 1 : available, -1 : not available
// web, mobile : client_type
module.exports = (ws, req) => {
    var currentUser;
    ws.on('message', function(message) {
        console.log('received: %s', message);
        var msg_data = JSON.parse(message);

        switch(msg_data.message_type) {
            case 'AUTHORIZATION':
                authUser(msg_data.token).then( user => {
                    currentUser = user
                    currentUser.client = msg_data.client_type
                    var data = {
                        success : user ? true : false,
                    }
                    ws.send(JSON.stringify(data));
                });
                break;
            case 'SET_AVAILABILITY':
                setAvailability( msg_data.sessionId, msg_data.value ).then( status => {
                    var data = {
                        success : status
                    }
                    ws.send(JSON.stringify(data));
                })
                break;
            case 'SET_POSITION':
                currentUser.trackLocations.push({
                    position : msg_data.position,
                    time : moment().utc().format()
                })
                currentUser.saveToDataBase().then( () => {
                    var data = {
                        success : true
                    }
                    ws.send(JSON.stringify(data))
                })
                break;
            default:
                return;
        }
    });
    ws.on('close', function() {
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
