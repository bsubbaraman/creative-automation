let fab;
let xPos, yPos, zPos = null;
let theta = 0;
let radius = 25;

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
  let increment = PI / 100
  fab.moveRetract(radius * cos(0) + fab.centerX, radius * sin(0) + fab.centerY, 0, 150); // move to start
  let x = 0;
  let y = 0;
  let z = 0;
  let height = 50
  let zOverall = 0;
  let theta = 0;

  let layerCount = 0;
  let layerIncrement = -1;
  let idx = 0;
  let segmentLengths = [50, 40, 25, 20, 10, 8, 5, 4]

  // print a couple of layers for stability
  let radiusTheta = map(zOverall, 0, height, 0, TWO_PI);
  let shapeAmplitude = 2;
  for (zOverall = 0; zOverall <= 1; zOverall += 0.2) {
    for (let t = 0; t <= TWO_PI; t += increment) {
      radius = 25 + shapeAmplitude*sin(radiusTheta);
      x = radius * cos(t) + fab.centerX;
      y = radius * sin(t) + fab.centerY;
      fab.moveExtrude(x, y, zOverall, 10);
    }
  }

  while (zOverall < height) {
    let radiusTheta = map(zOverall, 0, height, 0, TWO_PI);
    radius = 25 + shapeAmplitude*sin(radiusTheta); 
    let s = zOverall < 0.5 ? 10 : 10;
    let segmentLength = segmentLengths[layerCount];
    theta = twoForwardOneBack(zOverall, s, increment, segmentLength);
    idx += 1;

    if (idx % (200 / segmentLength) == 0) {
      idx = 0;
      
      if (layerCount == 0 || layerCount == segmentLengths.length - 1) {
        layerIncrement *= -1;
      }
      layerCount = layerCount + layerIncrement;
      zOverall += map(layerCount, 0, segmentLengths.length - 1, 0.8, 1.5); // .8, 1.5

    }
  }



  fab.presentPart();

  // // calibration line, testing sine wave parameters
  // fab.moveRetract(50, 100, 0.2);
  // fab.moveExtrude(60, 100, 0.2);

  // loopy(60, 65, 10, 0.5, null);
  // fab.moveExtrude(80, 100, 0.2)
  // loopy(80, 85, 8, 0.5, null);
  // fab.moveExtrude(100, 100, 0.2)
  // loopy(100, 105, 5, 0.5, null);
  // fab.moveExtrude(120, 100, 0.2)
  // loopy(120, 125, 3, 1, null);
  // fab.moveExtrude(140, 100, 0.2)
  // loopy(140, 160, 20, 0.5, null);
  // fab.moveExtrude(180, 100, 0.2)

  fab.presentPart();
}

function draw() {
  orbitControl(2, 2, 0.1);
  background(255);
  fab.render();
}


function twoForwardOneBack(zOverall, s, increment, segmentLength) {
  for (let i = 0; i < segmentLength; i++) {
    z = zOverall + 0.8;
    x = radius * cos(theta) + fab.centerX;
    y = radius * sin(theta) + fab.centerY;
    fab.moveExtrude(x, y, z, s);
    theta += increment;
  }

  for (let i = 0; i < segmentLength; i++) {
    z = zOverall;
    x = radius * cos(theta) + fab.centerX;
    y = radius * sin(theta) + fab.centerY;
    fab.moveExtrude(x, y, z, s);
    theta += increment;
  }

  for (let i = 0; i < segmentLength; i++) {
    z = zOverall + 0.4;
    x = radius * cos(theta) + fab.centerX;
    y = radius * sin(theta) + fab.centerY;
    fab.moveExtrude(x, y, z, s);
    theta -= increment;
  }

  return theta
}

function loopy(startPos, endPos, amplitude, speed, extrusion) {
  for (let x = startPos; x <= endPos; x++) {
    let t = map(x, startPos, endPos, 0, PI);
    let z = amplitude * sin(t);
    fab.moveExtrude(x, 100, z, speed);
  }
}