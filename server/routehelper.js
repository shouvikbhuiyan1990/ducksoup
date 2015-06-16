var fs = require('fs');
var api = require('./mongoApi.js');
var db_URI = require('../config/database.js').url;
var db = api.getDatabase(db_URI);
var profile = api.getCollection(db, 'Profile');
var post = api.getCollection(db, 'Post');
var errorObj = { error: 'Error' };
var query;
var criteria;
var options;
var postObj;
var today;
var sess;

var generateRandomString = function(length) {

    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
};

var isAuthenticated = function(req) {
    return sess.uniqueUser === req.cookies.uniqueUser;
};

var readAndsend = function (results, res) {

    var returnObj = [];    // copying array
    var len = results.length;
    var counter = 0;

    results.forEach(function(result) {
    
        fs.readFile(result.body, function (err, data) {

            if (err) {res.send(errorObj);}
            result.body = data.toString();
            returnObj.push(result);
            counter++;
            if(counter === len) {res.send(returnObj);}
        });
    });
};

var writeAndsend = function (result, content, res, flag) {

    var path = flag ? 'markdowns/' + result + '.md' : result.body;
    
    fs.writeFile(path, content, function (err) {

        if (err) {res.send(errorObj);}
        else {res.send(result);}
    });
};

var deleteAndSend = function (_id, res) {

    var path = 'markdowns/' + _id + '.md';

    fs.unlink(path, function (err) {

        if (err) {res.send(errorObj);}
        else {res.send(_id);}
    });
}; 

module.exports = {

    callbacks: [

        function (req, res) {    //  get all the posts: default 10
            
            sess = req.session;

            query = {};
            criteria = {};
            options = {limit: 10};

            api.findDocs(post, query, criteria, options, function (err, results) {
                
                if(err) {
                    res.send(errorObj);
                }

                readAndsend(results, res);            
            });
        },  
        function (req, res) {    //  get post with post_id
            
            sess = req.session;

            query = { _id : req.params.post_id };   
            criteria = {};
            options = {};

            api.findDocs(post, query, criteria, options, function (err, results) {
                
                if(err) {
                    res.send(errorObj);
                }

                readAndsend(results, res);
            });
        },  
        function (req, res) {    //  add a new post
            
            sess = req.session;

            !isAuthenticated(req) && res.send(errorObj);        // proceed only if logged in

            today = new Date();
            postObj = {};
            postObj.minread = req.body.minread;
            postObj.tags = [];
            postObj.comments = [];
            postObj.date = today.toUTCString();

            console.log(postObj);
            //  {"name":"pai","age": 22, "tags":[1,2,4,5]}
            api.addDocs(post, postObj, function (err, results) {

                if(err) {
                    res.send(errorObj);
                }

                writeAndsend(results, req.body.content, res);
            });
        },  
        function (req, res) {    //  edit an existing post
            
            sess = req.session;

            today = new Date();
            postObj = {};
            postObj.date = today.toUTCString();
            
            query = { _id : req.params.post_id };

            if (req.body.comments) {
                postObj.comments = req.body.comments;
            } else {
                !isAuthenticated(req) && res.send(errorObj);        // proceed only if logged in
            }

            api.updateDocs(post, query, postObj, function (err, results) {

                if(err) {
                    res.send(errorObj);
                }

                req.body.content && writeAndsend(req.params.post_id, req.body.content, res, true);
            });
        },  
        function (req, res) {    //  remove a post with post_id
            
            sess = req.session;

            !isAuthenticated(req) && res.send(errorObj);        // proceed only if logged in

            query = { _id : req.params.post_id };
            api.removeDocs(post, query, true, function (err, results) {

                if(err) {
                    res.send(errorObj);
                }

                deleteAndSend(req.params.post_id, res);
            });
        },
        function (req, res) {    //  get profile
            
            sess = req.session;

            query = {};
            criteria = {};
            options = {};

            api.findDocs(profile, query, criteria, options, function (err, results) {
                
                res.send(err ? errorObj : results);
                
            });
        },
        function (req, res) {    //  auth            
            
            sess = req.session;

            query = {};
            criteria = {_id:0, emailId:1, password: 1};
            options = {};

            function setSession() {

                req.session.uniqueUser = generateRandomString(15);
                res.cookie('uniqueUser', sess.uniqueUser, { maxAge: 900000, httpOnly: false });
                res.send(sess.uniqueUser);
            }            

            api.findDocs(profile, query, criteria, options, function (err, results) {
                
                if(req.query.email === results[0].emailId && req.query.password === results[0].password) {
                    setSession();
                } else {
                    res.send(errorObj);
                }
            });
        },
        function (req, res) {    //  edit an existing profile
            
            sess = req.session;

            !isAuthenticated(req) && res.send(errorObj);    // proceed only if logged in

            postObj = {};
            
            if(req.body.loveIncreament) {
                postObj.incObj = {love: 1};
            }
            query = {};

            api.updateDocs(profile, query, postObj, function (err, results) {

                if(err) {
                    res.send(errorObj);
                } else {
                    res.send(true);
                }

            });
        }  
    ]
};
