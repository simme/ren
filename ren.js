//
// # Ren
//

/* jshint node: true */
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherit = require('util').inherits;

var RenderStream = require('./lib/RenderStream');

var Ren = module.exports = function Ren(options) {
  if (!(this instanceof Ren)) {
    return new Ren(options);
  }

  this.opts = options;

  EventEmitter.call(this);
};

inherit(Ren, EventEmitter);

//
// ## Render
//
// Returns a new render stream.
//
Ren.prototype.render = function renRender(obj, opts) {
  for (var key in this.opts) {
    if (typeof opts[key] === 'undefined') {
      opts[key] = this.opts[key];
    }
  }
  var stream = new RenderStream(obj, opts);

  return stream;
};

