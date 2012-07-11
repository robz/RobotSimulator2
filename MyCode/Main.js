var progCodeMirror, swCodeMirror, robotState, vel1, vel2, baseState;

var APP_WIDTH = 1000, APP_HEIGHT = 650, CANVAS_WIDTH = 540, CANVAS_HEIGHT = 640, ROBOT_DIM = 30, 
	PI = Math.PI, V_INC = .1, VEL_MAX = 1, REPAINT_PERIOD = 50, WHEEL_WIDTH = 6, NUM_TREDS = 5, 
	LINE_SENSOR_RADIUS = 2, BLACK_LINE_POINT_RADIUS = 1, DIST_SENSOR_MAX = 400;
	
var obstacles, blackTape, particleVectors, defaultCode, gdo;

var lineFollowerOn, wallFollowerOn, customOn, pf_state = 1, firstPerson,
	blockDividers = 16;

var defaultTabNum = 0;

var tabberOptions = {
	'onClick': function(argsObj) {
		localStorage.setItem("defaulttab", argsObj.index);
 	}
};

window.onload = function() {
	// check storage for local copy of code & default tab
	var progTextArea = document.getElementById("prog_textarea");
	if(window["localStorage"]) {
		var progText = localStorage.getItem("program");
		if(progText != null) {
			defaultCode = progTextArea.value;
			progTextArea.value = progText;
		}
		defaulttab = localStorage.getItem("defaulttab");
		if (defaulttab != null) {
			defaultTabNum = parseInt(defaulttab);
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
	
	// Resize if necessary to fit the browser size
	var bsize = getBrowserWindowSizeInit();
	var asize = getAppSize(APP_WIDTH, APP_HEIGHT, bsize.width, bsize.height-70);
	resizeApp(asize);
	
	// loading custom program
	document.getElementById("loadBtn").onclick = loadCustom;
	document.getElementById("revertBtn").onclick = revertToDefault;
	
	// canvas stuff
	var canvas = document.getElementById("canvas");
	canvas.onkeypress = keyPressed;
	
	// create globals for robot and obstacles (accessed all over the place)
	robotState = makeState(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, Math.random()*2*PI, ROBOT_DIM);
	baseState = {x:CANVAS_WIDTH/2, y:CANVAS_HEIGHT/2, theta:PI*3/2};
	createObstacles();
	
	// get optimizers
	gdo = makeGDO(obstacles, CANVAS_WIDTH, CANVAS_HEIGHT, blockDividers);
	
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
	initProg("particle filter", pf_main, pf_loop, function() { return true;}, 100);
	initProg("line follower", ls_main, ls_loop, function() { return lineFollowerOn;}, 100);
	initProg("wall follower", wf_main, wf_loop, function() { return wallFollowerOn;}, 100);
	initProg("custom program", cp_main, function() { cp_loop(); }, 	function() { return customOn; }, 100);

	canvas.onmousedown = touch;
}

var touchPoints = [];

function touch(event) {
	touchPoints.push({x:event.offsetX,y:event.offsetY})
	logPoints();
}

function logPoints() {
	var str = "obstacles.push(createPolygon([", prefix = "";
	for(var i = 0; i < touchPoints.length; i++) {
		str += prefix+"{x:"+touchPoints[i].x+",y:"+touchPoints[i].y+"}";
		prefix = ",";
	}
	str += "]));";
	console.log(str);
}

function resizeApp(asize) {
	var container = document.getElementById("container");
	container.style.width = asize.width+"px";
	container.style.height = asize.height+"px";
	
	var canvasCont = document.getElementById("canv_container");
	canvasCont.style.width = (asize.width/2+40)+"px";
	canvasCont.style.height = (asize.height-10)+"px";
	
	var textCont = document.getElementById("text_container");
	textCont.style.width = (asize.width/2-50)+"px";
	textCont.style.height = (asize.height-10)+"px";
	
	addClass("text_tab_height1", {"height":(asize.height-41)+"px"});
	var elements = document.getElementsByClassName('tablevel1');
	for (var i = 0; i < elements.length; i++) {
		if (i == defaultTabNum)
			elements[i].className += " tabbertabdefault";
		elements[i].className += ' tabbertab text_tab_height1';
	}
	
	addClass("text_tab_height2", {"height":(asize.height-41-50)+"px"});
	var elements = document.getElementsByClassName('tablevel2');
	for (var i = 0; i < elements.length; i++) {
		elements[i].className += ' tabbertab text_tab_height2';
	}
	
	addClass("prog_btn_width", {"width": ((asize.width/2-50)/2-8)});
	var elements = document.getElementsByClassName('prog_btn');
	for (var i = 0; i < elements.length; i++) {
		elements[i].className = 'prog_btn prog_btn_width';
	}
	
	swCodeMirror.getScrollerElement().style.height = asize.height-70;
	progCodeMirror.getScrollerElement().style.height = asize.height-100;
	
	var consoleTA = document.getElementById("console_textarea");
	consoleTA.style.width = (asize.width/2-62)+"px";
	consoleTA.style.height = (asize.height-40)+"px";
	
	var canvas = document.getElementById("canvas");
	canvas.style.width = (asize.width/2+40)+"px";
	canvas.style.height = (asize.height-10)+"px";
}

function addClass(name, attributes) {
	var style = document.createElement('style');
	style.type = 'text/css';
	var str = "."+name+" { ";
	for(var key in attributes) {
		str += key+" : "+attributes[key]+";";
	}
	str += "}";
	style.innerHTML = str;
	document.getElementsByTagName('head')[0].appendChild(style);
}

function getAppSize(w1, h1, w2, h2) {
	var r = h1/w1;
	var w3 = w2;
	var h3 = w3*r;
	if (h3 <= h2) {
		if (w3 > w1 && h3 > h1) 
			return {width:w3, height:h3};
		else
			return {width:w1, height:h1};
	} else {
		h3 = h2;
		w3 = h2/r;
		if (w3 <= w2) {
			if (w3 > w1 && h3 > h1) 
				return {width:w3, height:h3};
			else
				return {width:w1, height:h1};
		} else {
			return {width:w1, height:h1};
		}
	}
}

function initProg(prog_name, prog_main, prog_loop, prog_cond, period) {
	console.log("initializing "+prog_name+"!");
	prog_main();
	setInterval(
		function() { if(prog_cond()) prog_loop(); }, 
		period
	);
}

function repaint() {
	//var start = new Date().getTime();
	
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	var ctx = makeContextTramp(context, baseState, robotState, firstPerson);
	
	// clear the background
	ctx.fillStyle = "lightblue";
	ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

	if(blackTape)
		drawBlackTape(ctx, blackTape);
	drawObstacles(ctx, obstacles);	
	drawGDO(ctx, gdo);
	if (particleVectors.length > 1)
		drawVectors(ctx, particleVectors);
	drawRobot(ctx, robotState);
	if (particleVectors.length == 1)
		drawVectors(ctx, particleVectors);
	drawDistSensor(ctx, robotState);
	drawStateInfo(ctx, robotState);
	
	
	//var end = new Date().getTime();
	//console.log(end-start);
}

function updateState() {
	//var start = new Date().getTime();
	
	if (vel1 != 0 || vel2 != 0) {
		robotState.updatePos(vel1*3, vel2*3, obstacles);
		if(blackTape)
			robotState.updateLineSensor(blackTape);
	}
	
	robotState.mid_sensor_angle += Math.PI/20;
	robotState.updateDistSensor(obstacles);
	
	//var end = new Date().getTime();
	//console.log(end-start);
}

function keyPressed(event) {
	event.preventDefault(); // freaking dumb firefox quickfind bull.
	var key = event.which;
	
	var nvel1 = vel1, nvel2 = vel2;
	
	if (key == 'e'.charCodeAt()) {
		firstPerson = !firstPerson;
	} else if (key == ' '.charCodeAt()) {
		console.log("STOP!!!");
		nvel1 = nvel2 = 0;
		lineFollowerOn = wallFollowerOn = customOn = false;
	} else if(key == 'z'.charCodeAt() && !wallFollowerOn && !customOn) {
		lineFollowerOn = !lineFollowerOn;
		if (!lineFollowerOn) nvel1 = nvel2 = 0;
	} else if(key == 'x'.charCodeAt() && !lineFollowerOn && !customOn) {
		wallFollowerOn = !wallFollowerOn;
		if (!wallFollowerOn) nvel1 = nvel2 = 0;
	} else if(key == 'c'.charCodeAt() && !lineFollowerOn && !wallFollowerOn) {
		customOn = !customOn;
		if (!customOn) nvel1 = nvel2 = 0;
		else cp_main();
	} else if(key == 'q'.charCodeAt()) {
		pf_state = pf_state+1;
		if (pf_state == 3) pf_state = 0;
	} else if(lineFollowerOn || wallFollowerOn || customOn) {
		// grabbing the input so the normal control don't mess
		//	with the programs.
	} else if(key == 'w'.charCodeAt()) {
		nvel1 = vel1+V_INC;
		nvel2 = vel2+V_INC;
		if (nvel1 > VEL_MAX)
			nvel1 = VEL_MAX;
		if (nvel2 > VEL_MAX)
			nvel2 = VEL_MAX;
	} else if (key == 'a'.charCodeAt()) {
		nvel1 = vel1+V_INC;
		nvel2 = vel2-V_INC;
		if (nvel1 > VEL_MAX)
			nvel1 = VEL_MAX;
		if (nvel2 < -VEL_MAX)
			nvel2 = -VEL_MAX;
	} else if (key == 's'.charCodeAt()) {
		nvel1 = vel1-V_INC;
		nvel2 = vel2-V_INC;
		if (nvel1 < -VEL_MAX)
			nvel1 = -VEL_MAX;
		if (nvel2 < -VEL_MAX)
			nvel2 = -VEL_MAX;
	} else if (key == 'd'.charCodeAt()) {
		nvel1 = vel1-V_INC;
		nvel2 = vel2+V_INC;
		if (nvel1 < -VEL_MAX)
			nvel1 = -VEL_MAX;
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
	
	obstacles.push(createPolygon([{x:5,y:188},{x:31,y:196},{x:37,y:292},{x:39,y:378},{x:26,y:410},
		{x:5,y:415}])); 
	obstacles.push(createPolygon([{x:158,y:5},{x:164,y:41},{x:187,y:57},{x:237,y:62},{x:325,y:56},
		{x:355,y:27},{x:355,y:5}]));
	obstacles.push(createPolygon([{x:535,y:144},{x:498,y:174},{x:490,y:321},{x:511,y:452},
		{x:535,y:467}]));
	obstacles.push(createPolygon([{x:5,y:551},{x:43,y:550},{x:82,y:584},{x:81,y:637},{x:5,y:637}]));
	obstacles.push(createPolygon([{x:538,y:549},{x:492,y:540},{x:444,y:562},{x:401,y:592},
		{x:375,y:637},{x:537,y:637}]));
	
	obstacles.push(createPolygon([{x:206,y:248},{x:296,y:244},{x:388,y:225},{x:362,y:153},
		{x:266,y:147},{x:161,y:158},{x:136,y:206},{x:153,y:232}]));
	obstacles.push(createPolygon([{x:180,y:340},{x:119,y:331},{x:114,y:365},{x:122,y:444},
		{x:164,y:504},{x:203,y:504},{x:233,y:486},{x:228,y:414}]));
	obstacles.push(createPolygon([{x:383,y:351},{x:339,y:358},{x:287,y:377},{x:288,y:459},
		{x:314,y:510},{x:352,y:503},{x:390,y:454}]));
}

































