(function(AudioLib){
	var pos = 0;
	var isMoving = false;

	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}
	function getRandItem(array){
		return array[getRandomInt(0, array.length)];
	}

	var app = new Vue({
		el: '#app',
		data: {
			dialog: 'Question....',
			answers:[],
			personName: '',
			gameState: 'game'
		},
		methods: {
			keyPressed: function(index){
				var current = flow[this.personName];
				this.nextPerson(current.answers[index].next, index);
			},
			nextPerson: function(name, responseId){
				var next = flow[name];
				if(next.lose){
					this.gameState = 'lose';
					return;
				}
				if(next.win){
					this.gameState = 'win';
					return
				}
				var waitTime = 0;
				var currPerson = flow[this.personName];
				if(responseId < currPerson.answers.length){
					var myAnswer = currPerson.answers[responseId];
					// player says something and other person might respond
					lib.clearDialogQueue();
					waitTime = lib.doDialogs([myAnswer.outloud, myAnswer.then]);

					// wait before showing these?
					this.personName = name;
					this.dialog = next.question;
					this.answers = next.answers;
					var nextDiags;
					if(Array.isArray(next.intro)){
						nextDiags = [getRandItem(next.intro)];
					} else{
						nextDiags = [next.intro];
					}
					for(var i = 0, len = next.answers.length; i < len; i++){
						nextDiags.push(next.answers[i].me);
					}
					lib.doDialogs(nextDiags, waitTime);
					// may need to grab that wait time too
				} else{
					console.log('bad config');
				}
			},
			initialize: function(name){
				var next = flow[name];
				this.personName = name;
				this.dialog = next.question;
				this.answers = next.answers;
				lib.doDialogs([next.intro, next.answers[0].me, next.answers[1].me, next.answers[2].me]);
			},

			// spacebar movement
			movementKey: function(){
				var timer;
				isMoving = true;
				pos = pos + .05;
				timer = window.setTimeout(function(){
					var normalized = pos - Math.floor(pos);
					if(isMoving){
						if(Math.floor(pos) > 0 && normalized <= .05){
							lib.nextAmbient();
						} else {
							//play footsteps
								lib.footsteps(footstepList);

							//refresh sound sources
							lib.refresh(pos - Math.floor(pos));
							window.clearTimeout(timer);
						}
					}
				}, 100);
				console.log(pos)
			}
		}
	});

	// setup key listeners
	var aDown = false;
	var sDown = false;
	var dDown = false;
	var fDown = false;
	var spDown = false;
	document.addEventListener('keydown', function(event){
		const keyName = event.key;
		switch (keyName){
			case 'a':
				if(aDown) return;
				aDown = true;
				app.keyPressed(0);
				break;
			case 's':
				if(sDown) return;
				sDown = true;
				app.keyPressed(1);
				break;
			case 'd':
				if(dDown) return;
				dDown = true;
				app.keyPressed(2);
				break;
			case 'f':
				if(fDown) return;
				fDown = true;
				app.keyPressed(3);
				break;
			case ' ':
				if(spDown) return;
				spDown = true;
				app.movementKey();
				break;
		}

	}, false);

	// key listener for spacebar upon release movement
	document.addEventListener('keyup', function(event){
		const keyName = event.key;
		switch (keyName){
			case ' ':
				isMoving = false;
				spDown = false;
				break;
		}
	}, false);

	// get all of the ambient sounds
	var ambientElems = [];
	var count = 0;
	var ref = app.$refs['amb' + count];
	while(ref){
		ambientElems.push(ref);
		count++;
		ref = app.$refs['amb' + count];
	}

	//get all footstep sounds
	var footstepList = [];
	var count = 0;
	var step = app.$refs['step' + count];
	while(step) {
		footstepList.push(step);
		count++;
		var step = app.$refs['step' + count];
	}

	var flow = {
		'cowboy': {
			intro: 'intro_cowboy',
			question: 'Howdy partner!',
			answers: [
				{id:0, next: 'cowboy2', text: 'okay', outloud: 'respond_to_street_performer'},
				{id:1, next: 'cowboy2', text: '', outloud: 'respond_to_street_performer'},
				{id:2, next: 'cowboy2', text: '', outloud: 'respond_to_street_performer'},
			]
		},
		'cowboy2': {
			intro: 'cowboy2_intro',
			question: 'Howdy 2',
			answers: [
				{id:0, next: 'performer', text: 'I want to see the performer', outloud: 'respond_to_cowboy1'},
				{id:1, next: 'sports', text: 'I want to see the sports', outloud: 'respond_to_cowboy2'},
			]
		},
		'performer': {
			intro: 'street_performer',
			question: 'Hi, I am a performer',
			answers: [
				{id:0, next: 'drugdealer', text: 'I want to see the drugdealer', outloud: 'respond_to_street_performer'},
				{id:1, next: 'tourist', text: 'I want to see the tourist', outloud: 'respond_to_street_performer'},
				{id:2, next: 'biker', text: 'I want to see the biker', outloud: 'respond_to_street_performer'}
			]
		},
		'sports': {
			intro: ['sports1', 'sports2'],
			question: 'Hi, I am a sportsfan',
			answers: [
				{id:0, next: 'drugdealer', text: 'I want to see the drugdealer'},
				{id:1, next: 'vendor', text: 'I want to see the vendor'},
				{id:2, next: 'biker', text: 'I want to see the biker'}
			]
		},
		'drugdealer': {
			question: 'Hi, I am a drugdealer',
			answers: [
				{id:0, next: 'cop', text: 'I want to see the cop'},
				{id:1, next: 'biker', text: 'I want to see the biker'},
				{id:2, next: 'sports', text: 'I want to see the sports'}
			]
		},
		'biker': {
			question: 'Hi, I am a biker',
			answers: [
				{id:0, next: 'performer', text: 'I want to see the performer'},
				{id:1, next: 'drugdealer', text: 'I want to see the drugdealer'},
				{id:2, next: 'bachelorette', text: 'I want to see the bachelorette'}
			]
		},
		'cop': {
			question: 'Hi, I am a cop',
			answers: [
				{id:0, next: 'vendor', text: 'I want to see the vendor'},
				{id:1, next: 'songwriter', text: 'I want to see the songwriter'},
				{id:2, next: 'jail', text: 'I want to see the jail'}
			]
		},
		'bachelorette': {
			question: 'Hi, I am a bachelorette',
			answers: [
				{id:0, next: 'tourist', text: 'I want to see the tourist'},
				{id:1, next: 'vendor', text: 'I want to see the vendor'},
				{id:2, next: 'cop', text: 'I want to see the cop'},
				{id:3, next: 'partybus', text: 'I want to see the partybus'}
			]
		},
		'vendor': {
			question: 'Hi, I am a vendor',
			answers: [
				{id:0, next: 'tourist', text: 'I want to see the tourist'},
				{id:1, next: 'songwriter', text: 'I want to see the songwriter'},
				{id:2, next: 'cop', text: 'I want to see the cop'}
			]
		},
		'tourist': {
			question: 'Hi, I am a tourist',
			answers: [
				{id:0, next: 'songwriter', text: 'I want to see the songwriter'},
				{id:1, next: 'sports', text: 'I want to see the sports'},
				{id:2, next: 'partybus', text: 'I want to see the partybus'}
			]
		},
		'songwriter': {
			question: 'Hi, I am a songwriter',
			answers: [
				{id:0, next: 'performer', text: 'I want to see the performer'},
				{id:1, next: 'tobi', text: 'I want to see the tobi'},
				{id:2, next: 'songwriter', text: 'I want to see the songwriter'}
			]
		},
		'jail': {
			question: 'Hi, I am a jail',
			lose: true
		},
		'tobi': {
			question: 'Hi, I am a tobi',
			win: true
		},
		'partybus': {
			question: 'Hi, I am a partybus',
			answers: [
				{id:0, next: 'cowboy', text: 'I want to see the cowboy'},
				{id:1, next: 'cowboy', text: 'I want to see the cowboy'},
				{id:2, next: 'cowboy', text: 'I want to see the cowboy'}
			]
		}
	};

	var dialog = {
		// debug samples
		intro_cowboy: app.$refs.intro_cowboy,
		cowboy2_intro: app.$refs.cowboy2_intro,
		respond_to_cowboy1: app.$refs.respond_to_cowboy1,
		respond_to_cowboy2: app.$refs.respond_to_cowboy2,
		respond_to_street_performer: app.$refs.respond_to_street_performer,
		sports1: app.$refs.sports1,
		sports2: app.$refs.sports2,
		street_performer: app.$refs.street_performer
	}

	var lib;

	//window.setTimeout(function(){
	//	lib = new AudioLib(ambientElems, dialog);
	//	app.nextPerson('cowboy');
	//	lib.startAmbient();
	//}, 2000);

	var readyCount = 0;
	var need = 7;
	for(key in dialog){
		dialog[key].onloadedmetadata = function(){
			readyCount++;
			if(readyCount === need){
				lib = new AudioLib(ambientElems, dialog, footstepList);
				app.initialize('cowboy');
				lib.startAmbient();
			}
		}
	}

	window.setInterval(function () {
		spDown = false;
		aDown = false;
		sDown = false;
		dDown = false;
		fDown = false;
	}, 700)


})(window.AudioLib);