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

// TODO: prints to "console"
function log(str) {
	document.getElementById("console_textarea").value += str;
}