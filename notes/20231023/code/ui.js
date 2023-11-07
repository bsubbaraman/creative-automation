let margin = 10;
// let controllerWidth = windowWidth/2 - 2*margin;

function makeUI() {
  makeKnobs();
}

function makeKnobs() {
  rectMode(CENTER);
  fill(255,0,0)
  square(0,0,500);
  let knobCols = 8;
  let knobRows = 3;
  for (let i = windowWidth / 2 + margin; i <= windowWidth - margin; i += (windowWidth/2 - 2*margin)/knobCols) {
    push();
    translate(i, 50)
    square((windowWidth/2 - 2*margin)/knobCols);
    pop()
  }
}