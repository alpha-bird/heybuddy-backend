const mongoose = require('mongoose'),
      _Notification = require('../models/notification'),
      moment = require('moment'),
      Schema = mongoose.Schema;

// create a schema
const userSchema = new Schema({
    email : { 
        type: String, 
        required: true
    },
    userType : {
        type : String,
        default : 'Individual'
    },
    password : {
        type : String,
        default : ''
    },
    pin : {
        type : String,
        default : ''
    },
    social : {
        facebookId: {
            type: String,
        },
        googleId: {
            type: String,
        },
        twitterId : {
            type : String
        }
    },
    profile : {
        firstName : {
            type : String,
            default : ''
        },
        lastName : {
            type : String,
            default : ''
        },
        avatarUrl : {
            type : String,
            default : ''
        },
        phoneNumber : {
            type : String,
            default : ''
        },
        dateOfBirth : {
            type : String,
            default : ''
        },
        position : {
            latitude : {
                type : Number,
                default : 0
            },
            longitude : {
                type : Number,
                default : 0
            }
        }
    },
    settings : {
        language : {
            type : String,
            default : 'eng'
        },
        isNotificationEnabled : {
            type : Boolean,
            default : true
        },
        isPosPrivate : {
            type : Boolean,
            default : false
        },
        invisibleMode : {
            type : Boolean,
            default : false
        },
        preWrittenMessage : {
            type : String,
            default : ''
        }
    },
    preSelectedContract : {
        type : Array,
        default : []
    },
    companies : {
        type : Array,
        default : []
    },
    emergencies : {
        type : Array,
        default : []
    },
    meetups : {
        type : Array,
        default : []
    },
    anonymousTips : {
        type : Array,
        default : []
    },
    timers : {
        type : Array,
        default : []
    },
    newsFeeds : {
        type : Array,
        default : []
    },
    likePostings : {
        type : Array,
        default : []
    },
    commentedPostings : {
        type : Array,
        default : []
    },
    chats : {
        type : Array,
        default : []
    },
    buddies : {
        type : Array,
        default : []
    },
    buddyrequests : {
        type : Array,
        default : []
    },
    pendingrequests : {
        type : Array,
        default : []
    },
    createdTime : {
        type : String,
        required : true
    },
    notificationId : {
        type : Schema.Types.ObjectId,
        ref: 'notification',
    }
});

userSchema.methods.updateField = function( key, value ) {
    this[key] = value;
}

userSchema.methods.saveToDataBase = function( ) {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve();
        })
    });
}

userSchema.methods.search = function( content ) {
    return this.email.includes(content) || 
        this.userType.includes(content) || 
        this.profile.firstName.includes(content) || 
        this.profile.lastName.includes(content) ||
        this.profile.phoneNumber.includes(content) ||
        this.profile.dateOfBirth.includes(content) 
}

// create the model
const userModel = mongoose.model('user', userSchema);

userModel.findOneByCondition = function( condition ) {
    return new Promise( (resolve, reject) => {
        userModel.findOne( condition , (err, res) => {
            if(err) reject(err)
            else resolve(res)
        })
    })
}

userModel.findOneByEmail = function( cemail ) {
    return new Promise( ( resolve, reject ) => { 
        userModel.findOne({ email : cemail }, (err, res) => {
            if(err) reject(err);
            else resolve(res);
        });
    });
}

userModel.findOneById = function( id ) {
    return new Promise( ( resolve, reject ) => { 
        userModel.findOne({ _id : id }, (err, res) => {
            if(err) reject(err);
            else resolve(res);
        });
    });
}

userModel.findUserByFacebookId = function( facebookId ) {
    return new Promise( (resolve, reject) => {
        userModel.findOne(
            { 
                social : {
                    facebookId : facebookId 
                }
            }, 
            (err, res) => {
            if(err) reject(err);
            else resolve(res);
        })
    })
}

userModel.findUserByGoogleId = function( googleId ) {
    return new Promise( (resolve, reject) => {
        userModel.findOne(
            {
                social : {
                    googleId : googleId 
                } 
            }, (err, res) => {
            if(err) reject(err);
            else resolve(res);
        })
    })
}

userModel.findUserByTwitterId = function( twitterId ) {
    return new Promise( (resolve, reject) => {
        userModel.findOne( { twitterId : twitterId }, (err, res) => {
            if(err) reject(err)
            else resolve(res)
        })
    })
}

userModel.findUserByPhoneNumber = function( phoneNumber ) {
    return new Promise( (resolve, reject) => {
        userModel.findOne(
            { 
                profile : {
                    phoneNumber :  phoneNumber
                }
            }, (err, res) => {
            if(err) reject(err)
            else resolve(res)
        })
    })
}

userModel.findUsersByName = function( name, me ) {
    return new Promise( (resolve, reject) => {
        userModel.find((error, users) => {
            if(error) reject(error);
            else {
                var result = [];
                users.map( element => {
                    var fullName1 = element.profile.firstName + element.profile.lastName;
                    var fullName2 = element.profile.firstName + ' ' + element.profile.lastName;
                    if( element.profile.firstName.includes(name) || element.profile.lastName.includes(name) || fullName1.includes(name) || fullName2.includes(name) ) {
                        if( element.email !== me.email )
                        {
                            result.push(element);
                        }
                    }
                });
                resolve(result);
            }
        });
    });
}

userModel.upsertTwitterUser = function(token, tokenSecret, profile, cb) {
    var that = this;
    return this.findOne({
      'email': profile.emails[0].value
    }, wrapper(function*(err, user) {
      // no user was found, lets create a new one
        if (user) {
            return cb(err, user);
        } else {
            var newNotification = new _Notification( ) //New Empty Notification Document
            yield newNotification.saveToDataBase()
            
            console.log(profile);

            var newUser = new that({
                email: profile.emails[0].value,
                social : {
                    twitterId : profile.id
                },
                profile : {
                    firstName : profile.name.familyName + profile.name.middleName,
                    lastName : profile.name.givenName,
                    avatarUrl : profile._json.profile_image_url_https
                    //position : profile._json.geo_enabled ? profile._json.status.geo,
                },
                createdTime : moment().utc().format(),
                notificationId : newNotification._id
            });

            newUser.save(function(error, savedUser) {
                if (error) {
                    console.log(error);
                }
                return cb(error, savedUser);
            });var newNotification = new _Notification( ) //New Empty Notification Document
            yield newNotification.saveToDataBase()
            
            console.log(profile);

            var newUser = new that({
                email: profile.emails[0].value,
                social : {
                    twitterId : profile.id
                },
                profile : {
                    firstName : profile.name.familyName + profile.name.middleName,
                    lastName : profile.name.givenName,
                    avatarUrl : profile._json.profile_image_url_https
                    //position : profile._json.geo_enabled ? profile._json.status.geo,
                },
                createdTime : moment().utc().format(),
                notificationId : newNotification._id
            });

            newUser.save(function(error, savedUser) {
                if (error) {
                    console.log(error);
                }
                return cb(error, savedUser);
            });
        }
    }));
};

userModel.search = function( content ) {
    return new Promise( (resolve, reject) => {
        userModel.find({}, (error, users) => {
            if(error) reject(error);
            else {
                var filteredUsers = users.filter( value => {
                    return value.search(content)
                })
                resolve(filteredUsers);
            }
        });
    } );
}

userModel.getNumberOfUserCreatedLastweek = function( ) {
    var today = moment().utc().hours(0);
    var lastweek = moment().utc().subtract(7,'days').hours(0);
    var lastmonth = moment().utc().subtract(30,'days').hours(0);

    return new Promise( (resolve, reject) => {
        userModel.find({}, (error, users) => {
            if(error) reject(error);
            else {
                var filteredUsers = users.filter( value => {
                    return moment(value.createdTime) > lastweek && moment(value.createdTime) < today
                })
                resolve(filteredUsers.length);
            }
        });
    } );
}

userModel.getNumberOfUserCreatedLastmonth = function( ) {
    var today = moment().utc().hours(0);
    var lastweek = moment().utc().subtract(7,'days').hours(0);
    var lastmonth = moment().utc().subtract(30,'days').hours(0);

    return new Promise( (resolve, reject) => {
        userModel.find({}, (error, users) => {
            if(error) reject(error);
            else {
                var filteredUsers = users.filter( value => {
                    return moment(value.createdTime) > lastmonth && moment(value.createdTime) < today
                })
                resolve(filteredUsers.length);
            }
        });
    } );
}

userModel.getNumberOfUserByDate = function( startDate, endDate ) {
    return new Promise( (resolve, reject) => {
        userModel.find({}, (error, users) => {
            if(error) reject(error);
            else {
                var filteredUsers = users.filter( value => {
                    return moment(value.createdTime) > moment(startDate) && moment(value.createdTime) < moment(endDate)
                })
                resolve(filteredUsers.length);
            }
        });
    } );
}

userModel.updateUser = function( userId, newinfo ) {
    return new Promise( (resolve, reject) => {
        userModel.update({ _id : userId }, newinfo, { w:1, multi: true }, (err, res) => {
            if(err) reject(err)
            else resolve(res)
        })
    })
}
// export the model
module.exports = userModel;