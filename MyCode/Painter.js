function drawVector(g2, vector) {
	g2.beginPath();
	g2.lineWidth = 2;
	g2.strokeStyle = "black"; 
	g2.moveTo(vector.p.x, vector.p.y);
	g2.lineTo(vector.p.x + vector.m*Math.cos(vector.t), 
		vector.p.y + vector.m*Math.sin(vector.t) );
	g2.closePath();
	g2.stroke();
	
	g2.fillStyle = "black";
	g2.beginPath();
	g2.arc(vector.p.x, vector.p.y, 5, 0, 2*Math.PI, true);
	g2.closePath();
	g2.fill();
}

function drawVectors(g2, vectors) {
	for(var i = 0; i < vectors.length; i++) {
		drawVector(g2, vectors[i]);
	}
}

function drawPoly(g2, poly) {
	g2.beginPath();
	g2.moveTo(poly.points[0].x, poly.points[0].y);
	for(var i = 1; i < poly.points.length; i++) 
		g2.lineTo(poly.points[i].x, poly.points[i].y);
	g2.closePath();
	g2.fill();
}
		
function drawRobot(g2, state) {
	var vals = state.getPoints();
	var treds = state.getTreds();
	var robotPolys = state.createRobotPolys(vals[0][0],vals[0][1],vals[0][2]);
	
	g2.fillStyle = "gray"; 
	for(var j = 0; j < robotPolys.length; j++) {
		drawPoly(g2,robotPolys[j]); 
		g2.fillStyle = "darkblue";
	}
	
	// axis & direction lines
	var corners = robotPolys[0];
	g2.strokeStyle = "darkGray";
	g2.beginPath();
	g2.moveTo(corners.points[0].x,corners.points[0].y);
	g2.lineTo(corners.points[1].x,corners.points[1].y);
	g2.stroke();
	g2.beginPath();
	g2.moveTo(vals[0][0],vals[0][1]);
	g2.lineTo(vals[1][0],vals[1][1]);
	g2.stroke();
	
	// treds
	g2.lineWidth = 3;
	g2.strokeStyle = "darkblue";
	for(var i = 0; i < treds.length; i++) {
		g2.beginPath();
		g2.arc(treds[i][0],treds[i][1],WHEEL_WIDTH/2+treds[i][2]/6,0,2*Math.PI,true);
		g2.closePath();
		g2.fill();
	}
	
	// line sensor
	var sensors = state.getLineSensors(vals[0][0],vals[0][1],vals[0][2]);
	for(var i = 0; i < sensors.length; i++) {
		g2.fillStyle = (sensors[i].on) ? "darkgreen" : "darkgray";
		g2.beginPath();
		g2.arc(sensors[i].x,sensors[i].y,LINE_SENSOR_RADIUS,0,2*Math.PI,true);
		g2.closePath();
		g2.fill();
	}
}

function drawObstacles(g2, obstPolys) {
	g2.fillStyle = "green";
	for(var j = 0; j < obstPolys.length; j++) 
		drawPoly(g2,obstPolys[j]);
}

function drawDistSensor(g2, state) {
	var cpoint = state.getPoints()[1];
	g2.lineWidth = 1;
	g2.strokeStyle = "purple";
	
	g2.beginPath();
	for(var i = 0; i < 3; i++) {
		g2.moveTo(cpoint[0], cpoint[1]);
		g2.lineTo(state.distSensor[i].p.x, state.distSensor[i].p.y);
	}
	g2.closePath();
	g2.stroke();
}

function drawBlackTape(g2, blackLine) {
	if (blackLine.length == 0) return;
	g2.strokeStyle = "darkGray";
	//g2.fillStyle = "black";
	g2.lineWidth = BLACK_LINE_POINT_RADIUS*4;
	g2.beginPath();
	g2.moveTo(blackLine[0].x,blackLine[0].y);
	for(var i = 0; i < blackLine.length; i+=10) {
		//g2.arc(blackLine[i].x, blackLine[i].y, BLACK_LINE_POINT_RADIUS*4, 0, 2*Math.PI, true);
		g2.lineTo(blackLine[i].x,blackLine[i].y);
	}
	//g2.fill();	
	g2.stroke();
}

function drawStateInfo(g2, state) {
	g2.fillStyle = "darkBlue";
	g2.font = "bold 1em courier new"; 
	g2.textalign = "right"; 
	
	g2.fillText("Peripherals", 10, 15); 
	g2.fillText("left motor:  "+round4(vel1), 10, 40);
	g2.fillText("right motor: "+round4(vel2), 10, 60);
	g2.fillText("left encoder:  "+Math.round(state.totalw1), 10, 80);
	g2.fillText("right encoder: "+Math.round(state.totalw2), 10, 100);
	g2.fillText("line: "+state.lineSensorText(), 10, 120);
	g2.fillText("left IR:  "+Math.round(state.distSensor[0].dist), 10, 140);
	g2.fillText("front IR: "+Math.round(state.distSensor[1].dist), 10, 160);
	g2.fillText("right IR: "+Math.round(state.distSensor[2].dist), 10, 180);
	
	g2.fillText("Controls", CANVAS_WIDTH-180, 15); 
	g2.fillText("left motor:  e/d", CANVAS_WIDTH-180, 40);
	g2.fillText("right motor: r/f", CANVAS_WIDTH-180, 60);
	g2.fillText("line following: a", CANVAS_WIDTH-180, 80);
	g2.fillText("wall following: s", CANVAS_WIDTH-180, 100);
	g2.fillText("custom program: w", CANVAS_WIDTH-180, 120);
	g2.fillText("toggle viewer:  g", CANVAS_WIDTH-180, 140);
	g2.fillText("show tracking:  t", CANVAS_WIDTH-180, 160);
	g2.fillText("stop: space", CANVAS_WIDTH-180, 180);
}