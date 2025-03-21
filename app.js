const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const passport = require('passport');
const async = require('async');

const dataManager = require('./util/dataManager');
const auth = require('./util/auth');
const config = require('./util/config');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

auth(passport);
app.use(session({
    store: new RedisStore({
        client: require('./util/databaseManager').getRedisCluster()
    }),
    resave: false,
    saveUninitialized: false,
    secret: config.sessionSecret
}));
app.use(passport.initialize());
app.use(passport.session());

// Middleware to include locals
app.use(function (req, res, next) {
    res.locals.user = req.user === undefined ? null : req.user;
    res.locals.loggedIn = req.user !== undefined;
    if (req.method === 'POST') {
        return next();
    }
    if (req.path.startsWith('/api')) {
        // Check if we can cache the request
        dataManager.getCachedPage(req.originalUrl, function (err, cache) {
            if (cache === null) {
                return next();
            }
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(cache);
            res.end();
        });
        return;
    }
    try {
        async.parallel([
            function (callback) {
                dataManager.getAllSoftware(['name', 'url', 'globalPlugin'], callback);
            },
            function (callback) {
                if (req.user !== undefined) {
                    dataManager.getPluginsOfUser(req.user.username, ['name', 'software'], callback);
                } else {
                    callback(null, []);
                }
            }
        ], function(err, results) {
            if (err) {
                return next(err);
            }
            res.locals.allSoftware = results[0];
            res.locals.myPlugins = results[1];
            // Replace the software id with a proper object
            for (let i = 0; i < results[1].length; i++) {
                for (let j = 0; j < results[0].length; j++) {
                    if (results[1][i].software === results[0][j].id) {
                        results[1][i].software = results[0][j];
                    }
                }
            }
            next();
        });
    } catch (err) {
        console.log(err);
    }
});

// Middleware to include the custom color local
app.use(function (req, res, next) {
    let customColor1 = req.cookies["custom-color1"];
    customColor1 = customColor1 === undefined ? 'teal' : customColor1;
    res.locals.customColor1 = customColor1;
    next();
});


app.use('/', require('./routes/index'));
app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));
app.use('/register', require('./routes/register'));
app.use('/submitData', require('./routes/submitData'));
app.use('/global', require('./routes/global'));
app.use('/plugin', require('./routes/plugin'));
app.use('/author', require('./routes/author'));
app.use('/editPlugin', require('./routes/editPlugin'));
app.use('/plugin-list', require('./routes/pluginList'));
app.use('/add-plugin', require('./routes/addPlugin'));
app.use('/getting-started', require('./routes/gettingStarted'));
app.use('/help/custom-charts', require('./routes/customCharts'));
app.use("/credits", require("./routes/credits"));
app.use('/privacy-policy', require('./routes/privacyPolicy'));
app.use('/terms-of-use', require('./routes/termsOfUse'));
app.use('/imprint', require('./routes/imprint'));
app.use('/faq', require('./routes/faq'));
app.use('/help/rest-api', require('./routes/restApi'));
app.use('/admin', require('./routes/admin'));
app.use('/what-is-my-plugin-id', require('./routes/whatIsMyPluginId'));

// Api v1
app.use('/api/v1/plugins', require('./routes/api/v1/plugin'));
app.use('/api/v1/datatable', require('./routes/api/v1/datatable'));
app.use('/api/v1/software', require('./routes/api/v1/software'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    if (req.path.startsWith('/api')) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({error: 'Invalid URL'}));
        res.end();
    } else {
        next(err);
    }
});

// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    if (err.status === undefined) {
        err.status = 500;
    }
    if (err.message === undefined) {
        err.message = 'Unknown';
    }
    console.log(JSON.stringify(err));
    res.render('error', {
        message: err.message,
        error: err
    });
});

app.locals.dataManager = dataManager;

module.exports = app;
