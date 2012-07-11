/* 
This is a basic particle filter for localization.
*/

var NUM_PARTICLES = 2000;
var numAveParticles = 5;
var particleList, obstacleList, oldAveParticles;

function pf_main() {
	obstacleList = getObstacleList();
	particleList = randomDistribution(NUM_PARTICLES, obstacleList);
	oldAveParticles = [];
	//randomDistribution(NUM_PARTICLES, obstacleList);
}

function pf_loop() {
	runFilter({dist: readDistSensors()[1], theta: robotState.mid_sensor_angle});
}

function runFilter(reading) {
	assignWeights(reading, particleList, obstacleList);
	particleList = resample(particleList, NUM_PARTICLES);
	transition(obstacleList);
	
	//console.log(pf_state);
	if(pf_state == 2) {
		paintParticleList2(particleList);
	} else if (pf_state == 1) {
		paintParticleList2([getCurAveParticle(particleList)]);
	} else if (pf_state == 0) {
		paintParticleList2([]);
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

function transition(obstacles) {
	for(var i = 0; i < particleList.length; i++) {
		var newParticle = null;
		while(newParticle == null || !stateIsValid(newParticle, obstacles)) {
			newParticle = createNewState(
							particleList[i],
							Math.random()*40-20,
							Math.random()*Math.PI/3 - Math.PI/6
							);
		}
		particleList[i] = newParticle;
	}
}

function centeredDistribution(num, obstacles) {
	var list = [];
	for(var i = 0; i < num; i++) {
		
		var particle = null;
		while(particle == null || !stateIsValid(particle, obstacles)) {
			var particle = createState(
							(400*Math.random()-200)+CANVAS_WIDTH/2,
							(400*Math.random()-200)+CANVAS_HEIGHT/2,
							Math.random()*2*Math.PI
							);
		}
		list.push(particle);
	}
	return list;
}

function randomDistribution(num, obstacles) {
	var list = [];
	for(var i = 0; i < num; i++) {
		var particle = null;
		while(particle == null || !stateIsValid(particle, obstacles)) {
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

function getCurAveParticle(particleList) {
	var curAve = getAverageParticle(particleList);
	oldAveParticles.push(curAve);
	if(numAveParticles == 0)
		oldAveParticles.shift();
	else
		numAveParticles--;
	return getAverageParticle(oldAveParticles);
}

function getAverageParticle(particleList) {
	var totals = {x:0,y:0,vx:0,vy:0}, size = 0;
	for(var i = 0; i < particleList.length; i++) {
		var p = particleList[i];
		if(p != undefined && p != null) {
			totals.x += p.p.x;
			totals.y += p.p.y;
			totals.vx += Math.cos(p.theta);
			totals.vy += Math.sin(p.theta);
			size++;
		}
	}
	return { p: {x:totals.x/size,y:totals.y/size},
			 theta: my_atan(totals.vy/size,totals.vx/size) };
}

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

function stateIsValid(state, obstacles) {
	if(!(state.p.x > 0 && state.p.x < CANVAS_WIDTH && state.p.y > 0 && state.p.y < CANVAS_HEIGHT))
		return false;
		
	for(var i = 0; i < obstacles.length; i++) {
		if(pointInPoly(state.p, obstacles[i])) {
			return false;
		}
	}
	
	return true;
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