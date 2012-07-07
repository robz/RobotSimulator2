/* Definitions:
Line = {
	m:~,
	b:~,
	v:~,
	p1:~,
	p2:~
}

Point = {
	x:~,
	y:~
}

Polygon = {
	points: [array of points in clockwise order],
	lines: [array of lines in clockwise order]
	com: point representing center of mass
}

Circle = {
	p: Point,
	r: ~
}

Vector = {
	p: Point,
	t: theta,
	m: magnitude
}
*/

function createVector(point, theta, mag) {
	return {p:point, t:theta, m:mag};
}

function createLineFromVector(point, theta) {
	var dis = 999999;
	var farPoint = {x:(point.x+dis*Math.cos(theta)), 
		y:(point.y+dis*Math.sin(theta))};
	return createLine(point, farPoint);
}

function createCircle(point, radius) {
	return {
		p:point,
		r:radius
	};
}

function createBox(xs,ys,ws,ls) {
	return createPolygon([
		{x:xs,y:ys},
		{x:xs+ws,y:ys},
		{x:xs+ws,y:ys+ls},
		{x:xs,y:ys+ls}
	]);
}

function createPolygon(ps) {
	var ls = new Array(ps.length);
	var sumx = 0, sumy = 0, total = ps.length;
	
	for(var i = 0; i < total-1; i++) {
		sumx += ps[i].x;
		sumy += ps[i].y;
		ls[i] = createLine(ps[i], ps[i+1]);
	}
	ls[total-1] = createLine(ps[total-1], ps[0]);
	sumx += ps[total-1].x;
	sumy += ps[total-1].y;
	
	return {
		lines:ls,
		points:ps,
		com:{x:sumx/total,y:sumy/total}
	};
}

// expecting pi to be {x:~, y:~}
// returns line formated {m:~, b:~, v:~, p1:~, p2:~
//	(b will be x-intercept if v is true)
//	(will NOT copy pi)
function createLine(point1, point2) {
	var isVerticle = round4(point1.x) == round4(point2.x);
	var slope, intercept;
	
	if (!isVerticle) {
		slope = (point2.y - point1.y)/(point2.x - point1.x);
		intercept = point1.y - slope*point1.x;
	} else {
		slope = undefined;
		intercept = point1.x;
	}
	
	return {
		m:slope,
		b:intercept,
		v:isVerticle,
		p1:point1,
		p2:point2
	};
}

function circlesIntersect(c1, c2) {
	var dist = euclidDist(c1.p, c2.p);
	return dist <= c1.r+c2.r;
}

function polysIntersect(polygon1, polygon2) {
	for(var i = 0; i < polygon1.lines.length; i++) {
		for(var j = 0; j < polygon2.lines.length; j++) {
			if(linesIntersect(polygon1.lines[i], polygon2.lines[j]))
				return true;
		}
	}
	return false;
}

// identical to linesIntersect except 
//	returns point of intersection if there is one
//	false otherwise
function getLineIntersection(line1, line2) {
	if (line1.m == line2.m) {
		if (line1.b == line2.b) {
			return onSegment(line1, line2.p1) || onSegment(line1, line2.p2)
				|| onSegment(line2, line1.p1) || onSegment(line2, line1.p2);
		}
		return false;
	} 
	
	var xsect, ysect;
	
	if (line1.v) {
		xsect = line1.b;
		ysect = line2.m*xsect + line2.b;
	} else if (line2.v) {
		xsect = line2.b;
		ysect = line1.m*xsect + line1.b;
	} else {
		xsect = (line2.b - line1.b)/(line1.m - line2.m);
		ysect = line1.m*xsect + line1.b;
	}
	
	var sect = {x:xsect, y:ysect};
	
	if (!(onSegment(line1, sect) && onSegment(line2, sect)))
		return false;
		
	return sect;
}

// expecting linei to be a Line
// returns false if lines are parallel & not equal
//	true if the point of intersection lies on both segments
function linesIntersect(line1, line2) {
	if (line1.m == line2.m) {
		if (line1.b == line2.b) {
			return onSegment(line1, line2.p1) || onSegment(line1, line2.p2)
				|| onSegment(line2, line1.p1) || onSegment(line2, line1.p2);
		}
		return false;
	} 
	
	var xsect, ysect;
	
	if (line1.v) {
		xsect = line1.b;
		ysect = line2.m*xsect + line2.b;
	} else if (line2.v) {
		xsect = line2.b;
		ysect = line1.m*xsect + line1.b;
	} else {
		xsect = (line2.b - line1.b)/(line1.m - line2.m);
		ysect = line1.m*xsect + line1.b;
	}
	
	var sect = {x:xsect, y:ysect};
	return onSegment(line1, sect) && onSegment(line2, sect);
}

// assumes Point point is on Line line
// returns whether it is between p1 & p2
function onSegment(line, point) {
	if (line.v) {
		if (line.p1.y > line.p2.y) {
			return point.y <= line.p1.y && point.y >= line.p2.y;
		} else {
			return point.y <= line.p2.y && point.y >= line.p1.y;
		}
	}
	if (line.p1.x > line.p2.x) {
		return point.x <= line.p1.x && point.x >= line.p2.x;
	} else {
		return point.x <= line.p2.x && point.x >= line.p1.x;
	}
}

function pointInPoly(point, poly) {
	for(var i = 0; i < poly.lines.length; i++) {
		var comRel = pointLineRel(poly.com, poly.lines[i]),
			pointRel = pointLineRel(point, poly.lines[i]);
		if (pointRel != comRel && pointRel != 0) {
			return false;
		}
	}
	return true;
}

// return 1 if point is northwest of line,
//	0 if point is on line,
//	-1 if point is southeast of line
function pointLineRel(point, line) {
	if (line.v) {
		return sign(line.p1.x - point.x);
	}
	return sign(point.y - (line.m*point.x+line.b));
}

function sign(val) {
	if (val > 0) return 1;
	else if (val < 0) return -1;
	return 0;
}

function euclidDist(p1, p2) {
	var xd = p1.x-p2.x, yd = p1.y-p2.y;
	return Math.sqrt(xd*xd + yd*yd);
}




































