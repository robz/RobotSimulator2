/* 
This is a basic particle filter for localization.
*/

var NUM_PARTICLES = 400;
var particleList, obstacleList;

function pf_main() {
	obstacleList = getObstacleList();
	particleList = centeredDistribution(NUM_PARTICLES);//randomDistribution(NUM_PARTICLES);
}

function pf_loop() {
	runFilter({dist: readDistSensors()[1], theta: robotState.mid_sensor_angle});
}

function runFilter(reading) {
	assignWeights(reading, particleList, obstacleList);
	particleList = resample(particleList, NUM_PARTICLES);
	transition(particleList);
	
	//console.log(pf_state);
	if(pf_state == 2) {
		paintParticleList2(particleList);
	} else if (pf_state == 1) {
		var totals = {x:0,y:0,vx:0,vy:0};
		for(var i = 0; i < particleList.length; i++) {
			var p = particleList[i];
			totals.x += p.p.x;
			totals.y += p.p.y;
			totals.vx += Math.cos(p.theta);
			totals.vy += Math.sin(p.theta);
		}
		var aveParticle = [
				totals.x/particleList.length,
				totals.y/particleList.length,
				my_atan(totals.vy/particleList.length, 
						totals.vx/particleList.length) 
				];
		setParticleList([aveParticle]);
	} else if (pf_state == 0) {
		setParticleList([]);
	}
}

/* particle filter functions */

function resample(list, num) {
	var newList = [];
	for(var i = 0; i < num; i++) {
		var rand = Math.random();
		var index = 0, runningSum = 0;
		for(var j = 0; j < list.length; j++) {
			runningSum += list[j].weight;
			if (rand < runningSum) {
				index = j;
				break;
			}
		}
		newList.push(list[index]);
	}
	return newList;
}

function assignWeights(reading, list, obstacles) {
	var total = 0;
	for(var i = 0; i < list.length; i++) {
		var p = list[i];
		var actual = getDistanceToObstacle(
						[p.p.x, p.p.y, p.theta+reading.theta], 
						obstacles
						);
		var dif = Math.abs(actual - reading.dist);
		list[i].weight = weightFunct(dif);
		total += list[i].weight;
	}
	
	// normalize
	for(var i = 0; i < particleList.length; i++) {
		particleList[i].weight = particleList[i].weight/total;
	}
}

function transition() {
	for(var i = 0; i < particleList.length; i++) {
		var newParticle = null;
		while(newParticle == null || !stateIsValid(newParticle)) {
			newParticle = createNewState(
							particleList[i],
							Math.random()*40-20,
							Math.random()*Math.PI/3 - Math.PI/6
							);
		}
		particleList[i] = newParticle;
	}
}

function centeredDistribution(num) {
	var list = [];
	for(var i = 0; i < num; i++) {
		var particle = createState(
							(400*Math.random()-200)+CANVAS_WIDTH/2,
							(400*Math.random()-200)+CANVAS_HEIGHT/2,
							Math.random()*2*Math.PI
							);
		list.push(particle);
	}
	return list;
}

function randomDistribution(num) {
	var list = [];
	for(var i = 0; i < num; i++) {
		var particle = null;
		while(particle == null || !stateIsValid(particle)) {
			particle = createState(
							Math.random()*CANVAS_WIDTH,
							Math.random()*CANVAS_HEIGHT,
							Math.random()*2*Math.PI
							);
		}
		list.push(particle);
	}
	return list;
}

/* utility functions */

function cutAngle(angle) {
	if(angle < 0)
		angle += Math.PI*2;
	angle = angle - Math.floor(angle/(Math.PI*2))*(Math.PI*2);
	return angle;
}

function weightFunct(dif) {
	return 1/(dif+1);
}

function createNewState(old,r,theta) {
	var newTheta = cutAngle(old.theta+theta);
	return {p:{x:old.p.x+r*Math.cos(newTheta),y:old.p.y+r*Math.sin(newTheta)}, theta:newTheta};
}

function createState(x,y,theta) {
	return {p:{x:x,y:y}, theta:theta};
}

function stateIsValid(state) {
	return state.p.x > 0 && state.p.x < CANVAS_WIDTH && state.p.y > 0 && state.p.y < CANVAS_HEIGHT;
}

function my_atan(y, x) {
	if (x == 0) {
		if (y > 0) return PI/2;
		else if (y < 0) return -PI/2;
		else if (y == 0) return 0;
	}
	if (x < 0) 
		return Math.atan(y/x)+Math.PI;
	return Math.atan(y/x);
}