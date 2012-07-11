var wfpow1 = 0, wfpow2 = 0;

function wf_main() {
	wfpow1 = .5;
	wfpow2 = .5;
}

function wf_loop() {
	var leftDist = readDistSensors()[0];
	
	var normal = leftDist-80;
	if (normal < -10) {
		wfpow1 = .4;
		wfpow2 = -.4;
	} else if (normal > 10) {
		wfpow1 = .4;
		wfpow2 = .8;
	} else {
		wfpow1 = .8;
		wfpow2 = .8;
	}
	
	setMotorPowers(wfpow1, wfpow2);
}