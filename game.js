(function(AudioLib){
	var pos = 0;
	var isMoving = false;

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
					var myAnswer = curr.answers[responseId];
					// player says something and other person might respond
					lib.clearDialogQueue();
					waitTime = lib.doDialogs([myAnswer.outloud, myAnswer.then]);

					// wait before showing these?
					this.personName = name;
					this.dialog = next.question;
					this.answers = next.answers;
					var nextDiags = [next.intro];
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
				pos = pos + .001;
				timer = window.setTimeout(function(){
					var normalized = pos - Math.floor(pos);
					if(isMoving){
						if(Math.floor(pos) > 0 && normalized <= .001){
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
	var spDown = false;
	document.addEventListener('keydown', function(event){
		const keyName = event.key;
		switch (keyName){
			case 'a':
				if(aDown) return;
                aDown = true;
				app.keyPressed(0);
			case 's':
                if(sDown) return;
                sDown = true;
				app.keyPressed(1);
			case 'd':
				app.keyPressed(2);
			case 'f':
				app.keyPressed(3);
			case ' ':
				if(spDown) return;
				spDown = true;
				app.movementKey();
		}

	}, false);

	// key listener for spacebar upon release movement
	document.addEventListener('keyup', function(event){
		const keyName = event.key;
		switch (keyName){
			case ' ':
				isMoving = false;
				spDown = false;
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
			intro: 'cowboy1',
			question: 'Howdy partner!',
			answers: [
				{id:0, next: 'performer', text: 'I want to see the performer', me: 'alex1', outloud: 'alex2', them: 'cowboy1'},
				{id:1, next: 'sports', text: 'I want to see the sports', me: 'alex3', outloud: 'alex4', them: 'cowboy2'},
				{id:2, next: 'cowboy', text: 'Tell me about yourself', me: 'alex5', outloud: 'alex6', them: 'cowboy3'}
			]
		},
		'performer': {
			question: 'Hi, I am a performer',
			answers: [
				{id:0, next: 'drugdealer', text: 'I want to see the drugdealer'},
				{id:1, next: 'tourist', text: 'I want to see the tourist'},
				{id:2, next: 'biker', text: 'I want to see the biker'}
			]
		},
		'sports': {
			question: 'Hi, I am a sports',
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
		cowboy1: app.$refs.cowboy1,
		alex1: app.$refs.alex1,
		alex2: app.$refs.alex2,
		alex3: app.$refs.alex3,
		alex4: app.$refs.alex4,
		alex5: app.$refs.alex5,
		alex6: app.$refs.alex6
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
			//	app.initialize('cowboy');
				lib.startAmbient();
			}
		}
	}

	window.setInterval(function () {
		spDown = false;
    }, 700)


})(window.AudioLib);