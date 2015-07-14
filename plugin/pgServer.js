var POSTGRES_STARTUP_TIMEOUT = 10000;

var path = Npm.require('path');
var fs = Npm.require('fs');
var Future = Npm.require('fibers/future');

var postgres;
var outputStdErr = false;
var cleanedUp = false;
var serverReady = false;

// With the pg-server-xxx NPM dependency, cannot simply require files from
//  meteor/tools directory because the Npm.require root directory has changed
var toolDir = path.dirname(process.mainModule.filename);
// Assume never more than 100 directories deep
var rootRelPath = _.range(100).map(function() { return '..' }).join('/');
// Determine meteor/tools relative directory path
var relToolDir = path.join(rootRelPath, toolDir);

// For bindEnvironment()
var fiberHelpers = Npm.require(path.join(relToolDir, 'fiber-helpers.js'));

var npmPkg = determinePlatformNpmPackage();
// Should not happen as package.js should have filtered already
if(npmPkg === null) return;

// Load pg-server-xxx NPM package
var startServer = Npm.require(npmPkg);

// Read settings from somefile.pg.json
Plugin.registerSourceHandler('pg.json', {
  archMatching: 'os'
}, function (compileStep) {
  var settings =
    loadJSONContent(compileStep, compileStep.read().toString('utf8'));

  // Paths inside the application directory where database is to be stored
  var dataDir = settings.datadir || '.meteor/postgresdb';
  var dataDirPath = path.join(process.cwd(), dataDir);

  if('output_stderr' in settings) {
    // Allow debug flag in *.pg.json configuration file
    outputStdErr = !! settings['output_stderr'];
    delete settings['output_stderr'];
  }

  if('datadir' in settings) {
    // dataDir is specified as the first argument to startServer
    delete settings.datadir;
  }

  // Start server, but only once, wait for it to be ready (or not)
  if(!postgres) {
    var fut = new Future;
    postgres = startServer(dataDirPath, settings);

    // After preset timeout, give up waiting for MySQL to start or fail
    setTimeout(fiberHelpers.bindEnvironment(function() {
      if(!fut.isResolved()) {
        console.log('[ERROR] PostgreSQL startup timeout!             ');
        fut['return']();
      }
    }), POSTGRES_STARTUP_TIMEOUT);

    postgres.stderr.on('data', fiberHelpers.bindEnvironment(
    function (data) {
      // Data never used as Buffer
      data = data.toString();
      outputStdErr && console.log('[Postgres] ', data);

      // No need to check more if server started already
      if(fut.isResolved()) return;

      // Check for any known errors
      var errors = [
        /could not bind IPv4 socket: Address already in use/,
        /FATAL: .+/
      ];

      for(var i = 0; i < errors.length; i++) {
        var failure = data.match(errors[i]);
        if(failure !== null) {
          cleanedUp = true;
          console.log('[ERROR] ' + failure[0]);
          return fut['return']();
        }
      }

      var ready = data.match(
        /database system is ready to accept connections/);

      if(ready !== null) {
        serverReady = true;
        // Extra spaces for covering Meteor's status messages
        console.log('=> Started PostgreSQL.                        ');
        fut['return']();
      }
    }));

    return fut.wait();
  }

});

// Stop Postgres server on Meteor exit
Npm.require(path.join(relToolDir, 'cleanup.js')).onExit(
function StopPgServer() {
  if(cleanedUp === false && postgres) {
    // Only cleanup once!
    cleanedUp = true;

    try {
      postgres.kill();
    } catch(err) {
      console.log('[ERROR] Unable to stop PostgreSQL server');
    }
  }
});

function determinePlatformNpmPackage() {
  switch(process.platform + '_' + process.arch) {
    case 'linux_x64': return 'pg-server-9.4-linux-x64';
    case 'linux_ia32': return 'pg-server-9.4-linux-i386';
    case 'darwin_x64': return 'pg-server-9.4-osx-x64';
    default: return null;
  }
}


// Begin code borrowed from mquandalle:bower/plugin/handler.js
var loadJSONContent = function (compileStep, content) {
  try {
    return JSON.parse(content);
  }
  catch (e) {
    compileStep.error({
      message: "Syntax error in " + compileStep.inputPath,
      line: e.line,
      column: e.column
    });
  }
};
// End code from mquandalle:bower
