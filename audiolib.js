(function(){
	function Track(context, mediaElement, isLoop, destination){
		this.isLoop = isLoop;
		this.element = mediaElement;
		this.node = context.createMediaElementSource(mediaElement);
		this.gain = context.createGain();
		this.node.connect(this.gain);
		if(!destination){
			this.gain.connect(context.destination);
		} else{
			this.gain.connect(destination);
		}
	}
	Track.prototype.play = function(){
		this.element.play();
		if(this.isLoop){
			this.element.loop = true;
		}
	};
	Track.prototype.stop = function(){
		this.element.pause();
		this.element.currentTime = 0;
	};
	Track.prototype.setGain = function(amount){
		this.gain.gain.value = amount;
	};
	Track.prototype.getLength = function(){ // see http://stackoverflow.com/questions/10868249/html5-audio-player-duration-showing-nan
		return this.element.duration * 1000; // ms
	};


	function MixChannel(context, destination){
		this.gain = context.createGain();
		if(!destination){
			this.gain.connect(context.destination);
		} else{
			this.gain.connect(destination);
		}
		this.input = this.gain;
	}
	MixChannel.prototype.setGain = function(amount){
		this.gain.gain.value = amount;
	};




	function AudioLib(ambientElemList, dialogElemObj, footstepList){
		var AudioContext = window.AudioContext || window.webkitAudioContext;
		this.context = new AudioContext();

		this.activeAmbient = 0;
		this.gainState = 0;
		this.ambientTracks = [];
		this.ambientSubmix = new MixChannel(this.context);
		this.ambientSubmix.setGain(0.3);
		var track;
		for(var i = 0, len = ambientElemList.length; i < len; i++){
			track = new Track(this.context, ambientElemList[i], true, this.ambientSubmix.input);
			this.ambientTracks.push(track);
		}

		this.currentDialog = '';
		this.dialogTracks = {};
		this.dialogSubmix = new MixChannel(this.context);
		this.dialogSubmix.setGain(1);
		for(var key in dialogElemObj){
			track = new Track(this.context, dialogElemObj[key], false, this.dialogSubmix.input);
			this.dialogTracks[key] = track;
		}
		this.dialogQueue = [];

		this.footstepTracks = [];
		this.footstepSubmix = new MixChannel(this.context);
		this.footstepSubmix.setGain(0.2);
		for(i = 0, len = footstepList.length; i < len; i++) {
			track = new Track(this.context, footstepList[i], false, this.footstepSubmix.input);
			this.footstepTracks.push(track);
		}
	}
	AudioLib.prototype.startAmbient = function(){
		if(this.ambientTracks.length >= this.activeAmbient + 2){
			this.gainState = 0;
			var track1 = this.ambientTracks[this.activeAmbient]; 
			track1.setGain(1 - this.gainState);
			track1.play();

			var track2 = this.ambientTracks[this.activeAmbient + 1]; 
			track2.setGain(this.gainState);
			track2.play();
		}
		
	};

	AudioLib.prototype.refresh = function(newState){
		if(this.ambientTracks.length > this.activeAmbient + 1){
			this.gainState = newState;
			this.ambientTracks[this.activeAmbient].setGain(1 - this.gainState);
			this.ambientTracks[this.activeAmbient+1].setGain(this.gainState);
		}
	};

	AudioLib.prototype.nextAmbient = function(){
		this.gainState = 0;
		this.activeAmbient++;
		if(this.ambientTracks.length >= this.activeAmbient + 2){
			var trackOld = this.ambientTracks[this.activeAmbient-1];
			var trackOn = this.ambientTracks[this.activeAmbient];
			var trackNext = this.ambientTracks[this.activeAmbient+1];

			trackOld.stop();
			// trackOn is already playing
			trackOn.setGain(1 - this.gainState);
			trackNext.setGain(this.gainState);
			trackNext.play();
		}
	};

	AudioLib.prototype.doDialog = function(key){
		// stop the current playing track
		if(this.currentDialog){
			var track = this.dialogTracks[this.currentDialog];
			track.stop();
		}
		
		if(key && this.dialogTracks[key]){
			this.currentDialog = key;
			var newTrack = this.dialogTracks[key];
			newTrack.setGain(1);
			newTrack.play();
		}
	};

	AudioLib.prototype.clearDialogQueue = function(){
		for(var i = 1, len = this.dialogQueue.length; i < len; i++){
			var timer = this.dialogQueue[i].timer;
			window.clearTimeout(timer);
		}
		this.dialogQueue = [];
	};	

	AudioLib.prototype.doDialogs = function(keys, extraWaitTime){
		// https://bugs.chromium.org/p/chromium/issues/detail?id=593273
		// stop the current playing track
		var waitTime = extraWaitTime ? extraWaitTime : 0;
		if(keys.length > 0){
			var i;
			if(waitTime > 0){
				i = 0;
			} else{
				i = 1; // do the 0 one right away
				if(keys[0] === ''){
					waitTime += 250;
				} else if(keys[0] !== undefined){
					waitTime += this.dialogTracks[keys[0]].getLength() + 100;
				}
				this.doDialog(keys[0]);
			}
			
			var self = this;
			for(var len = keys.length; i < len; i++){
				if(keys[i] === ''){
					waitTime += 250;
				} else if(keys[i] !== undefined){

					var timer = window.setTimeout((function(index){
						return function(){
							self.doDialog(keys[index]);
							self.dialogQueue.splice(0,1); // remove first 
						};
					})(i), waitTime);
					this.dialogQueue.push(timer);

					waitTime += this.dialogTracks[keys[i]].getLength() + 100;
				}
			}
		}
		return waitTime;
	};

	AudioLib.prototype.footsteps = function(footstepList) {
		var rand = Math.floor(Math.random() * 11);
		this.footstepTracks[rand].play();
    };

	window.AudioLib = AudioLib;
})();