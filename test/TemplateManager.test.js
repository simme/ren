
/* global describe, it */
/* jshint node: true */
'use strict';

var TemplateManager = require('../lib/TemplateManager');
var assert = require('assert');
var hbs = require('handlebars');

describe('TemplateManager', function () {
  it('correctly sets options', function () {
    var manager = new TemplateManager({
      basePath: __dirname,
      disableCache: true,
      defaultCompiler: '.jade'
    });

    assert.equal(manager.basePath, __dirname);
    assert.ok(manager.disableCache);
    assert.equal(manager.defaultCompiler, '.jade');
  });

  it('throws when loading template with missing compiler', function () {
    var manager = new TemplateManager();
    assert.throws(function () {
      manager.load('foobar.beep', function () {});
    }, /Missing compiler for extension: (\..+)$/);
  });

  it('caches loaded templates', function (done) {
    var manager = new TemplateManager({ basePath: __dirname });
    manager.registerCompiler('.hbs', hbs.compile);
    var viewName = 'views/page.hbs';
    manager.load(viewName, function (err) {
      assert(!err, err);
      assert(manager.cache[viewName] instanceof Function);
      done();
    });
  });

  it('uses cached templates', function (done) {
    var manager = new TemplateManager({ basePath: __dirname });
    manager.registerCompiler('.hbs', hbs.compile);
    manager.cache.foobar = 'bar';
    manager.get('foobar', function (err, template) {
      assert(!err, err);
      assert.equal(template, 'bar');
      done();
    });
  });

  it('loads on demand templates', function (done) {
    var manager = new TemplateManager({ basePath: __dirname });
    manager.registerCompiler('.hbs', hbs.compile);
    var viewName = 'views/page.hbs';
    manager.get(viewName, function (err, template) {
      assert(!err, err);
      assert(template instanceof Function);
      done();
    });
  });

  it('correctly uses default compiler', function (done) {
    var manager = new TemplateManager({ basePath: __dirname });
    manager.registerCompiler('.hbs', hbs.compile);
    var viewName = 'views/page';
    manager.get(viewName, function (err, template) {
      assert(!err, err);
      assert(template instanceof Function);
      done();
    });
  });

  it('catches missing template errors', function (done) {
    var manager = new TemplateManager({ basePath: __dirname });
    manager.registerCompiler('.hbs', hbs.compile);
    var viewName = 'views/barbarbar';
    manager.get(viewName, function (err, template) {
      assert.equal(err.code, 'ENOENT');
      done();
    });
  });

  it('bypasses cache when configured', function (done) {
    var manager = new TemplateManager({ basePath: __dirname, disableCache: true });
    manager.registerCompiler('.hbs', hbs.compile);
    var viewName = 'views/foobar';
    manager.get(viewName, function (err, template) {
      assert(!err, err);
      assert(template instanceof Function);

      manager.cache[viewName] = 'foo';
      manager.get(viewName, function (err, template) {
        assert(!err, err);
        assert(template instanceof Function);

        done();
      });
    });
  });

  it('bypassing constructor still returns constructed object', function () {
    var t = TemplateManager;
    var m = t();
    assert(m instanceof TemplateManager);
  });
});

