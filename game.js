(function(){
	var flow = {
		'cowboy': {
			question: 'Howdy partner!',
			answers: [
				{next: 'performer', text: 'I want to see the performer'},
				{next: 'sports', text: 'I want to see the sports'},
				{next: 'cowboy', text: 'Tell me about yourself'}
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
				{next: 'claire', text: 'I want to see the claire'},
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
				{next: 'claire', text: 'I want to see the claire'},
				{next: 'songwriter', text: 'I want to see the songwriter'}
			]
		},
		'jail': {
			question: 'Hi, I am a jail',
			lose: true
		},
		'claire': {
			question: 'Hi, I am a claire',
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
			}
		}
	});
	app.nextPerson('cowboy');

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
		}

	}, false);
})();