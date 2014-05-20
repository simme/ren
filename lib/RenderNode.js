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

var prefix = require('../').prefix;
var prefixLength = prefix.length;

var RenderNode = function RenderNode(node, manager, queue) {
  if (!(this instanceof RenderNode)) {
    return new RenderNode();
  }
  EventEmitter.call(this);

  this.queue = queue;
  this.children = [];
  this.node = node;
  this.data = this.node.data;
  this.fn = this.node.fn || false;
  var self = this;
  if (!this.fn) {
    manager.load(this.node.template, function (err, fn) {
      if (err) throw err;
      self.fn = fn;
      self.setup(manager, queue);
    });
  }
  else {
    self.setup(manager, queue);
  }

  this.html = false;
};

inherits(RenderNode, EventEmitter);

RenderNode.prototype.setup = function setup(manager, queue) {
  for (var key in this.data) {
    if (!this.data.hasOwnProperty(key)) continue;
    if (key.indexOf(prefix) === 0) {
      var childNode = new RenderNode(this.data[key], manager, queue);
      childNode.on('rendered', this.childRendered(key));
      this.children.push(childNode);
    }
  }

  // Leafe node, add to queue
  if (this.children.length === 0) {
    queue.push(this);
  }
};

RenderNode.prototype.childRendered = function childRendered(key) {
  var self = this;
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
  fn(null, this);
};

module.exports = RenderNode;

