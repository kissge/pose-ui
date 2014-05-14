$(function ()
  {
      'use strict';

      $("canvas")
	  .css("left", ($(window).width() - 400) / 2 + "px")
	  .css("top", ($(window).height() - 400) / 2 + "px")
	  .attr("width", 400)
	  .attr("height", 400)
	  .drawLine({
	      draggable: true,
	      strokeStyle: '#000',
	      strokeWidth: 6,
	      x1: 200, y1: 210,
	      x2: 160, y2: 100,
	      x3: 240, y3: 100,
	      x4: 200, y4: 210,
	      drag: function (layer) { layer.x = layer.y = 0; }
	  })
	  .drawArc({
	      draggable: true,
	      strokeStyle: '#000',
	      strokeWidth: 6,
	      x: 200, y: 70, radius: 20,
	      drag: function (layer) { layer.x = 200; layer.y = 70; }
	  })
	  .drawQuadratic({
	      draggable: true,
	      strokeStyle: '#666',
	      strokeWidth: 8,
	      rounded: true,
	      startArrow: true,
	      endArrow: true,
	      arrowRadius: 15,
	      arrowAngle: 90,
	      x1: 330, y1: 150,
	      cx1: 370, cy1: 200,
	      x2: 330, y2: 250,
	      drag: function (layer) { layer.x = layer.y = 0; }
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
      var _ = function (i) { return ['-upper', '-lower'][i]; };
      Limb.prototype = {
	  mouseover: function (canvas, part)
	  {
	      canvas.getLayer(this.name + _(part)).strokeStyle = '#f00';
	  },
	  mouseout: function (canvas, part)
	  {
	      canvas.getLayer(this.name + _(part)).strokeStyle = '#000';
	  },
	  dragstart: function (canvas, part)
	  {
	      var layer = canvas.getLayer(this.name + _(part)), layer_shadow = canvas.getLayer(this.name + _(part) + '-shadow');
	      layer.strokeStyle = 'rgba(0, 0, 0, 0.1)';
	      layer_shadow.strokeStyle = 'maroon';
	      layer_shadow.strokeWidth = 6;
	      canvas.moveLayer(this.name + _(part) + '-shadow');
	  },
	  drag: function (canvas, part)
	  {
	  },
	  dragstop: function (canvas, part)
	  {
	      var layer = canvas.getLayer(this.name + _(part)), layer_shadow = canvas.getLayer(this.name + _(part) + '-shadow');
	      layer.strokeStyle = '#f00';
	      layer.x = layer_shadow.x;
	      layer.y = layer_shadow.y;
	      canvas.moveLayer(this.name + _(part), 1);
	      layer_shadow.strokeStyle = 'rgba(0, 0, 0, 0.0)';
	      layer_shadow.strokeWidth = 30;
	      canvas.moveLayer(this.name + _(part) + '-shadow', 2);
	      canvas.drawLayers();
	  },
	  init: function (canvas)
	  {
	      return canvas
		  .drawLine({
		      draggable: true,
		      strokeStyle: '#000',
		      strokeWidth: 6,
		      x1: this.x0, y1: this.y0,
		      x2: this.x1, y2: this.y1,
		      name: this.name + '-upper'
		  })
		  .drawLine({
		      draggable: true,
		      strokeStyle: 'rgba(0, 0, 0, 0.0)',
		      strokeWidth: 30,
		      x1: this.x0, y1: this.y0,
		      x2: this.x1, y2: this.y1,
		      name: this.name + '-upper-shadow',
		      mouseover: Limb.prototype.mouseover.bind(this, canvas, 0),
		      mouseout: Limb.prototype.mouseout.bind(this, canvas, 0),
		      dragstart: Limb.prototype.dragstart.bind(this, canvas, 0),
		      drag: Limb.prototype.drag.bind(this, canvas, 0),
		      dragstop: Limb.prototype.dragstop.bind(this, canvas, 0),
		      dragcancel: Limb.prototype.dragstop.bind(this, canvas, 0)
		  })
		  .drawLine({
		      draggable: true,
		      strokeStyle: '#000',
		      strokeWidth: 6,
		      x1: this.x1, y1: this.y1,
		      x2: this.x2, y2: this.y2,
		      name: this.name + '-lower'
		  })
		  .drawLine({
		      draggable: true,
		      strokeStyle: 'rgba(0, 0, 0, 0.0)',
		      strokeWidth: 30,
		      x1: this.x1, y1: this.y1,
		      x2: this.x2, y2: this.y2,
		      name: this.name + '-lower-shadow',
		      mouseover: Limb.prototype.mouseover.bind(this, canvas, 1),
		      mouseout: Limb.prototype.mouseout.bind(this, canvas, 1),
		      dragstart: Limb.prototype.dragstart.bind(this, canvas, 1),
		      drag: Limb.prototype.drag.bind(this, canvas, 1),
		      dragstop: Limb.prototype.dragstop.bind(this, canvas, 1),
		      dragcancel: Limb.prototype.dragstop.bind(this, canvas, 1)
		  });
	  }
      };

      var limbs = {
	  'left-arm': new Limb('left-arm', 160, 100, 70, 5/8, 70, -1/8),
	  'right-arm': new Limb('right-arm', 240, 100, 70, 3/8, 70, 1/8),
	  'left-leg': new Limb('left-leg', 200, 210, 80, 5/8, 80, -1/8),
	  'right-leg': new Limb('right-leg', 200, 210, 80, 3/8, 80, 1/8)
      };
      for (var e in limbs)
	  limbs[e].init($("canvas"));

      $('canvas')
	  .on('dblclick',
	      function ()
	      {
		  $('<img>')
		      .attr('src', this.toDataURL())
		      .css('width', '100px')
		      .appendTo($('body'));
	      });
  });
