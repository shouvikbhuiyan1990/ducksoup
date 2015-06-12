#! /usr/bin/env node

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
var config =  {
    profile: {
        firstname: "firstname",
        lastname: "lastname",
        blogsubtitle: "blogsubtitle",
        otherlink: "http://www.example.com",
        emailId: 'abc@def.gh',
        password: 'qwerty',
        love: 0
    },
    post: {
        minread: 0,
        tags: ["welcome"],
        comments: []
    }
};

// create database for the first time 
// with sample data from config
_id = _id.toString();
db = mongojs('Ducksoup', ['Profile','Post']);
profile = db.collection('Profile');
post = db.collection('Post');
config.post.date = today.toUTCString();
config.post._id = _id;
config.post.body = 'markdowns/' + _id + '.md';
config.profile.blogtitle = App;

console.log( '=============================================================\n' );
profile.insert(config.profile, function(err, doc) {
    
    if( err ) { return ; }
    console.log( 'Sample Profile Created!' );

    post.insert(config.post, function(err, doc) {

        if( err ) { return ; }
        console.log(" ____             _     ____                           ");
        console.log("|  _ \\ _   _  ___| | __/ ___|  ___  _   _ _ __        ");
        console.log("| | | | | | |/ __| |/ /\\___ \\ / _ \\| | | | '_ \\    ");
        console.log("| |_| | |_| | (__|   <  ___) | (_) | |_| | |_) |       ");
        console.log("|____/ \\__,_|\\___|_|\\_\\|____/ \\___/ \\__,_| .__/  ");
        console.log("                                         |_|           ");        
        console.log( 'Sample Post Created!' );
        console.log( 'Start you server by using "npm start" command.' );
        console.log( '=============================================================\n' );
        process.exit(0);

    });

});