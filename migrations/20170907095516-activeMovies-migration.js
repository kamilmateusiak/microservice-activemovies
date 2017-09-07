'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, callback) {
  db.createTable('activemovies', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    title: 'string',
    movieId: 'int',
    date: 'datetime',
    expirationDate: 'datetime'
  }, callback);
};

exports.down = function (db, callback) {
  db.dropTable('activemovies', callback);
};


exports._meta = {
  "version": 1
};
