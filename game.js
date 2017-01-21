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
				this.nextPerson(current.answers[index].next);
			},
			nextPerson: function(name){
				var obj = flow[name];
				if(obj.lose){
					this.gameState = 'lose';
					return;
				}
				else if(obj.win){
					this.gameState = 'win';
					return
				}
				this.personName = name;
				this.dialog = obj.question;
				this.answers = obj.answers;
				lib.doDialogs([obj.intro, obj.answers[0].me, obj.answers[1].me, obj.answers[2].me]);
			},
			movementKey: function(){
				isMoving = true;
				pos = pos + .001;
				var timer = window.setTimeout(function(){
					var normalized = pos - Math.floor(pos);
					if(isMoving){
						if(Math.floor(pos) > 0 && normalized <= .001){
							lib.nextAmbient();
						}
						else{
							lib.refresh(pos - Math.floor(pos));
						}
						app.movementKey()
					}
					else{
						window.clearTimeout(timer);
					}
				}, 3);
				console.log(pos)
			}
		}
	});

	// setup key listeners
	document.addEventListener('keydown', function(event){
		const keyName = event.key;
		switch (keyName){
			case 'a':
				app.keyPressed(0);
			case 's':
				app.keyPressed(1);
			case 'd':
				app.keyPressed(2);
			case ' ':
				app.movementKey();
		}

	}, false);

	document.addEventListener('keyup', function(event){
		const keyName = event.key;
		switch (keyName){
			case ' ':
				isMoving = false;
		}
	}, false)

	// get all of the ambient sounds
	var ambientElems = [];
	var count = 0;
	var ref = app.$refs['ambience' + count];
	while(ref){
		ambientElems.push(ref);
		count++;
		ref = app.$refs['ambience' + count];
	}

	var flow = {
		'cowboy': {
			intro: 'cowboy1',
			question: 'Howdy partner!',
			answers: [
				{next: 'performer', text: 'I want to see the performer', me: 'alex1', outloud: 'alex2', them: 'cowboy1'},
				{next: 'sports', text: 'I want to see the sports', me: 'alex3', outloud: 'alex4', them: 'cowboy2'},
				{next: 'cowboy', text: 'Tell me about yourself', me: 'alex5', outloud: 'alex6', them: 'cowboy3'}
			]
		},
		'performer': {
			question: 'Hi, I am a performer',
			answers: [
				{next: 'drug', text: 'I want to see the drug'},
				{next: 'tourist', text: 'I want to see the tourist'},
				{next: 'biker', text: 'I want to see the biker'}
			]
		},
		'sports': {
			question: 'Hi, I am a sports',
			answers: [
				{next: 'drug', text: 'I want to see the drug'},
				{next: 'vendor', text: 'I want to see the vendor'},
				{next: 'biker', text: 'I want to see the biker'}
			]
		},
		'drug': {
			question: 'Hi, I am a drug',
			answers: [
				{next: 'cop', text: 'I want to see the cop'},
				{next: 'biker', text: 'I want to see the biker'},
				{next: 'sports', text: 'I want to see the sports'}
			]
		},
		'biker': {
			question: 'Hi, I am a biker',
			answers: [
				{next: 'performer', text: 'I want to see the performer'},
				{next: 'drug', text: 'I want to see the drug'},
				{next: 'bachelorette', text: 'I want to see the bachelorette'}
			]
		},
		'cop': {
			question: 'Hi, I am a cop',
			answers: [
				{next: 'vendor', text: 'I want to see the vendor'},
				{next: 'songwriter', text: 'I want to see the songwriter'},
				{next: 'jail', text: 'I want to see the jail'}
			]
		},
		'bachelorette': {
			question: 'Hi, I am a bachelorette',
			answers: [
				{next: 'tourist', text: 'I want to see the tourist'},
				{next: 'vendor', text: 'I want to see the vendor'},
				{next: 'partybus', text: 'I want to see the partybus'}
			]
		},
		'vendor': {
			question: 'Hi, I am a vendor',
			answers: [
				{next: 'tourist', text: 'I want to see the tourist'},
				{next: 'songwriter', text: 'I want to see the tobi'},
				{next: 'cop', text: 'I want to see the cop'}
			]
		},
		'tourist': {
			question: 'Hi, I am a tourist',
			answers: [
				{next: 'drug', text: 'I want to see the drug'},
				{next: 'sports', text: 'I want to see the sports'},
				{next: 'partybus', text: 'I want to see the partybus'}
			]
		},
		'songwriter': {
			question: 'Hi, I am a songwriter',
			answers: [
				{next: 'performer', text: 'I want to see the performer'},
				{next: 'tobi', text: 'I want to see the tobi'},
				{next: 'songwriter', text: 'I want to see the songwriter'}
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
				{next: 'cowboy', text: 'I want to see the cowboy'},
				{next: 'cowboy', text: 'I want to see the cowboy'},
				{next: 'cowboy', text: 'I want to see the cowboy'}
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
				lib = new AudioLib(ambientElems, dialog);
				app.nextPerson('cowboy');
				lib.startAmbient();
			}
		}
	}


})(window.AudioLib);