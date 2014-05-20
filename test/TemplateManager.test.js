
/* global describe, it */
/* jshint node: true */
'use strict';

var TemplateManager = require('../lib/TemplateManager');
var assert = require('assert');

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
    
  });
});

