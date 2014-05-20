//
// # Template Manager
//
// Responsible for managing views, loading them, caching them etc.
//

/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var util = require('util');

var TemplateManager = function TemplateManager(opts) {
  if (!(this instanceof TemplateManager)) {
    return new TemplateManager(opts);
  }

  opts = opts || {};

  this.basePath = opts.basePath || process.cwd();
  this.cache = {};
  this.disableCache = opts.disableCache || false;
  this.compilers = {};
  this.defaultCompiler = opts.defaultCompiler || '.hbs';
};

TemplateManager.prototype.get = function templateGet(name, fn) {
  if (!this.cache[name]) {
    this.loadTemplate(name, fn);
  }
  else {
    fn(null, this.cache[name]);
  }
};

TemplateManager.prototype.load = function templateLoad(name, fn) {
  var extname = path.extname(name);
  if (!extname.length) {
    extname = this.defaultCompiler;
  }

  var compiler = this.compilers[extname];
  assert(compiler, util.format('Missing compiler for extension: %s', extname));

  var self = this;
  var opts = { encoding: 'utf-8' };
  fs.readFile(path.join(this.basePath, name), opts, function (err, contents) {
    if (err) return fn(err);

    if (!self.disableCache) {
      self.cache[name] = compiler(contents);
    }

    fn(null, self.cache[name]);
  });
};

TemplateManager.prototype.registerCompiler = function templateCompiler(ext, fn) {
  this.compilers[ext] = fn;
};

module.exports = TemplateManager;

