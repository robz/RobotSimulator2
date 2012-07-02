// returns booleans [s1,s2,s3,s4,s5,s6,s7,s8]
function readLineSensor() {
	return robotState.sensorVals;
}

// returns [left, center, right]
function readDistSensors() {
	return [robotState.distSensor[0].dist, 
		robotState.distSensor[1].dist, 
		robotState.distSensor[2].dist];
}

// returns [left enc, right enc]
function readEncoders() {
	return [robotState.totalw2, robotState.totalw1];
}

// expects powi to be range [-1,1]
// expecting pow1=left, pow2=right
function setMotorPowers(pow1, pow2) {
	if (pow1 < -1 || pow1 > 1 || pow2 < -1 || pow2 > 1) return false;
	vel2 = pow1;
	vel1 = pow2;
}

// returns # of milliseconds since 1974ish
function getTime() {
	return new Date().getTime();
}

// prints to "console"
function log(str) {
	document.getElementById("console_textarea").value += str;
}

// expends an array of 'particles', so for example:
//	[[x1,y1,theta1],[x2,y2,theta2],...,[xn,yn,thetan]]
// once set, they will be draw as dots & lines in 
//	black on the canvas.
function setParticleList(particles) {
	particleVectors = new Array(particles.length);
	for(var i = 0; i < particles.length; i++) 
		particleVectors[i] = createVector(
			{x:particles[i][0], y:particles[i][1]}, 
			particles[i][2], 20);
}

// returns a list of obstacles on the field:
//	[{ points:[{x:~,y:~},...], lines:[{m:~,b:~,v:~,p1:~,p2:~},...] }, ...]
// where the points and lines are ordered clockwise around a given obstacle
function getObstacleList() {
	return obstacles;
}

// returns distance till object from a point and angle
//	or 'null' if there is no intersection
//	expects state to be [x,y,theta]
//	expects objects as in getObstacleList
function getDistanceToObstacle(state, obstacles) {
	var statePoint = {x:state[0],y:state[1]};
	var stateLine = createLineFromVector(statePoint, state[2]);
	
	var intersectList = [];
	for(var i = 0; i < obstacles.length; i++) {
		var lines = obstacles[i].lines;
		for(var j = 0; j < lines.length; j++) {
			var intersectPoint = getLineIntersection(lines[j], stateLine);
			if(intersectPoint != false)
				intersectList.push(intersectPoint);
		}
	}
	
	var minDist = DIST_SENSOR_MAX;
	var closestPoint = null;
	for(var i = 0; i < intersectList.length; i++) {
		var d = euclidDist(statePoint, intersectList[i]);
		if (d < minDist) {
			minDist = d;
			closestPoint = intersectList[i];
		}
	}
	
	if (closestPoint != null) {
		return minDist;
	} else {
		return null;
	}
}

// expends an array of 'particles', so for example:
//	[{p:{x:~,y:~},theta:~},...]
// once set, they will be draw as dots & lines in 
//	black on the canvas.
function paintParticleList2(particles) {
	particleVectors = new Array(particles.length);
	for(var i = 0; i < particles.length; i++) 
		particleVectors[i] = createVector(
			particles[i].p, particles[i].theta, 20);
}








































