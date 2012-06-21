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
function setParticleList(particles) {
	particleVectors = new Array(particles.length);
	for(var i = 0; i < particles.length; i++) 
		particleVectors[i] = createVector(
			{x:particles[i][0], y:particles[i][1]}, 
			particles[i][2], 20);
}