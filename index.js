var qs = require('querystring');
var express = require('express');
var session = require('express-session');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
var routeHelper = require('./server/routehelper.js');
var cookieParser = require('cookie-parser');
var port = 9990;

// middlewares
app.use(session({ secret: 'nowyouseeme' }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/client'));
app.listen(process.env.PORT || port);
app.use('/api', router);

// routing 
router.get('/posts', routeHelper.callbacks[0]);
router.get('/posts/:post_id', routeHelper.callbacks[1]);

router.post('/posts', routeHelper.callbacks[2]);
router.post('/posts/:post_id', routeHelper.callbacks[3]);
 
router.delete('/posts/:post_id', routeHelper.callbacks[4]);
router.get('/profile', routeHelper.callbacks[5]);

router.get('/auth', routeHelper.callbacks[6]);
router.post('/profile', routeHelper.callbacks[7]);


console.log('Server running @ ' + port);
