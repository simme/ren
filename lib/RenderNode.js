//
// ## Reinder Node
//
// Represents one node in the render tree. This object will listen for it's
// children to complete. Once they are all completed the unit will emit an
// event signifying that it is ready to render. At which time the manager will
// put this unit on the render queue.
//

/* jshint node: true */
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var util = require('util');
var assert = require('assert');

var RenderNode = module.exports = function RenderNode(node, manager, queue, opts) {
  if (!(this instanceof RenderNode)) {
    return new RenderNode(node, manager, queue);
  }
  EventEmitter.call(this);

  assert(node, 'empty nodes are not allowed');

  this.opts = opts || {};
  this.prefix = this.opts.prefix;
  this.queue = queue;
  this.children = [];
  this.readyChildren = 0;
  this.node = node;
  this.data = this.node.data || {};
  this.fn = this.node.function || false;
  var self = this;
  if (!this.fn) {
    manager.load(this.node.template, function (err, fn) {
      if (err) return self.emit('error', err);
      self.fn = fn;
      self.setup(manager, queue);
    });
  }
  else {
    process.nextTick(function () {
      self.setup(manager, queue);
    });
  }

  this.html = false;
};

inherits(RenderNode, EventEmitter);

RenderNode.prototype.setup = function setup(manager, queue) {
  var prefix = this.prefix;
  for (var key in this.data) {
    if (key.indexOf(prefix) === 0) {
      var childNode = new RenderNode(this.data[key], manager, queue, this.opts);
      this.children.push(childNode);
      childNode.on('ready', this.childReady.bind(this));
      childNode.on('rendered', this.childRendered(key));
    }
  }

  // Leafe node, add to queue
  if (this.children.length === 0) {
    queue.push(this);
    this.emit('ready');
  }
};

RenderNode.prototype.childRendered = function childRendered(key) {
  var self = this;
  var prefix = this.prefix;
  var prefixLength = this.prefix.length;
  return function (node) {
    var name = key.substr(prefixLength);
    self.data[name] = node.html;
    delete(self.data[key]);

    self.children.splice(self.children.indexOf(node), 1);
    if (self.children.length === 0) {
      self.queue.push(self);
    }
  };
};

RenderNode.prototype.render = function render(fn) {
  this.html = this.fn(this.data);
  this.emit('rendered', this);

  if (fn) {
    fn(null, this);
  }
};

RenderNode.prototype.childReady = function () {
  this.readyChildren++;
  if (this.readyChildren === this.children.length) {
    this.emit('ready');
  }
};

module.exports = RenderNode;

