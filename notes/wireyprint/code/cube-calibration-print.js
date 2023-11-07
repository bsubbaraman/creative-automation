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
    fab.print(); // start streaming the commands to printer
  });

  let stopButton = createButton('stop!');
  stopButton.position(20, 100);
  stopButton.mousePressed(function () {
    fab.stopPrint(); // stop streaming the commands to printer
  });

}

function fabDraw() {
  // setup!
  fab.setAbsolutePosition(); // set all axes (x.y/z/extruder) to absolute
  fab.setERelative(); // put extruder in relative mode, independent of other axes
  fab.autoHome();
  // fab.setTemps(205, 60); // (nozzle, bed) °C - you should use a temperature best suited for your filament!

  fab.introLine(0.2); // draw to lines on the left side of the print bed

  // variables for our hollow cube!
  let sideLength = 20; //mm
  let x = fab.centerX - sideLength / 2;
  let y = fab.centerY - sideLength / 2;
  let speed = 10; // mm/sec
  let layerHeight = 0.2; // mm

  // design our hollow cube!
  fab.moveRetract(x, y, layerHeight); // move to the start (x,y,z) position without extruding

  for (let z = layerHeight; z <= sideLength; z += 4*layerHeight) {
    if (z == layerHeight) { // if it's the first layer
      speed = 10; // slow print speeed down for the first layer
    } else {
      speed = 10;
    }
    fab.moveExtrude(x + sideLength, y, z, speed, 2, true); // move along the bottom side while extruding filament
    fab.moveExtrude(x + sideLength, y + sideLength, z, speed, 3, true); // right side
    fab.moveExtrude(x, y + sideLength, z, speed, 4, true); // top side
    fab.moveExtrude(x, y, z, speed/2, 4, true); //left side
  }

  fab.presentPart();
  fab.presentPart();
}

function draw() {
  orbitControl(2, 2, 0.1);
  background(255);
  fab.render();
}

function loopy(startPos, endPos, amplitude, speed, extrusion) {
  for (let x = startPos; x <= endPos; x++){
    let t = map(x, startPos, endPos, 0, PI);
    let z = amplitude * sin(t);
    fab.moveExtrude(x, 100, z, speed);
  }
}