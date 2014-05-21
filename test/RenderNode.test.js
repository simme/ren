/* global describe, it */
/* jshint node: true */
'use strict';

var assert = require('assert');
var fs = require('fs');

var contra = require('contra');
var hbs = require('handlebars');

var RenderNode = require('../lib/RenderNode');
var TemplateManager = require('../lib/TemplateManager');

describe('RenderNode', function () {
  it('correctly parses a view tree', function (done) {
    var manager = new TemplateManager({ basePath: __dirname + '/views' });
    manager.registerCompiler('.hbs', hbs.compile);
    var queue = contra.queue(function (node, done) {
      node.render();
      done();
    });
    queue.pause();

    var tree = {
      template: 'page',
      data: {
        '#navbar': {
          template: 'partials/navbar',
          data: {
            links: [1, 2, 3]
          }
        },
        '#contents': {
          template: 'page_content',
          data: {
            title: 'fobar',
            introduction: 'lorem ipsum',
            aListOfStuff: ['a', 'b', 'c'],
            '#anotherTemplate': {
              template: 'foobar',
              data: {
                foobar: 'bar'
              }
            },
            '#functionTemplate': {
              function: function (data) {
                return data.foobar;
              },
              data: {
                foobar: 'bar'
              }
            }
          }
        }
      }
    };

    var rn = new RenderNode(tree, manager, queue);

    // ready emitted when all child nodes have loaded their templates
    rn.on('ready', function () {
      // Queue should contain 3 items, since we have 3 lead nodes and queue is
      // paused.
      assert.equal(queue.pending.length, 3, 'missing items in queue');

      // Start queue
      queue.resume();
    });

    // emits rendered when completely done
    rn.on('rendered', function () {
      var html = fs.readFileSync(__dirname + '/views/expected.html', 'utf-8');
      var rendered = rn.html.replace(/^\s*[\r\n]/gm, '');
      assert.equal(html, rendered);
      done();
    });
  });

  it('bypassing constructor still returns constructed object', function () {
    var manager = new TemplateManager({ basePath: __dirname + '/views' });
    manager.registerCompiler('.hbs', hbs.compile);
    var t = RenderNode;
    var m = t({ template: 'foobar' }, manager, contra.queue(function () {}));
    assert(m instanceof RenderNode);
  });

  it('calls render callback', function (done) {
    var manager = new TemplateManager({ basePath: __dirname + '/views' });
    manager.registerCompiler('.hbs', hbs.compile);
    var rn = new RenderNode({ template: 'foobar' }, manager, contra.queue(function () {}));
    rn.on('ready', function () {
      rn.render(function (err, node) {
        assert(!err, err);
        assert(node === rn);
        done();
      });
    });
  });

  it('emits error on missing template', function (done) {
    var manager = new TemplateManager({ basePath: __dirname + '/views' });
    manager.registerCompiler('.hbs', hbs.compile);
    var rn = new RenderNode({ template: 'bar' }, manager, contra.queue(function () {}));
    rn.on('error', function (err) {
      assert.equal(err.code, 'ENOENT');
      done();
    });
  });
});

