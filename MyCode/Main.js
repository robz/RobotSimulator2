var progCodeMirror, swCodeMirror, robotState, vel1, vel2;

var CANVAS_WIDTH = 540, CANVAS_HEIGHT = 640, ROBOT_DIM = 30, PI = Math.PI, V_INC = .1, 
	VEL_MAX = 1, REPAINT_PERIOD = 50, WHEEL_WIDTH = 6, NUM_TREDS = 5, LINE_SENSOR_RADIUS = 2,
	BLACK_LINE_POINT_RADIUS = 1, DIST_SENSOR_MAX = 400;
	
var obstacles, blackTape, particleVectors, defaultCode;

var lineFollowerOn, wallFollowerOn, customOn;

window.onload = function main() {
	// check storage for local copy of code
	var progTextArea = document.getElementById("prog_textarea");
	if(window["localStorage"]) {
		var progText = localStorage.getItem("program");
		if(progText != null) {
			defaultCode = progTextArea.value;
			progTextArea.value = progText;
		}
	}
	
	// set up syntax highlighting for custom prog
	progCodeMirror = CodeMirror.fromTextArea(progTextArea);
	
	// load the custom 
	// (only necessary if it has changed, but need code mirror, so whatevz)
	loadCustom();
	
	// set up syntax highlighting for simuware api
	var swTextArea = document.getElementById("simuware_textarea");
	swCodeMirror = CodeMirror.fromTextArea(swTextArea, {readOnly:true});
	
	// loading custom program
	document.getElementById("loadBtn").onclick = loadCustom;
	document.getElementById("revertBtn").onclick = revertToDefault;
	
	// canvas stuff
	var canvas = document.getElementById("canvas");
	canvas.onkeypress = keyPressed;
	
	// create globals for robot and obstacles (accessed all over the place)
	robotState = makeState(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, Math.random()*2*PI, ROBOT_DIM);
	createObstacles();
	
	// kick off sensors
	robotState.updateDistSensor(obstacles);
	if(blackTape)
		robotState.updateLineSensor(blackTape);
		
	// initialize particleVectors
	particleVectors = [];
	
	// start state-updater and repainter
	vel1 = vel2 = 0;
	setInterval("updateState();", 60);
	setInterval("repaint();", 60);
	
	// initialize sub programs
	initProg("line follower", ls_main, ls_loop, function() { return lineFollowerOn;});
	initProg("wall follower", wf_main, wf_loop, function() { return wallFollowerOn;});
	initProg("custom program", cp_main, function() { cp_loop(); }, 
		function() { return customOn; });
}

function initProg(prog_name, prog_main, prog_loop, prog_cond) {
	console.log("initializing "+prog_name+"!");
	prog_main();
	setInterval(
		function() { if(prog_cond()) prog_loop(); }, 
		100
	);
}

function repaint() {
	//var start = new Date().getTime();
	
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	
	// clear the background
	ctx.fillStyle = "lightblue";
	ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
	
	if(blackTape)
		drawBlackTape(ctx, blackTape);
	drawRobot(ctx, robotState);
	drawObstacles(ctx, obstacles);	
	drawDistSensor(ctx, robotState);
	drawStateInfo(ctx, robotState);
	drawVectors(ctx, particleVectors);
	
	//var end = new Date().getTime();
	//console.log(end-start);
}

function updateState() {
	//var start = new Date().getTime();
	
	if (vel1 != 0 || vel2 != 0) {
		robotState.updatePos(vel1*3, vel2*3, obstacles);
		robotState.updateDistSensor(obstacles);
		if(blackTape)
			robotState.updateLineSensor(blackTape);
	}
	
	//var end = new Date().getTime();
	//console.log(end-start);
}

function keyPressed(event) {
	event.preventDefault(); // freaking dumb firefox quickfind bull.
	var key = event.which;
	
	var nvel1 = vel1, nvel2 = vel2;
	
	if (key == ' '.charCodeAt()) {
		console.log("STOP!!!");
		nvel1 = nvel2 = 0;
		lineFollowerOn = wallFollowerOn = false;
	} else if(key == 'a'.charCodeAt() && !wallFollowerOn && !customOn) {
		lineFollowerOn = !lineFollowerOn;
		if (!lineFollowerOn) nvel1 = nvel2 = 0;
	} else if(key == 's'.charCodeAt() && !lineFollowerOn && !customOn) {
		wallFollowerOn = !wallFollowerOn;
		if (!wallFollowerOn) nvel1 = nvel2 = 0;
	} else if(key == 'w'.charCodeAt() && !lineFollowerOn && !wallFollowerOn) {
		customOn = !customOn;
		if (!customOn) nvel1 = nvel2 = 0;
		else cp_main();
	} else if(lineFollowerOn || wallFollowerOn || customOn) {
		// grabbing the input so the normal control don't mess
		//	with the programs.
	} else if(key == 'f'.charCodeAt()) {
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

function revertToDefault() {
	progCodeMirror.setValue(defaultCode);
}

function loadCustom() {
	var code = progCodeMirror.getValue();
	var codeNode = document.createTextNode(code);
	
	var extraScript = document.createElement("script");
	extraScript.appendChild(codeNode);
	
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(extraScript);

	if(window["localStorage"]) {
		localStorage.setItem("program", code);
	}
}

function createObstacles() {
	obstacles = [];
	obstacles.push(createBox(0,0,5,CANVAS_HEIGHT));
	obstacles.push(createBox(CANVAS_WIDTH-5,0,5,CANVAS_HEIGHT));
	obstacles.push(createBox(0,0,CANVAS_WIDTH,5));
	obstacles.push(createBox(0,CANVAS_HEIGHT-5,CANVAS_WIDTH,5));
	obstacles.push(createBox(0,CANVAS_HEIGHT-70,70,70));
	obstacles.push(createBox(CANVAS_WIDTH-90,CANVAS_HEIGHT-90,90,90));
	obstacles.push(createBox(200,0,110,60));
	obstacles.push(createBox(160,180,110,60));
	obstacles.push(createBox(300,400,70,100));
	obstacles.push(createBox(CANVAS_WIDTH-40,150,40,300));
	obstacles.push(createBox(0,200,30,200));
}


































