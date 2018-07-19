//Load Environment variables
require('dotenv').config();

//grab our dependencies
const express = require('express'),
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    WebSocket = require('ws'),
    wsHandler = require('./app/ws'),
    app = express(),
    mongo = require('mongoose');
    path = require('path'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session'),
    bodyParser = require('body-parser'),
    cors = require('cors'), //hosting to hosting communication service
    expressLayouts = require('express-ejs-layouts'),
    passport = require('passport'),
    favicon = require('serve-favicon'),
    TwitterTokenStrategy = require('passport-twitter-token'),
    _User = require('./app/models/user'),
    AWS = require('aws-sdk'),
    app_config = require('./app/config');

AWS.config.update({ accessKeyId: app_config.AWS_ACCESS_KEY_ID, secretAccessKey: app_config.AWS_SECRET_ACCESS_KEY, region: 'us-east-1' });

//passport configuration
passport.use(new TwitterTokenStrategy({
        consumerKey: app_config.TWITTER_CONSUMER_KEY,
        consumerSecret: app_config.TWITTER_CONSUMER_SECRET_KEY,
        includeEmail: true
    },
    function (token, tokenSecret, profile, done) {
        _User.upsertTwitterUser(token, tokenSecret, profile, function(err, user) {
            return done(err, user);
        });
    }
));

// configure our application
app.use(express.static(__dirname + '/public'));
//app.use(favicon(__dirname + '/public/images/favicon.png'));
//App Access-Origin fixing(Cross origin)
app.use(cors()); //important

//Logger Middleware
app.use(morgan('dev'));

//Parsing cookie middleware
app.use(cookieParser());

//Parsing body middleware
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [app_config.SESSION.cookieKey]
}));

app.use(bodyParser.json({ limit : '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

//set ejs as our templating engine
app.set('view engine', 'ejs');
app.use(expressLayouts);

// set the routes
app.use(require('./app/routes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    console.log(err);
    res.send({ success : false, message : err.message });
});
/*
var options =
{
    key:  fs.readFileSync('cert/server.key'),
    cert: fs.readFileSync('cert/server.crt')
};

const server = https.createServer(options, app);*/
const server = http.createServer( app );
//Websocket
const wss = new WebSocket.Server({ server });

wss.on('connection', wsHandler);

// start our server
server.listen(app_config.APP_PORT, () => {
    //Database connecting
    /*
    const options = {
        autoIndex: false, // Don't build indexes
        reconnectTries: 30, // Retry up to 30 times
        reconnectInterval: 500, // Reconnect every 500ms
        poolSize: 10, // Maintain up to 10 socket connections
        // If not connected, return errors immediately rather than waiting for reconnect
        bufferMaxEntries: 0
    }
    
    const connectWithRetry = () => {
        console.log('MongoDB connection with retry')
        mongo.connect("mongodb://localhost/heybuddy", options).then(()=>{
            console.log('MongoDB is connected')
        }).catch(err=>{
            console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
            setTimeout(connectWithRetry, 5000)
        })
    }
    
    connectWithRetry()
    */
    mongo.connect( app_config.DB_URI,{
            auth: {
                user: app_config.DB_USER,
                password: app_config.DB_PASSWORD
            }}
        )
        .then( () => { 
            console.log('DB Connection Successful!');
            console.log(`App is listening on http://localhost:${app_config.APP_PORT}`); 
        })
        .catch( (err) => { console.error(err) });
});