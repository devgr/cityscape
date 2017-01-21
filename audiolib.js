(function(){
	function AudioLib(){
		var AudioContext = window.AudioContext || window.webkitAudioContext
		this.context = new AudioContext();
		this.ambientElement1 = null;
		this.ambientElement2 = null;
		this.ambientNode1 = null;
		this.ambientNode2 = null;
		this.ambientGain1 = null;
		this.ambientGain2 = null;
		this.gainState = null;
		this.setup();
	}
	AudioLib.prototype.setup = function(){

	}
	AudioLib.prototype.initialBackground = function(mediaElement1, mediaElement2, state){
		this.gainState = state;
		this.ambientElement1 = mediaElement1;
		this.ambientNode1 = this.context.createMediaElementSource(this.ambientElement1);
		this.ambientGain1 = this.context.createGain();
		this.ambientNode1.connect(this.ambientGain1);
		this.ambientGain1.connect(this.context.destination);
		this.ambientGain1.gain.value = 1 - this.gainState;
		this.ambientElement1.play();
		this.ambientElement1.loop = true;

		this.ambientElement2 = mediaElement2;
		this.ambientNode2 = this.context.createMediaElementSource(ambientElement2);
		this.ambientGain2 = this.context.createGain();
		this.ambientNode2.connect(this.ambientGain2);
		this.ambientGain2.connect(this.context.destination);
		this.ambientGain2.gain.value = this.gainState;
		ambientElement2.play();
		ambientElement2.loop = true;
	}

	AudioLib.prototype.refresh = function(newState){
		this.gainState = newState;
		this.ambientGain1.gain.value = 1 - this.gainState;
		this.ambientGain2.gain.value = this.gainState;
	}

	AudioLib.prototype.nextBackground = function(mediaElement, state){
		this.gainState = state;
		// swap the nodes and load a new one into ambient2
		this.ambientElement1.stop();
		this.ambientNode1.disconnect();
		this.ambientGain1.disconnect();
		this.ambientElement1 = this.ambientElement2;
		this.ambientNode1 = this.ambientNode2;
		this.ambientGain1 = this.ambientGain2;
		this.ambientGain1.gain.value = 1 - this.gainState;

		this.ambientElement2 = mediaElement;
		this.ambientNode2 = this.context.createMediaElementSource(this.ambientElement2);
		this.ambientGain2 = this.context.createGain();
		this.ambientNode2.connect(this.ambientGain2);
		this.ambientGain2.connect(this.context.destination);
		this.ambientGain2.gain.value = this.gainState;
		ambientElement2.play();
		ambientElement2.loop = true;
	}


	window.AudioLib = AudioLib;
})();