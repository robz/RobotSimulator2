/*
This optimizer works by preprocessing the static obstacles. It divides the world into
a grid, and creates a list of edges (sides of obstacles) associated with each square in 
the grid. When determining distance, only the edges in the relevent squares are considered 
for intersection comparison.
*/

function makeGDO(obstacles, boardWidth, boardHeight, divider) {
	var squares = makeEdgeSquares(obstacles, boardWidth, boardHeight, divider);
	
	var gdo = {
		divider: divider,
		squareWidth: boardWidth/divider,
		squareHeight: boardHeight/divider,
		boardWidth: boardWidth,
		boardHeight: boardHeight,
		edgeSquares: squares,
		
		getDist: function(state, maxdist) {
			state.theta = cutAngle(state.theta);
			var stateLine = createLineFromVector(state.p, state.theta);
			var state_square = {state:state, square:this.getSquare(state.p)};
			var point = null;
			while(point == null && state_square != null) {
				state_square.square.on = true;
				point = checkSquare(state_square.square, stateLine, state.p, maxdist);
				var info = moveToNextBorder(state_square);
				state_square = this.toNextStateSquare( info, state_square);
			}
			return point;
		},
		
		getSquare: function(p) {
			var row = Math.floor(p.y/this.squareHeight),
				col = Math.floor(p.x/this.squareWidth);
			return squares[row][col];
		},
		
		// expects {p:{x,y},side}, {state,square}
		toNextStateSquare: function(info, state_square) {
			var difs = sideToDifs[info.side];
			var oldRow = state_square.square.row, oldCol = state_square.square.col;
			var newRow = oldRow+difs.rdif, newCol = oldCol+difs.cdif;
			if(newRow < 0 || newRow >= this.divider || newCol < 0 || newCol >= this.divider)
				return null;
			return {
				state:{p:info.p, theta:state_square.state.theta},
				square:squares[newRow][newCol]
			};
		}
	};
	
	return gdo;
}

function checkSquare(square, stateLine, statePoint, maxdist) {
	var intersectionPoints = [];
	for(var i = 0; i < square.edges.length; i++) {
		var p = getLineIntersection(square.edges[i], stateLine)
		if(p != false && p != null)
			intersectionPoints.push(p);
	}
	
	if (intersectionPoints.length == 0)
		return null;
	
	var mindist = maxdist;
	var closestPoint = null;
	for(var i = 0; i < intersectionPoints.length; i++) {
		var dist = euclidDist(statePoint, intersectionPoints[i]);
		if(dist < mindist) {
			mindist = dist;
			closestPoint = intersectionPoints[i];
		}
	}
	
	return closestPoint;
}

var sideToDifs = {
	0:{rdif:1, cdif:0},
	1:{rdif:0, cdif:1},
	2:{rdif:-1, cdif:0},
	3:{rdif:0, cdif:-1}
};

var gridThetaToResult = {
	0: 	function(bx,by,bw,bh,sx,sy) { return {side:1, p:{x:bx+bw, y:sy}}; },
	1: 	function(bx,by,bw,bh,sx,sy) { return {side:0, p:{x:sx, y:by+bh}}; },
	2:	function(bx,by,bw,bh,sx,sy) { return {side:3, p:{x:bx, y:sy}}; },
	3:	function(bx,by,bw,bh,sx,sy) { return {side:2, p:{x:sx, y:by}}; }
};

var nongridThetaToResult = {
	0:	function thetaFunct1(bx, by, bw, bh, sx, sy, theta) {
			var sw, sh, lh, lw, phi, result;
			sw = bx + bw - sx;
			sh = by + bh - sy;
			phi = theta;
			lh = sw*Math.tan(phi);
			lw = sh/Math.tan(phi);
			if (lw <= sw) {
				result = {side:0, p:{x:sx+lw, y:sy+sh}};
			} else if (lh <= sh) {
				result = {side:1, p:{x:sx+sw, y:sy+lh}};
			} 
			return result;
		},
	1:	function thetaFunct2(bx, by, bw, bh, sx, sy, theta) {
			var sw, sh, lh, lw, phi, result;
			sw = sx - bx;
			sh = by + bh - sy;
			phi = PI - theta;
			lh = sw*Math.tan(phi);
			lw = sh/Math.tan(phi);
			if (lw <= sw) {
				result = {side:0, p:{x:sx-lw, y:sy+sh}};
			} else if (lh <= sh) {
				result = {side:3, p:{x:sx-sw, y:sy+lh}};
			} 
			return result;
		},
	2:	function thetaFunct3(bx, by, bw, bh, sx, sy, theta) {
			var sw, sh, lh, lw, phi, result;
			sw = sx - bx;
			sh = sy - by;
			phi = theta - PI;
			lh = sw*Math.tan(phi);
			lw = sh/Math.tan(phi);
			if (lw <= sw) {
				result = {side:2, p:{x:sx-lw, y:sy-sh}};
			} else if (lh <= sh) {
				result = {side:3, p:{x:sx-sw, y:sy-lh}};
			} 
			return result;
		},
	3:	function(bx, by, bw, bh, sx, sy, theta) {
			var sw, sh, lh, lw, phi, result;
			sw = bx + bw - sx;
			sh = sy - by;
			phi = 2*PI - theta;
			lh = sw*Math.tan(phi);
			lw = sh/Math.tan(phi);
			if (lw <= sw) {
				result = {side:2, p:{x:sx+lw, y:sy-sh}};
			} else if (lh <= sh) {
				result = {side:1, p:{x:sx+sw, y:sy-lh}};
			} 
			return result;
		}
};

function moveToNextBorder(state_square) {
	var state = state_square.state, square = state_square.square;
	var bx = square.bx, by = square.by, bh = square.bh, bw = square.bw,
		sx = state.p.x, sy = state.p.y, theta = state.theta;

	if (theta/(PI/2) == Math.floor(theta/(PI/2))) {
		return gridThetaToResult[theta/(PI/2)](bx,by,bw,bh,sx,sy);
	} else {
		return nongridThetaToResult[Math.floor(theta/(PI/2))](bx,by,bw,bh,sx,sy,theta);
	}
}

function makeEdgeSquares(obstacles, boardWidth, boardHeight, divider) {
	var edgeSquares = new Array(divider),
		squareWidth = boardWidth/divider,
		squareHeight = boardHeight/divider;
	
	for(var r = 0; r < divider; r++) {
		edgeSquares[r] = new Array(divider);
		for(var c = 0; c < divider; c++) {
			var square = makeSquare(r, c, squareWidth, squareHeight);
			for(var i = 0; i < square.poly.lines.length; i++) {
				for(var j = 0; j < obstacles.length; j++) {
					for(var k = 0; k < obstacles[j].lines.length; k++) {
						if (linesIntersect(square.poly.lines[i], obstacles[j].lines[k])
							|| (pointInPoly(obstacles[j].lines[k].p1, square.poly)
								&& pointInPoly(obstacles[j].lines[k].p2, square.poly))) {
							square.edges.push(obstacles[j].lines[k]);
						}
					}
				}
			}
			edgeSquares[r][c] = square;
		}
	}
	
	return edgeSquares;
}

function makeSquare(row, col, width, height) {
	return {
		row:row, col:col, bx:col*width, by:row*height,
		bh:height, bw:width, poly:createBox(col*width,row*height,width,height),
		edges:[]
	};
}

function cutAngle(angle) {
	if(angle < 0)
		angle += Math.PI*2;
	angle = angle - Math.floor(angle/(Math.PI*2))*(Math.PI*2);
	return angle;
}