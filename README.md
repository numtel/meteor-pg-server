# numtel:pg-server [![Build Status](https://travis-ci.org/numtel/meteor-pg-server.svg?branch=master)](https://travis-ci.org/numtel/meteor-pg-server)

Package to run PostgreSQL server inside your Meteor app

## Installation

> Currently only supports Linux (32 and 64 bit) and Mac OSX (64 bit). Windows support is expected in the near future.

Add this package to your application to embed a PostgreSQL server:

```
meteor add numtel:pg-server
```

A settings file must be created with the extension of `.pg.json` in your application. A file name like `myapp.pg.json` is valid.

If a `datadir` setting is not specified, the PostgreSQL data will default to your application's `.meteor/postgresdb` directory. The directory will be created if it does not exist.

When specifying a `datadir` setting, the path is relative to your application root.

See [`test.pg.json`](test.pg.json) for an example. Settings are used to build the `postgres.conf` file. Specifying a port is recommended.

## Usage

With the start of you Meteor application, you will notice a new line output to the console:

```
=> Started PostgreSQL.
```

The PostgreSQL server is started on the local machine and may be used with the `numtel:pg` package by using the following connection string:

```javascript
var CONN_STR = 'postgres://'
  + process.env.USER + ':' // Default user is same as system user
  + 'numtel'               // From defaultpw file in NPM package
  + '@localhost:' + PORT   // Port as specified in .pg.json file (default: 5432)
  + '/postgres';           // Default database
```

## Resources

* [`numtel:pg` - Reactive PostgreSQL for Meteor](https://github.com/numtel/meteor-pg)
* [Leaderboard example modified to use PostgreSQL](https://github.com/numtel/meteor-pg-leaderboard)

## License

MIT
