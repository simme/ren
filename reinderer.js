//
// # Reinderer
//

/* jshint node: true */
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherit = require('util').inherits;

var RenderStream = require('./lib/RenderStream');

var Reinderer = function Reinderer(options) {
  if (!(this instanceof Reinderer)) {
    return new Reinderer(options);
  }

  EventEmitter.call(this);
};

inherit(Reinderer, EventEmitter);

//
// ## Render
//
// Returns a new render stream.
//
Reinderer.prototype.render = function reindererRender(obj) {
  var stream = new RenderStream(obj);
};

module.exports = Reinderer;
module.exports.RenderStream = RenderStream;
module.exports.prefix = '#';

