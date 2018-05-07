//Load Environment variables
require('dotenv').config();

//grab our dependencies
const express = require('express'),
    http = require('http'),
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
    TwitterTokenStrategy = require('passport-twitter-token'),
    _User = require('./app/models/user'),
    app_config = require('./app/config');
    
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

const server = http.createServer(app);

//Websocket
const wss = new WebSocket.Server({ server });
wss.on('connection', wsHandler);

// start our server
server.listen(app_config.APP_PORT, () => {
    //Database connecting
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