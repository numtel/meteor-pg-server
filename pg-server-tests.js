var PREFIX = 'numtel:pg-server - ';

var PORT = 5439; // Keep in sync with test.pg.json

var CONN_STR = 'postgres://'
  + process.env.USER + ':' // Default user is same as system user
  + 'numtel'               // From defaultpw file in NPM package
  + '@localhost:' + PORT
  + '/postgres';           // Default database

Tinytest.addAsync(PREFIX + 'Simple Query', function (test, testDone) {
  pg.connect(CONN_STR, Meteor.bindEnvironment(function(error, client, pgDone) {
    if(error) throw error;
    client.query('SELECT 1+1 AS result', Meteor.bindEnvironment(
      function(error, result) {
        test.equal(result.rows[0].result, 2);
        pgDone();
        testDone();
      }));
  }));
});

Tinytest.addAsync(PREFIX + 'Initialization Queries', function (test, testDone) {
  pg.connect(CONN_STR, Meteor.bindEnvironment(function(error, client, pgDone) {
    if(error) throw error;
    client.query('SELECT * FROM test_table', Meteor.bindEnvironment(
      function(error, result) {
        test.equal(result.rows[0].col, 25);
        pgDone();
        testDone();
      }));
  }));
});
