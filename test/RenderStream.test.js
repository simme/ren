
/* global describe, it, beforeEach */
/* jshint node: true */
'use strict';

var assert = require('assert');
var fs = require('fs');
var http = require('http');

var hbs = require('handlebars');

var RenderStream = require('../lib/RenderStream');

var opts = {
  basePath: __dirname + '/views',
  compilers: { '.hbs': hbs.compile }
};
var data = require('./data');

describe('RenderStream', function () {
  it('sets up correctly', function () {
    var rs = new RenderStream(data, {
      basePath: __dirname + '/views',
      concurrent: 2,
      prefix: '_',
      defaultCompiler: '.jade',
      disableCache: true,
      compilers: {
        '.jade': function () {}
      }
    });

    assert.equal(rs.prefix, '_', 'prefix not correctly set');
    assert.equal(rs.manager.basePath, __dirname + '/views');
    assert.equal(rs.manager.defaultCompiler, '.jade');
    assert.equal(rs.manager.disableCache, true);
    // No way to really check concurrency setting...
  });

  it('correctly analyzes tree and renders', function (done) {
    var data = require('./data');
    var rs = new RenderStream(data, opts);

    var html = '';
    rs.on('data', function (chunk) {
      html += chunk.toString();
    });
    rs.on('end', function () {
      var expected = fs.readFileSync(__dirname + '/views/expected.html', 'utf-8');
      var rendered = html.replace(/^\s*[\r\n]/gm, '');
      assert.equal(expected, rendered);
      done();
    });

  });

  it('bypassing constructor still returns constructed object', function () {
    var rs = RenderStream;
    var r = rs(data);
    assert(r instanceof RenderStream);
  });

  it('piping to response stream works', function (done) {
    var server = http.createServer(function (req, res) {
      var data = require('./data');
      var rs = new RenderStream(data, opts);

      rs.pipe(res);
    });

    server.listen(0, 'localhost', function () {
      var port = server.address().port;
      var req = http.get('http://localhost:' + port, function (res) {
        var html = '';
        res.setEncoding('utf8');
        res.on('data', function (data) {
          html += data;
        });
        res.on('end', function () {
          var expected = fs.readFileSync(__dirname + '/views/expected.html', 'utf-8');
          var rendered = html.replace(/^\s*[\r\n]/gm, '');
          assert.equal(rendered, expected);
          server.close();
          done();
        });
      });
    });
  });

  it('rendering an array of renderables work', function (done) {
    var rs = new RenderStream([{
      function: function (data) {
        return data.bar;
      },
      data: { bar: 'foo' }
    }, {
      function: function (data) {
        return data.bar;
      },
      data: { bar: 'bar' }
    }], opts);

    var chunks = '';
    rs.on('data', function (chunk) { chunks += chunk; });
    rs.on('end', function () {
      assert.equal('foo\nbar', chunks);
      done();
    });
  });

  it('reading chunks of the buffer works', function (done) {
    var rs = new RenderStream({
      function: function () {
        var buf = new Buffer(16384);
        return buf.toString();
      }
    }, opts);
    var chunk;
    var reads = 0;
    rs.on('readable', function () {
      // I don't know how this works...
      while (null !== (chunk = rs.read(32))) {
        reads++;
      }
    });

    rs.on('end', function () {
      assert.equal(16384/32, reads);
      done();
    });
  });

  it('altering a node works', function (done) {
    var data = require('./data');
    var rs = new RenderStream(data, opts);

    rs.on('willRender', function (node) {
      if (node.node.template === 'page') {
        node.fn = function () {
          return 'bar';
        };
      }
    });

    var html = '';
    rs.on('data', function (chunk) {
      html += chunk.toString();
    });
    rs.on('end', function () {
      var rendered = html.replace(/^\s*[\r\n]/gm, '');
      assert.equal('bar', rendered);
      done();
    });

    rs.start();
  });
});

