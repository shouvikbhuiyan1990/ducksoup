var App = process.argv[2];

if ( !App ) { 
    console.log( 'Please try again with your app name as an argument' );
    return;
}

var fs = require('fs');
var mongojs = require('mongojs');
var db, profile, post;
var today = new Date();
var _id = 'welcome';
var configAuth = require('./config/auth.js');
var configDB = require('./config/database.js');

// create database for the first time 
// with sample data from config
_id = _id.toString();
db = mongojs(configDB.url, ['Profile','Post']);
profile = db.collection('Profile');
post = db.collection('Post');

configAuth.post.date = today.toUTCString();
configAuth.post._id = _id;
configAuth.post.body = 'markdowns/' + _id + '.md';
configAuth.profile.blogtitle = App;

console.log( '+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n' );
console.log(" ____             _     ____                           ");
console.log("|  _ \\ _   _  ___| | __/ ___|  ___  _   _ _ __        ");
console.log("| | | | | | |/ __| |/ /\\___ \\ / _ \\| | | | '_ \\    ");
console.log("| |_| | |_| | (__|   <  ___) | (_) | |_| | |_) |       ");
console.log("|____/ \\__,_|\\___|_|\\_\\|____/ \\___/ \\__,_| .__/  ");
console.log("                                         |_|           ");        

profile.insert(configAuth.profile, function(err, doc) {
    
    if( err ) { return ; }
    console.log( 'Sample Profile Created!' );

    post.insert(configAuth.post, function(err, doc) {

        if( err ) { return ; }
        console.log( 'Sample Post Created!' );
        console.log( 'Start you server by using "npm start" command.' );
        console.log( '+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n' );
        process.exit(0);

    });

});
