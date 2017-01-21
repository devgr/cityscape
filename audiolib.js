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


	function MixChannel(context, destination){
		this.gain = this.context.createGain();
		if(!destination){
			this.gain.connect(context.destination);
		} else{
			this.gain.connect(destination);
		}
	}
	MixChannel.prototype.setGain = function(amount){
		this.gain.gain.value = amount;
	};




	function AudioLib(ambientElemList, dialogElemObj){
		var AudioContext = window.AudioContext || window.webkitAudioContext
		this.context = new AudioContext();

		this.activeAmbient = 0;
		this.gainState = 0;
		this.ambientTracks = [];
		this.ambientSubmix = new MixChannel(this.context);
		this.ambientSubmix.setGain(.4);
		for(var i = 0, len = ambientElemList.length; i < len; i++){
			var track = new Track(this.context, ambientElemList[i], true, this.ambientSubmix);
			this.ambientTracks.push(track);
		}

		this.currentDialog = '';
		this.dialogTracks = {};
		this.dialogSubmix = new MixChannel(this.context);
		this.dialogSubmix.setGain(.6);
		for(var key in dialogElemObj){
			var track = new Track(this.context, dialogElemObj[key], false, this.dialogSubmix);
			this.dialogTracks[key] = track;
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
			var track = this.dialogTracks[this.currentDialog]
			track.stop();
		}
		
		if(key && this.dialogTracks[key]){
			this.currentDialog = key;
			var newTrack = this.dialogTracks[key];
			newTrack.setGain(1);
			newTrack.play();
		}
	};


	window.AudioLib = AudioLib;
})();