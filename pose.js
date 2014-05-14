$(function ()
  {
      'use strict';

      $("canvas")
	  .attr("width", $(window).width())
	  .attr("height", $(window).height())
	  .drawLine({
	      strokeStyle: '#000',
	      strokeWidth: 6,
	      x1: 100, y1: 210,
	      x2: 60, y2: 100,
	      x3: 140, y3: 100,
	      x4: 100, y4: 210
	  })
	  .drawArc({
	      strokeStyle: '#000',
	      strokeWidth: 6,
	      x: 100, y: 70, radius: 20
	  });

      var Limb = function (name, x0, y0, len0, th0, len1, th1)
      {
	  this.x0 = x0;
	  this.y0 = y0;
	  this.len0 = len0;
	  this.x1 = x0 + len0 * Math.cos(th0 * Math.PI);
	  this.y1 = y0 + len0 * Math.sin(th0 * Math.PI);
	  this.len1 = len1;
	  this.x2 = this.x1 + len1 * Math.cos((th0 + th1) * Math.PI);
	  this.y2 = this.y1 + len1 * Math.sin((th0 + th1) * Math.PI);
	  this.name = name;
      };
      Limb.prototype = {
	  init: function (canvas)
	  {
	      return canvas.drawLine({
		  strokeStyle: '#000',
		  strokeWidth: 6,
		  x1: this.x0, y1: this.y0,
		  x2: this.x1, y2: this.y1,
		  x3: this.x2, y3: this.y2,
		  name: this.name
	      });
	  }
      };

      var limbs = {
	  'left-arm': new Limb('left-arm', 60, 100, 70, 5/8, 70, -1/8),
	  'right-arm': new Limb('right-arm', 140, 100, 70, 3/8, 70, 1/8),
	  'left-leg': new Limb('left-leg', 100, 210, 80, 5/8, 80, -1/8),
	  'right-leg': new Limb('right-leg', 100, 210, 80, 3/8, 80, 1/8)
      };
      for (var e in limbs)
	  limbs[e].init($("canvas"));
  });
