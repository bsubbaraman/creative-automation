
let _midiController

p5.prototype.midiMode = function () {
  _midiController = new MidiController();
  return _midiController;
};

class MidiController {
  constructor() {
    if (navigator.requestMIDIAccess) console.log('This browser supports WebMIDI!');
    else console.log('WebMIDI is not supported in this browser.');

    navigator.requestMIDIAccess()
      .then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));

    //
    this.midiMapping = {}; // map note values here
    this.streamingTimout = null;
    this.isStreaming = false;
    this.speed = null;
    this.extrusionMultiplier = null;
    this.waveAmp = null;
  }

  onMIDISuccess(midiAccess) {
    const midi = midiAccess
    const inputs = midi.inputs.values()
    const input = inputs.next()
    input.value.onmidimessage = this.onMIDIMessage
  }

  onMIDIFailure(e) {
    console.log('Could not access your MIDI devices: ', e)
  }

  onMIDIMessage(message) {
    const data = message.data // [command/channel, note, velocity]

    const cmd = data[0] >> 4
    let channel = data[0] & 0xf
    let type = data[0] & 0xf0
    let note = data[1]
    let velocity = data[2]

    if (note == 19) { // z axis
      zPos = map(velocity, 0, 127, 0, fab.maxZ); // midi values or 0-127
    }

    if (note == 23) { // x axis
      xPos = map(velocity, 0, 127, 0, fab.maxX); // midi values or 0-127
    }

    if (note == 27) { // y axis
      console.log("y midi value", velocity);
      yPos = map(velocity, 0, 127, 0, fab.maxY); // midi values or 0-127
      
    }

    if (note == 1 && type == 144) { // 144 is noteOn (i.e. press), 127 is noteOff (i.e. release); 
      // add back in for interactive/streaming mode
      // fab.autoHome();
      fab.print();
    }

    if (note == 25 && type == 144) { // BANK LEFT button
      let closeConnection = _midiController.isStreaming ? true : false;
      console.log(closeConnection)
      _midiController.midiStream(closeConnection);
    }

    if (note == 16) { // top left knobw, using as a test to modify speed
      _midiController.speed = map(velocity, 0, 127, 600, 3000).toFixed(2); // values in mm/min
      // console.log('midi value:', this.speed);
    }

    if (note == 20) { // 1st row 2nd knob, for extrusion
      _midiController.extrusionMultiplier = map(velocity, 0, 127, 0.5, 5).toFixed(2);
      // console.log('midi value:', this.speed);
    }

    if (note == 24) { // third knob, wave amplitude
      _midiController.waveAmp = map(velocity, 0, 127, 0, 8).toFixed(2);
    }
  }

  midiStream(closeConnection) {
    if (closeConnection) {
      console.log('Stopping midi stream');
      clearTimeout(this.streamingTimout);
      _midiController.isStreaming = false;
    } else {
      let newCommand = 'G0';
      if (xPos != undefined) {
        newCommand += ` X${xPos}`
      }
  
      if (yPos !== undefined) {
        newCommand += ` Y${yPos}`
      }
  
      if (zPos !== undefined) {
        newCommand += ` Z${zPos}`
      }
  
      if (newCommand !== 'G0') {
        fab.add(newCommand)
        console.log(newCommand);
      }
  
      if (!fab.isPrinting) {
        fab.print();
      }

      this.streamingTimout = setTimeout(function(){_midiController.midiStream();}, 100); // send commands every 100 ms
      this.isStreaming = true;
    }
  }
}