
/* global describe, it, beforeEach */
/* jshint node: true */
'use strict';

var assert = require('assert');
var fs = require('fs');

var hbs = require('handlebars');

var Ren = require('../');

var opts = {
  basePath: __dirname + '/views',
  compilers: { '.hbs': hbs.compile },
  concurrent: 1,
  prefix: '__',
  disableCache: true
};
var data = require('./data');

describe('Ren', function () {
  it('correctly merges default options', function (done) {
    var r = new Ren(opts);
    var rs = r.render(data, { prefix: '#' });

    var html = '';
    rs.on('data', function (chunk) {
      html += chunk.toString();
    });
    rs.on('end', function () {
      var expected = fs.readFileSync(__dirname + '/views/expected.html', 'utf-8');
      var rendered = html.replace(/^\s*[\r\n]/gm, '');
      assert.equal(expected, rendered);
      assert.equal(rs.manager.disableCache, true);
      done();
    });
  });

  it('bypassing constructor still returns constructed object', function () {
    var rs = Ren;
    var r = rs();
    assert(r instanceof Ren);
  });
});

