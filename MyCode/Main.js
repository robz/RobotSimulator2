var myCodeMirror, robotState, vel1, vel2;

var CANVAS_WIDTH = 540, CANVAS_HEIGHT = 640, ROBOT_DIM = 50, PI = Math.PI, V_INC = .1, 
	VEL_MAX = 1, REPAINT_PERIOD = 50, WHEEL_WIDTH = 10, NUM_TREDS = 5, LINE_SENSOR_RADIUS = 4,
	BLACK_LINE_POINT_RADIUS = 1, DIST_SENSOR_MAX = 400;
	
var obstacles, blackTape;

window.onload = function main() {
	// set up syntax highlighting
	var myTextArea = document.getElementById("textarea");
	myCodeMirror = CodeMirror.fromTextArea(myTextArea);
	
	// loading custom program
	document.getElementById("loadBtn").onclick = loadCustom;
	
	// canvas stuff
	var canvas = document.getElementById("canvas");
	canvas.onkeypress = keyPressed;
	
	robotState = makeState(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, Math.random()*2*PI, ROBOT_DIM);
	createObstacles();
	robotState.updateDistSensor(obstacles);
	robotState.updateLineSensor(blackTape);
	
	vel1 = vel2 = 0;
	setInterval("updateState();", 60);
	setInterval("repaint();", 60);
}

function repaint() {
	var start = new Date().getTime();
	
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	
	// clear the background
	ctx.fillStyle = "lightblue";
	ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
	
	drawBlackTape(ctx, blackTape);
	drawRobot(ctx, robotState);
	drawObstacles(ctx, obstacles);	
	drawDistSensor(ctx, robotState);
	drawStateInfo(ctx, robotState);
	
	var end = new Date().getTime();
	console.log(end-start);
}

function updateState() {
	var start = new Date().getTime();
	
	if (vel1 != 0 || vel2 != 0) {
		robotState.updatePos(vel1*3, vel2*3, obstacles);
		robotState.updateDistSensor(obstacles);
		robotState.updateLineSensor(blackTape);
	}
	
	var end = new Date().getTime();
	//console.log(end-start);
}

function keyPressed() {
	var key = event.which;
	
	var nvel1 = vel1, nvel2 = vel2;
	if(key == 'f'.charCodeAt()) {
		nvel1 = vel1-V_INC;
		if (nvel1 < -VEL_MAX)
			nvel1 = -VEL_MAX;
	} else if (key == 'r'.charCodeAt()) {
		nvel1 = vel1+V_INC;
		if (nvel1 > VEL_MAX)
			nvel1 = VEL_MAX;
	} else if (key == 'd'.charCodeAt()) {
		nvel2 = vel2-V_INC;
		if (nvel2 < -VEL_MAX)
			nvel2 = -VEL_MAX;
	} else if (key == 'e'.charCodeAt()) {
		nvel2 = vel2+V_INC;
		if (nvel2 > VEL_MAX)
			nvel2 = VEL_MAX;
	}
	
	vel1 = nvel1;
	vel2 = nvel2;
}

function loadCustom() {
	var code = myCodeMirror.getValue();
	var codeNode = document.createTextNode(code);
	
	var extraScript = document.createElement("script");
	extraScript.appendChild(codeNode);
	
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(extraScript);
}

function createObstacles() {
	obstacles = [];
	obstacles.push(createBox(0,0,5,CANVAS_HEIGHT));
	obstacles.push(createBox(CANVAS_WIDTH-5,0,5,CANVAS_HEIGHT));
	obstacles.push(createBox(0,0,CANVAS_WIDTH,5));
	obstacles.push(createBox(0,CANVAS_HEIGHT-5,CANVAS_WIDTH,5));
}