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
			dialog: 'Loading...',
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
				var currPerson = flow[this.personName];
				var myAnswer;
				if(next.lose){
					myAnswer = currPerson.answers[responseId];
					lib.clearDialogQueue();
					lib.doDialogs([myAnswer.outloud, myAnswer.then]);
					this.gameState = 'lose';
					return;
				}
				if(next.win){
					myAnswer = currPerson.answers[responseId];
					lib.clearDialogQueue();
					lib.doDialogs([myAnswer.outloud, myAnswer.then]);
					this.gameState = 'win';
					return;
				}
				var waitTime = 0;
				if(responseId < currPerson.answers.length){
					myAnswer = currPerson.answers[responseId];
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
				pos = pos + 0.05;
				timer = window.setTimeout(function(){
					var normalized = pos - Math.floor(pos);
					if(isMoving){
						if(Math.floor(pos) > 0 && normalized <= 0.05){
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
				console.log(pos);
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
	count = 0;
	var step = app.$refs['step' + count];
	while(step) {
		footstepList.push(step);
		count++;
		step = app.$refs['step' + count];
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
			question: 'Howdy partner!',
			answers: [
				{id:0, next: 'performer', text: 'I want to see the performer', outloud: 'respond_to_cowboy1'},
				{id:1, next: 'sports', text: 'Sports fan?', outloud: 'respond_to_cowboy2'},
			]
		},
		'performer': {
			intro: 'street_performer',
			question: 'Tip jar is right here!',
			answers: [
				{id:0, next: 'drugdealer', text: 'Good time?', outloud: 'respond_to_street_performer'},
				{id:1, next: 'tourist', text: 'Follow tourist', outloud: 'respond_to_street_performer'},
				{id:2, next: 'biker', text: 'Check out biker', outloud: 'respond_to_street_performer'}
			]
		},
		'sports': {
			intro: ['sports1', 'sports2'],
			question: 'Wooo! Go [insert team name here]!',
			answers: [
				{id:0, next: 'vendor', text: 'Buy from the vendor'},
				{id:1, next: 'drugdealer', text: 'Visit the alley'},
				{id:2, next: 'biker', text: 'Get a ride'}
			]
		},
		'drugdealer': {
			intro: 'drugdealer',
			question: 'Hey kid...',
			answers: [
				{id:0, next: 'jail', text: 'Yes', outloud:'drugs_yes'},
				{id:1, next: 'biker', text: 'No', outloud:'drugs_no'},
				{id:2, next: 'sports', text: 'Ummmmm'}
			]
		},
		'biker': {
			intro: 'biker',
			question: '...',
			answers: [
				{id:0, next: 'performer', text: 'Check out the tunes', outloud:'biker_to_performer'},
				{id:1, next: 'bachelorette', text: 'Have a real good time!', outloud:'biker_to_goodtime'},
				{id:2, next: 'drugdealer', text: 'Drop off at the alley', outloud:'biker_to_drug'}
			]
		},
		'cop': {
			intro: 'cop',
			question: 'Officer',
			answers: [
				{id:1, next: 'songwriter', text: 'Music, I guess'},
				{id:0, next: 'vendor', text: 'Buy something from the vendor'},
				{id:2, next: 'jail', text: 'Tell a joke'}
			]
		},
		'bachelorette': {
			intro: 'bachelorette',
			question: 'Party!!!',
			answers: [
				{id:1, next: 'vendor', text: 'Go get a bottle opener'},
				{id:0, next: 'tourist', text: 'Talk to the tourist'},
				{id:2, next: 'cowboy', text: 'Party on the streets'},
			]
		},
		'vendor': {
			intro: 'vendor',
			question: 'Hola amigo!',
			answers: [
				{id:0, next: 'tourist', text: 'Talk to the tourist'},
				{id:1, next: 'songwriter', text: 'Find his friend'},
				{id:2, next: 'jail', text: 'Steal something', outloud: 'vendor_steal'}
			]
		},
		'tourist': {
			intro: 'tourist',
			question: 'Taking selfie...', 
			answers: [
				{id:0, next: 'songwriter', text: 'Check out the music'},
				{id:1, next: 'sports', text: 'I want to see the sports'},
				{id:2, next: 'bachelorette', text: 'Did you say party?'}
			]
		},
		'songwriter': {
			intro: 'songwriter',
			question: 'Would you like to hear my songs?',
			answers: [
				{id:0, next: 'songwriter', text: 'Hear some songs'},
				{id:1, next: 'performer', text: 'Listen to the street performer over there'},
				{id:2, next: 'tobi', text: 'Go to Tobi\'s'}
			]
		},
		'jail': {
			intro: 'jail',
			question: 'You are in jail',
			answers: [
				{id:0, next: 'cowboy', text: 'okay', outloud: 'respond_to_street_performer'},
				{id:1, next: 'cowboy', text: '', outloud: 'respond_to_street_performer'},
				{id:2, next: 'cowboy', text: '', outloud: 'respond_to_street_performer'}
			]
		},
		'tobi': {
			intro: 'tobis',
			question: 'You made it!',
			answers: [
				{id:0, next: 'cowboy', text: 'okay', outloud: 'respond_to_street_performer'},
				{id:1, next: 'cowboy', text: '', outloud: 'respond_to_street_performer'},
				{id:2, next: 'cowboy', text: '', outloud: 'respond_to_street_performer'}
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
		street_performer: app.$refs.street_performer,
		bachelorette: app.$refs.bachelorette,
		biker: app.$refs.biker,
		biker_to_drug: app.$refs.biker_to_drug,
		biker_to_goodtime: app.$refs.biker_to_goodtime,
		biker_to_performer: app.$refs.biker_to_performer,
		cop: app.$refs.cop,
		drugdealer: app.$refs.drugdealer,
		drugs_no: app.$refs.drugs_no,
		drugs_yes: app.$refs.drugs_yes,
		jail: app.$refs.jail,
		songwriter: app.$refs.songwriter,
		tobis: app.$refs.tobis,
		tourist: app.$refs.tourist,
		vendor: app.$refs.vendor,
		vendor_steal: app.$refs.vendor_steal
	};

	var lib;

	//window.setTimeout(function(){
	//	lib = new AudioLib(ambientElems, dialog);
	//	app.nextPerson('cowboy');
	//	lib.startAmbient();
	//}, 2000);

	var readyCount = 0;
	var need = 23;
	for(var key in dialog){
		dialog[key].onloadedmetadata = function(){
			readyCount++;
			if(readyCount === need){
				lib = new AudioLib(ambientElems, dialog, footstepList);
				app.initialize('cowboy');
				lib.startAmbient();
			}
		};
	}

	window.setInterval(function () {
		spDown = false;
		aDown = false;
		sDown = false;
		dDown = false;
		fDown = false;
	}, 700);


})(window.AudioLib);