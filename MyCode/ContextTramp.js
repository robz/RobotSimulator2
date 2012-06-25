function my_atan(y, x) {
	if (x == 0) {
		if (y > 0) return PI/2;
		else if (y < 0) return -PI/2;
		else if (y == 0) return 0;
	}
	if (x < 0) 
		return Math.atan(y/x)+Math.PI;
	return Math.atan(y/x);
}

function toFirstPerson(dot, start, current) {
	var x2 = dot.x - (current.x - start.x),
		y2 = dot.y - (current.y - start.y);
	var phi = my_atan(y2-start.y, x2-start.x),
		r = Math.sqrt((x2-start.x)*(x2-start.x)+(y2-start.y)*(y2-start.y));
	var gamma = phi - (current.theta - start.theta);
	return {x: start.x + r*Math.cos(gamma), y: start.y + r*Math.sin(gamma)};
}

function makeContextTramp(ctx, ba, cu, i) {
	var contextTramp = {
		init : function (context, base, current, isFirstPerson) {
			this.context = context;
			this.base = base;
			this.current = current;
			this.isFirstPerson = isFirstPerson;
			this.fillStyle = "black";
			this.strokeStyle = "black";
			this.lineWidth = "1";
			this.textalign = "right";
			this.font = "courier";
		},
		beginPath : function() {
			this.context.strokeStyle = this.strokeStyle;
			this.context.fillStyle = this.fillStyle;
			this.context.lineWidth = this.lineWidth;
			this.context.beginPath();
		},
		moveTo : function(x, y) {
			this.context.strokeStyle = this.strokeStyle;
			this.context.fillStyle = this.fillStyle;
			this.context.lineWidth = this.lineWidth;
			if (this.isFirstPerson) {
				var dot = toFirstPerson({x:x, y:y}, this.base, this.current);
				x = dot.x;
				y = dot.y;
			} 
			this.context.moveTo(x, y);
		},
		lineTo : function(x, y) {
			this.context.strokeStyle = this.strokeStyle;
			this.context.fillStyle = this.fillStyle;
			this.context.lineWidth = this.lineWidth;
			if (this.isFirstPerson) {
				var dot = toFirstPerson({x:x, y:y}, this.base, this.current);
				x = dot.x;
				y = dot.y;
			} 
			this.context.lineTo(x, y);
		},
		arc : function(x,y,a,b,c,d) {
			this.context.strokeStyle = this.strokeStyle;
			this.context.fillStyle = this.fillStyle;
			this.context.lineWidth = this.lineWidth;
			if (this.isFirstPerson) {
				var dot = toFirstPerson({x:x, y:y}, this.base, this.current);
				x = dot.x;
				y = dot.y;
			} 
			this.context.arc(x,y,a,b,c,d);
		},
		stroke : function() {
			this.context.strokeStyle = this.strokeStyle;
			this.context.fillStyle = this.fillStyle;
			this.context.lineWidth = this.lineWidth;
			this.context.stroke();
		},
		fill : function() {
			this.context.strokeStyle = this.strokeStyle;
			this.context.fillStyle = this.fillStyle;
			this.context.lineWidth = this.lineWidth;
			this.context.fill();
		},
		closePath : function() {
			this.context.strokeStyle = this.strokeStyle;
			this.context.fillStyle = this.fillStyle;
			this.context.lineWidth = this.lineWidth;
			this.context.closePath();
		},
		fillRect : function(a,b,c,d) {
			this.context.strokeStyle = this.strokeStyle;
			this.context.fillStyle = this.fillStyle;
			this.context.lineWidth = this.lineWidth;
			this.context.fillRect(a,b,c,d);
		},
		fillText : function(a,b,c) {
			this.context.strokeStyle = this.strokeStyle;
			this.context.fillStyle = this.fillStyle;
			this.context.lineWidth = this.lineWidth;
			this.context.font = this.font; 
			this.context.textalign = this.textalign; 
			this.context.fillText(a,b,c);
		}
	};
	contextTramp.init(ctx, ba, cu, i);
	return contextTramp;
}













































