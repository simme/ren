//
// # Render Stream
//
// Recieves a renderable object and turns that into HTML.
//

/* jshint node: true */
'use strict';

var Stream = require('stream').Readable;
var Buffer = require('buffer').Buffer;
var inherits = require('util').inherits;
var assert = require('assert');
var path = require('path');

var Contra = require('contra');

var TemplateManager = require('./TemplateManager');
var RenderNode = require('./RenderNode');

//
// ## Render Stream
//
// Creates a new render stream with the given renderable tree.
//
// Inherits from stream.Readable.
//
var RenderStream = function RenderStream(renderable, opts) {
  if (!(this instanceof RenderStream)) {
    return new RenderStream();
  }

  Stream.call(this);

  opts = opts || {};
  var concurrent = opts.concurrent || 4;

  // Internal state.
  this.prefix     = opts.prefix || '#';
  this.nodes      = [];
  this.htmlBuffer = null;
  this.bytesRead  = 0;
  this.delegate   = null;
  this.queue      = Contra.queue(this.renderNode.bind(this), concurrent);
  this.manager    = new TemplateManager(opts);

  // Register compilers
  if (!opts.compilers) assert('missing compilers option');
  for (var extension in opts.compilers) {
    this.manager.registerCompiler(extension, opts.compilers[extension]);
  }

  if (!Array.isArray(renderable)) {
    renderable = [renderable];
  }
  this.nodeCount = renderable.length;
  this.renderable = renderable;
  this.nodes = [];

  this.queue.on('drain', function () {
    var unfinished = this.nodes.filter(function (item) {
      return item.html === false;
    });

    // Could be smarter about this if there are more then one root node.
    // Maybe add to the buffer as soon as the first is ready instead of waiting
    // for all of them. Unikely use case though.
    /* istanbul ignore else */
    if (unfinished.length === 0) {
      var html = this.nodes.map(function (n) { return n.html; }).join('\n');
      this.htmlBuffer = new Buffer(html, 'utf-8');

      this.emit('length', this.htmlBuffer.byteLength);
      this.emit('readable');
    }

  }.bind(this));

  this.started = false;
};

inherits(RenderStream, Stream);

//
// ## Start
//
RenderStream.prototype.start = function renderStart() {
  if (this.started) return;
  this.started = true;
  this.nodes = this.renderable.map(this.disectRenderable.bind(this));
};

//
// ## Read from stream
//
RenderStream.prototype._read = function renderRead(size) {
  if (!this.started) this.start();
  if (!this.htmlBuffer) return this.push('');
  this.push(this.htmlBuffer.slice(this.bytesRead, size));
  this.bytesRead += size;
  if (this.bytesRead >= this.htmlBuffer.length) {
    this.push(null);
  }
};

// 
// ## Render a node
//
// Renders one node of the tree.
//
RenderStream.prototype.renderNode = function renderNodel(node, done) {
  var self = this;
  this.emit('willRender', node);
  node.render(function () {
    self.emit('didRender', node);
    done();
  });
};

//
// ## Disect renderable
//
// Traverses the renderable tree and creates RenderNodes for each part of the
// structure. Leaf nodes are added to the queue.
//
RenderStream.prototype.disectRenderable = function renderDisect(node) {
  var rn = new RenderNode(node, this.manager, this.queue, {
    prefix: this.prefix
  });
  return rn;
};

module.exports = RenderStream;

