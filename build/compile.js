var jade = require('jade'),
    async = require('async'),
    utils = require('kanso-utils/utils'),
    spawn = require('child_process').spawn,
    attachments = require('kanso-utils/attachments'),
    fs = require('fs'),
    path = require('path');


function compileJade(project_path, filename, settings, callback) {
    // we get a rather cryptic error when trying to compile a file that doesn't
    // exist, so check early for that and report something sensible
    fs.exists(filename, function (exists) {
        if (!exists) {
            return callback(new Error('File does not exist: ' + filename));
        }
        console.log('Compiling ' + utils.relpath(filename, project_path));
        jade = require('jade');

        require('fs').readFile(filename, 'utf8', function(err, str) {
          if (err) {
             return callback(err, null);
          }
          fn = jade.compile(str, { pretty: !(settings.jade && settings.jade.compress), filename: filename });
          res = fn( settings.jade.constants || settings || {} );

          callback(null, res);
          return
        });
    });
};

function collectPaths(paths, root, callback) {
    var results = [];
    if (paths === true) {
        paths = ['.']; // "true" means the current directory and everything under it
    } else {
        paths = paths || [];
    }
    if (!Array.isArray(paths)) {
        paths = [ paths ];
    }

    async.forEach(paths, function(p, cb) {
        if (/^\.[^.]|~$/.test(p)) { // ignore hidden files
            cb();
        } else {
            p = path.resolve(root, p); //resolve path before doing stat
            fs.stat(p, function(err, stats) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        cb();
                    } else {
                        cb(err);
                    }
                } else {
                    if (stats.isDirectory()) {
                        fs.readdir(p, function(err, files) {
                            if (err) {
                                cb(err);
                            } else {
                                collectPaths(files, p, function(err, subresults) {
                                  results = results.concat(subresults);
                                  cb(); // have visited all of this directory
                                });
                            }
                        });
                    } else if (/\.jade$/.test(p)) {
                        results.push(p);
                        cb();
                    } else {
                        cb(); // this file isn't a jade file so don't precompile it
                    }
                }
            });
        }
    },
    function(err) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    });
}

module.exports = function (root, path, settings, doc, callback) {
    if (!settings.jade || !settings.jade.compile) {
        return callback(null, doc);
    }

    collectPaths(settings.jade.compile, root, function(err, paths) {
      if (err) {
          callback(err);
      } else {
          async.forEach(paths, function(p, cb) {
              var name = utils.relpath(p.replace(/\.jade$/, '.html'), path),
                  filename = utils.abspath(p, path);
              compileJade(path, filename, settings, function (err, css) {
                  if (err) {
                      return cb(err);
                  }
                  var ddoc_name=name;
                  (settings.jade.rewrites || []).forEach(function(r) {
                    ddoc_name=ddoc_name.replace(new RegExp(r[0]), r[1]);
                  });
                  attachments.add(doc, ddoc_name, name, new Buffer(css));
                  //doc._attachments[name] = {
                      //content_type: 'text/html',
                      //data: new Buffer(css).toString('base64')
                  //};
                  cb();
              });
          },
          function (err) {
              callback(err, doc);
          });
      }
    });
};
