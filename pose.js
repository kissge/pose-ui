$(function ()
  {
      'use strict';

      var fuzzy = 20;
      var getRot = function (x, y)
      {
	  x -= 200;
	  y -= 200;
	  return Math.asin(y / Math.sqrt(x * x + y * y));
      };
      var rotation = 0;

      $("canvas")
	  .css("left", ($(window).width() - 400) / 2 + "px")
	  .css("top", ($(window).height() - 400) / 2 + "px")
	  .attr("width", 400)
	  .attr("height", 400)
	  .drawLine({
	      draggable: true,
	      strokeStyle: '#000',
	      strokeWidth: 6,
	      strokeCap: 'round',
	      strokeJoin: 'round',
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
	      name: 'arrowRot',
	      draggable: true,
	      strokeStyle: '#666',
	      strokeWidth: 8,
	      rounded: true,
	      startArrow: true,
	      endArrow: true,
	      arrowRadius: 15,
	      arrowAngle: 90,
	      x1: 370, y1: 150,
	      cx1: 410, cy1: 200,
	      x2: 370, y2: 250,
	      mouseover: function (layer) { $(this).css('cursor', '-webkit-grab'); },
	      mouseout: function (layer) { $(this).css('cursor', ''); },
	      dragstart: function (layer)
	      {
		  $(this).css('cursor', '-webkit-grabbing');
		  this.offsetTheta = getRot(layer.eventX, layer.eventY);
	      },
	      drag: function (layer)
	      {
		  var rot = rotation;
		  layer.x = layer.y = 0;
		  rotation = getRot(layer.eventX, layer.eventY) - this.offsetTheta;
		  rotation = Math.floor(rotation / (Math.PI / 4)) * Math.PI / 4;
		  $('canvas')
		      .rotateCanvas({
			  rotate: (rotation - rot) * 180 / Math.PI,
			  x: 200, y: 200
		      });
	      },
	      dragstop: function (layer) { $(this).css('cursor', ''); },
	      dragcancel: function (layer) { $(this).css('cursor', ''); }
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
      var norm = function (x, y) { return Math.pow(x * x + y * y, 0.5); };
      var globalXY = function (x, y, rot) { x -= 200; y -= 200; return { x: 200 + x * Math.cos(rot) + y * Math.sin(rot), y: 200 - x * Math.sin(rot) + y * Math.cos(rot) }; };
      var localXY = function (x, y, rot) { return globalXY(x, y, -rot); };
      Limb.prototype = {
	  mouseover: function (canvas, part)
	  {
	      canvas.getLayer(this.name + _(part)).strokeStyle = '#f00';
	      canvas.moveLayer(this.name + _(part), 1);
	      canvas.css('cursor', '-webkit-grab');
	  },
	  mouseout: function (canvas, part)
	  {
	      canvas.getLayer(this.name + _(part)).strokeStyle = '#000';
	      canvas.css('cursor', '');
	  },
	  dragstart: function (canvas, part)
	  {
	      var layer, layer_shadow, offset;
	      canvas.css('cursor', '-webkit-grabbing');
	      for (var i = 0; i < 2; i++)
	      {
		  layer = canvas.getLayer(this.name + _(i));
		  layer_shadow = canvas.getLayer(this.name + _(i) + '-shadow');
		  layer.strokeStyle = 'rgba(0, 0, 0, 0.1)';
		  layer_shadow.shadowStroke = true;
		  layer_shadow.strokeStyle = '#f00';
		  layer_shadow.strokeWidth = 6;
	      }
	      layer = canvas.getLayer(this.name + _(part));
	      layer_shadow = canvas.getLayer(this.name + _(part) + '-shadow');
	      canvas.moveLayer(this.name + _(part) + '-shadow');
	      this.offsetX = layer_shadow.eventX - layer_shadow.x2;
	      this.offsetY = layer_shadow.eventY - layer_shadow.y2;
	  },
	  drag: function (canvas, part)
	  {
	      var layer = canvas.getLayer(this.name + _(part)), layer_shadow = canvas.getLayer(this.name + _(part) + '-shadow');
	      var len = norm(layer_shadow.eventX - this.offsetX - layer_shadow.x1, layer_shadow.eventY - this.offsetY - layer_shadow.y1);
	      layer_shadow.x = layer_shadow.y = 0;
	      layer_shadow.x2 = layer_shadow.x1 + (layer_shadow.eventX - this.offsetX - layer_shadow.x1) * this['len' + part] / len;
	      layer_shadow.y2 = layer_shadow.y1 + (layer_shadow.eventY - this.offsetY - layer_shadow.y1) * this['len' + part] / len;
	      if (part == 0)
	      {
		  var layer_lower = canvas.getLayer(this.name + _(1) + '-shadow');
		  layer_lower.x1 = layer_shadow.x2;
		  layer_lower.y1 = layer_shadow.y2;
		  len = norm(layer_lower.x2 - layer_lower.x1, layer_lower.y2 - layer_lower.y1);
		  layer_lower.x2 = layer_lower.x1 + (layer_lower.x2 - layer_lower.x1) * this.len1 / len;
		  layer_lower.y2 = layer_lower.y1 + (layer_lower.y2 - layer_lower.y1) * this.len1 / len;
	      }
	  },
	  dragstop: function (canvas, part)
	  {
	      var layer, layer_shadow;
	      canvas.css('cursor', '');
	      for (var i = 0; i < 2; i++)
	      {
		  layer = canvas.getLayer(this.name + _(i));
		  layer_shadow = canvas.getLayer(this.name + _(i) + '-shadow');
		  layer.strokeStyle = '#000';
		  layer_shadow.shadowStroke = false;
		  layer_shadow.strokeStyle = 'rgba(0, 0, 0, 0.0)';
		  layer_shadow.strokeWidth = fuzzy;
		  var params = ['x', 'y', 'x1', 'y1', 'x2', 'y2'];
		  for (var p in params)
		      layer[params[p]] = layer_shadow[params[p]];
	      }
	      layer = canvas.getLayer(this.name + _(part));
	      layer_shadow = canvas.getLayer(this.name + _(part) + '-shadow');
	      canvas.moveLayer(this.name + _(part), 1);
	      if (part == 0)
	      {
		  canvas.setLayer(this.name + _(1), { x1: layer.x2, y1: layer.y2 });
		  canvas.setLayer(this.name + _(1) + '-shadow', { x1: layer.x2, y1: layer.y2 });
	      }
	      canvas.moveLayer(this.name + _(part) + '-shadow', 2);
	      canvas.drawLayers();
	      this.offsetX = this.offsetY = 0;
	  },
	  init: function (canvas)
	  {
	      return canvas
		  .drawLine({
		      draggable: true,
		      strokeStyle: '#000',
		      strokeWidth: 6,
		      strokeCap: 'round',
		      x1: this.x0, y1: this.y0,
		      x2: this.x1, y2: this.y1,
		      name: this.name + '-upper'
		  })
		  .drawLine({
		      draggable: true,
		      strokeStyle: 'rgba(0, 0, 0, 0.0)',
		      strokeWidth: fuzzy,
		      strokeCap: 'round',
		      shadowColor: '#f00',
		      shadowBlur: 10,
		      x1: this.x0, y1: this.y0,
		      x2: this.x1, y2: this.y1,
		      name: this.name + '-upper-shadow',
		      bringToFront: true,
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
		      strokeCap: 'round',
		      x1: this.x1, y1: this.y1,
		      x2: this.x2, y2: this.y2,
		      name: this.name + '-lower'
		  })
		  .drawLine({
		      draggable: true,
		      strokeStyle: 'rgba(0, 0, 0, 0.0)',
		      strokeWidth: fuzzy,
		      strokeCap: 'round',
		      shadowColor: '#f00',
		      shadowBlur: 10,
		      x1: this.x1, y1: this.y1,
		      x2: this.x2, y2: this.y2,
		      name: this.name + '-lower-shadow',
		      bringToFront: true,
		      mouseover: Limb.prototype.mouseover.bind(this, canvas, 1),
		      mouseout: Limb.prototype.mouseout.bind(this, canvas, 1),
		      dragstart: Limb.prototype.dragstart.bind(this, canvas, 1),
		      drag: Limb.prototype.drag.bind(this, canvas, 1),
		      dragstop: Limb.prototype.dragstop.bind(this, canvas, 1),
		      dragcancel: Limb.prototype.dragstop.bind(this, canvas, 1)
		  });
	  },
	  layer: function (canvas, part) { return canvas.getLayer(this.name + _(part)); }
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
		  $(this).getLayer('arrowRot').visible = false;
		  for (var e in limbs)
		      limbs[e].layer($(this), 0).strokeStyle = limbs[e].layer($(this), 1).strokeStyle = '#000';
		  $(this).drawLayers();
		  $('<img>')
		      .attr('src', this.toDataURL('png', 100))
		      .css('width', '100px')
		      .appendTo($('body'));
		  $(this).getLayer('arrowRot').visible = true;
	      });
  });
