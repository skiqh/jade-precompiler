var jade = require('jade'),
    async = require('async'),
    utils = require('kanso-utils/utils'),
    spawn = require('child_process').spawn,
    path = require('path');


function compileJade(project_path, filename, settings, callback) {
    // we get a rather cryptic error when trying to compile a file that doesn't
    // exist, so check early for that and report something sensible
    path.exists(filename, function (exists) {
        if (!exists) {
            return callback(new Error('File does not exist: ' + filename));
        }
        console.log('Compiling ' + utils.relpath(filename, project_path));
        jade = require('jade');
        
        
        require('fs').readFile(filename, 'utf8', function(err, str) {
          if (err) {
             return callback(err, null);
          }
          fn = jade.compile(str, { pretty: !(settings.jade && settings.jade.compress) });
          res = fn( settings.jade.constants || settings || {} );
          
          callback(null, res);
          return
        });
        // var args = [filename];
        // if (settings.jade.compress) {
            // args.unshift('--compress');
        // }
        // var jadec = spawn(__dirname + '/../node_modules/jade/bin/jade', args);

        // var css = '';
        // var err_out = '';
        // jadec.stdout.on('data', function (data) {
            // css += data;
        // });
        // jadec.stderr.on('data', function (data) {
            // err_out += data;
        // });
        // jadec.on('exit', function (code) {
            // if (code === 0) {
                // callback(null, css);
            // }
            // else {
                // callback(new Error(err_out));
            // }
        // });
    });
};

module.exports = function (root, path, settings, doc, callback) {
    if (!settings.jade || !settings.jade.compile) {
        return callback(null, doc);
    }
    var paths = settings.jade.compile || [];
    if (!Array.isArray(paths)) {
        paths = [paths];
    }
    async.forEach(paths, function (p, cb) {
        var name = p.replace(/\.jade$/, '.html');
        var filename = utils.abspath(p, path);
        compileJade(path, filename, settings, function (err, css) {
            if (err) {
                return cb(err);
            }
            doc._attachments[name] = {
                content_type: 'text/html',
                data: new Buffer(css).toString('base64')
            };
            cb();
        });
    },
    function (err) {
        callback(err, doc);
    });
};
