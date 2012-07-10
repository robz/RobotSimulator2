/*
	EdgeBlock: {edges:[line,..], row, col, tlcPoint:{x,y}, width, height, poly}
		tlc = top left corner
		poly = polygon representing box that square occupies
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
			var state_square = {state:state, square:this.getSquare(state.p)};
			var point = state_square.state.p;
			while(state_square != null) {
				state_square.square.on = true;
				// add in checks for edges
				point = state_square.state.p;
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

function checkBlock(square, stateLine) {
	for(var i = 0; i < square.edges.length; i++) {
		var p = linesIntersect(square.edges[i], stateLine)
		if(p != null)
			return p;
	}
}

var sideToDifs = {
	0:{rdif:1, cdif:0},
	1:{rdif:0, cdif:1},
	2:{rdif:-1, cdif:0},
	3:{rdif:0, cdif:-1}
};

function moveToNextBorder(state_square) {
	var state = state_square.state, square = state_square.square;
	var bx = square.bx, by = square.by, bh = square.bh, bw = square.bw,
		sx = state.p.x, sy = state.p.y, theta = state.theta;
	var result;

	if (theta/(PI/2) == Math.floor(theta/(PI/2))) {
		if(theta == 0) {
			result = {side:1, p:{x:bx+bw, y:sy}};
		} else if (theta == PI/2) {
			result = {side:0, p:{x:sx, y:by+bh}};
		} else if (theta == PI) {
			result = {side:3, p:{x:bx, y:sy}};
		} else if (theta == 3*PI/2) {
			result = {side:2, p:{x:sx, y:by}};
		} else {
			console.log(theta);
		}
	} else {
		var sw, sh, lh, lw, p1side, p2side, phi, 
			xsign, ysign;
	
		if (theta > 0 && theta < PI/2) {
			sw = bx + bw - sx;
			sh = by + bh - sy;
			phi = theta;
			p1side = 0;
			p2side = 1;
			xsign = 1;
			ysign = 1;
		} else if (theta > PI/2 && theta < PI) {
			sw = sx - bx;
			sh = by + bh - sy;
			phi = PI - theta;
			p1side = 0;
			p2side = 3;
			xsign = -1;
			ysign = 1;
		} else if (theta > PI && theta < 3*PI/2) {
			sw = sx - bx;
			sh = sy - by;
			phi = theta - PI;
			p1side = 2;
			p2side = 3;
			xsign = -1;
			ysign = -1;
		} else if (theta > 3*PI/2 && theta < 2*PI) {
			sw = bx + bw - sx;
			sh = sy - by;
			phi = 2*PI - theta;
			p1side = 2;
			p2side = 1;
			lh = sw*Math.tan(phi);
			lw = sh/Math.tan(phi);
			xsign = 1;
			ysign = -1;
		}
		
		lh = sw*Math.tan(phi);
		lw = sh/Math.tan(phi);
		
		if (lw <= sw) {
			result = {side:p1side, p:{x:sx+xsign*lw, y:sy+ysign*sh}};
		} else if (lh <= sh) {
			result = {side:p2side, p:{x:sx+xsign*sw, y:sy+ysign*lh}};
		} 
	}
	
	return result;
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