const p5fab = (sketch) => {
  let margin = 0.9;

  sketch.setup = () => {
    var canvasDiv = document.getElementById('p5fab');
    var width = canvasDiv.offsetWidth;
    sketch.createCanvas(width, margin * sketch.windowHeight, sketch.WEBGL);

    fab = sketch.createFab();
    midiMode();

    let connectButton = createButton('connect!');
    connectButton.position(20, 20);
    connectButton.mousePressed(function () {
      fab.serial.requestPort(); // choose the serial port to connect to
    });

    let stopButton = createButton('stop!');
    stopButton.position(20, 100);
    stopButton.mousePressed(function () {
      fab.stopPrint(); // stop streaming the commands to printer
    });
  };

  sketch.fabDraw = () => {
      // setup!
      fab.setAbsolutePosition(); // set all axes (x.y/z/extruder) to absolute
      fab.setERelative(); // put extruder in relative mode, independent of other axes
      fab.autoHome();
      fab.setTemps(205, 70); // (nozzle, bed) °C - you should use a temperature best suited for your filament!
    
      // fab.introLine(0.2); // draw to lines on the left side of the print bed
    
      // variables for our hollow cube!
      let sideLength = 20; //mm
      let x = fab.maxX/2 - sideLength / 2;
      let y = fab.maxY/2 - sideLength / 2;
      let speed = 10; // mm/sec
      let layerHeight = 0.2; // mm
    
      // design our hollow cube!
      fab.moveRetract(x, y, layerHeight, 40, 16); // move to the start (x,y,z) position without extruding
    
      for (let z = 0.1; z <= sideLength; z += layerHeight) {
        if (z <= 5*layerHeight) { // if it's the first layer
          speed = 10; // slow print speeed down for the first layer
        } else {
          speed = 25;
        }
    
        // move in mm sections to test midi control
        for (let i = x; i <= x + sideLength; i++) {
          fab.moveExtrude(i, y, z, speed); // try subdividing the side length
        }
        for (let i = y; i <= y + sideLength; i++) {
          fab.moveExtrude(x+sideLength, i, z, speed); // try subdividing the side length
        }
        for (let i = x + sideLength; i >= x; i--) {
          fab.moveExtrude(i, y + sideLength, z, speed); // try subdividing the side length
        }
        for (let i = y + sideLength; i >= y ; i--) {
          fab.moveExtrude(x, i, z, speed); // try subdividing the side length
        }
        
        
        // fab.moveExtrude(x + sideLength, y, z, speed); // move along the bottom side while extruding filament
        // fab.moveExtrude(x + sideLength, y + sideLength, z, speed); // right side
        // fab.moveExtrude(x, y + sideLength, z, speed); // top side
        // fab.moveExtrude(x, y, z, speed); // left side
      }
    
      fab.presentPart();
      console.log('about to render...')
  }

  sketch.draw = () => {
    orbitControl(2, 2, 0.1);
    sketch.background(255);
    fab.render();
  };
};

const midiui = (sketch) => {
  let margin = 0.9;

  sketch.setup = () => {
    var canvasDiv = document.getElementById('midiui');
    var width = canvasDiv.offsetWidth;
    sketch.createCanvas(width, margin * sketch.windowHeight);
  };

  sketch.draw = () => {
    sketch.background(0);
    sketch.fill(255, 0, 0);
    // sketch.rect(x,y,50,50);
  };
};



let myp5 = new p5(p5fab, "p5fab");
let myp52 = new p5(midiui, "midiui");
