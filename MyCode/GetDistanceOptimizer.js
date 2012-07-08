/*
	EdgeBlock: {edges:[line,..], row, col, tlcPoint:{x,y}, width, height, poly}
		tlc = top left corner
		poly = polygon representing box that block occupies
*/

function makeGDO(obstacles, boardWidth, boardHeight, divider) {
	var edgeBlocks = makeEdgeBlocks(obstacles, boardWidth, boardHeight, divider);
	
	var gdo = {
		divider: divider,
		blockWidth: boardWidth/divider,
		blockHeight: boardHeight/divider,
		edgeBlocks: edgeBlocks
	};
	
	return gdo;
}

function makeEdgeBlocks(obstacles, boardWidth, boardHeight, divider) {
	var edgeBlocks = new Array(divider),
		blockWidth = boardWidth/divider,
		blockHeight = boardHeight/divider;
	
	for(var r = 0; r < divider; r++) {
		edgeBlocks[r] = new Array(divider);
		for(var c = 0; c < divider; c++) {
			var block = makeBlock(r, c, blockWidth, blockHeight);
			for(var i = 0; i < block.poly.lines.length; i++) {
				for(var j = 0; j < obstacles.length; j++) {
					for(var k = 0; k < obstacles[j].lines.length; k++) {
						if (linesIntersect(block.poly.lines[i], obstacles[j].lines[k])
							|| (pointInPoly(block.poly.lines[i].p1, block.poly)
								&& pointInPoly(block.poly.lines[i].p2, block.poly))) {
							block.edges.push(obstacles[j].lines[k]);
						}
					}
				}
			}
			edgeBlocks[r][c] = block;
		}
	}
	
	return edgeBlocks;
}

function makeBlock(row, col, width, height) {
	return {
		row:row, col:col, width:width, height:height,
		tlcPoint:{x:col*width,y:row*height},
		poly:createBox(col*width,row*height,width,height),
		edges:[]
	};
}