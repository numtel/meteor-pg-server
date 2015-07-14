Package.describe({
  name: 'numtel:pg-server',
  version: '0.0.2',
  summary: 'Run PostgreSQL server inside your Meteor app',
  git: 'https://github.com/numtel/meteor-pg-server',
  documentation: 'README.md'
});

function determinePlatformNpmPackage() {
  switch(process.platform + '_' + process.arch) {
    case 'linux_x64': return 'pg-server-9.4-linux-x64';
    case 'linux_ia32': return 'pg-server-9.4-linux-i386';
    case 'darwin_x64': return 'pg-server-9.4-osx-x64';
    default: return null;
  }
}

// Force Meteor to recognize that this package has binary deps
// bcrypt is an npm package that
// has different binaries for differnet architectures.
Npm.depends({
  bcrypt: '0.8.2'
});

var npmPkg = determinePlatformNpmPackage();

if(npmPkg === null) {
  console.error('ERROR: Platform is not supported by numtel:pg-server!');
  console.error('       Supports only Linux (32 and 64 bit) and OSX (64 bit)');
} else {
  var depend = {};
  // platform dependent pg-server-xxx package
  depend[npmPkg] = '9.4.4';

  Package.registerBuildPlugin({
    name: 'pgServer',
    use: [ 'underscore@1.0.3' ],
    sources: [
      'plugin/pgServer.js'
    ],
    npmDependencies: depend
  });
}

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('numtel:pg-server');
  api.use('numtel:pg@0.0.3');

  api.addFiles('test.pg.json', 'server');
  api.addFiles('pg-server-tests.js', 'server');
});
