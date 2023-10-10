let fab;
let xPos, yPos, zPos = null;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  fab = createFab();

  let connectButton = createButton('connect!');
  connectButton.position(20, 20);
  connectButton.mousePressed(function () {
    fab.serial.requestPort(); // choose the serial port to connect to
  });

  let printButton = createButton('stream!');
  printButton.position(20, 60);
  printButton.mousePressed(function () {
    midiStream(); // start streaming the commands to printer
  });

  let stopButton = createButton('stop!');
  stopButton.position(20, 100);
  stopButton.mousePressed(function () {
    fab.stopPrint(); // stop streaming the commands to printer
  });


  // midi control
  if (navigator.requestMIDIAccess) console.log('This browser supports WebMIDI!')
  else console.log('WebMIDI is not supported in this browser.')

  navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);

}

function fabDraw() {
  // no fabdraw for now
  // maybe have an 'interactive mode' option?
}

function draw() {
  orbitControl(2, 2, 0.1);
  background(255);
  fab.render();
}

function onMIDISuccess(midiAccess) {
  const midi = midiAccess
  const inputs = midi.inputs.values()
  const input = inputs.next()
  console.log(input)
  input.value.onmidimessage = onMIDIMessage
}

function onMIDIFailure(e) {
  console.log('Could not access your MIDI devices: ', e)
}

function onMIDIMessage(message) {
  const data = message.data // [command/channel, note, velocity]
  console.log('data', data)

  const cmd = data[0] >> 4
  channel = data[0] & 0xf
  type = data[0] & 0xf0
  note = data[1]
  velocity = data[2]

  if (note == 19) { // z axis
    zPos = map(velocity, 0, 127, 0, fab.maxZ); // midi values or 0-127
  }

  if (note == 23) { // x axis
    xPos = map(velocity, 0, 127, 0, fab.maxX); // midi values or 0-127
  }

  if (note == 27) { // y axis
    yPos = map(velocity, 0, 127, 0, fab.maxY); // midi values or 0-127
  }

  if (note == 1 && type == 144) { // 144 is noteOn (i.e. press), 127 is noteOff (i.e. release); 
    fab.autoHome();
    fab.print();
  }
}

function midiStream() {
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

  setTimeout(midiStream, 100); // send commands every 100 ms, can play with this value
}