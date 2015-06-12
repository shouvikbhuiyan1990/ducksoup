var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;

exports.getDatabase = function (dbname) {

    return mongojs(dbname);
};

exports.getCollection = function (db, collectionname) {

    return  db.collection(collectionname);
};

exports.addDocs = function (collection, docs, callback) {

    var _id = new ObjectId();
    _id = _id.toString();   // avoid objectId

    docs['_id'] = _id;
    docs['body'] = 'markdowns/' + _id + '.md';

    collection.insert(docs, callback);
};

exports.updateDocs = function (collection, query, update, options, callback) {

    if(update.incObj) {

        update = update.incObj;
        update = { $inc: update };
    } else {

        update = { $set: update };    
    }
    
    collection.update(query, update, options, callback);
};

exports.findDocs = function (collection, query, criteria, options, callback, limit) {
    
    collection.find(query, criteria, options, callback);
};

exports.removeDocs = function (collection, query, justOne, callback) {

    collection.remove( query, justOne, callback );
};
