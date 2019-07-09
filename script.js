// shorcut for random values between 2 numbers.
function randomizeBetween(value1, value2) {
  return Math.abs(value2 - value1) * Math.random() + value1;
}

// a Layer is a canvas to draw something on it.
class Layer {

  // The parameter is the HTML attribute "id" for the canvas.
  constructor(id) {
    this.id = id;
    //this.backgroundColor = backgroundColor;
  }

  // force to add a new canvas tag in the body
  generateCanvas() {
    let canvasModel = document.createElement("canvas");
    document.body.appendChild(canvasModel);
    canvasModel.setAttribute("id", this.id);
    // default values
    canvasModel.setAttribute("width", "300px");
    canvasModel.setAttribute("height", "300px");
    //canvasModel.style.backgroundColor = this.backgroundColor;

    this.setCanvasFitScreen();
    return document.querySelector("canvas#" + this.id);
  }

  // get the actual canvas. It generates it if it doesn't exist.
  getCanvas() {
    let canvas = document.querySelector("canvas#" + this.id);
    if (canvas == null) {
      canvas = this.generateCanvas();
    }
    return canvas;
  }

  // Get the 2D context of the actual canvas
  getContext() {
    return this.getCanvas().getContext("2d");
  }

  // Force the canvas to resize it to fit screen dimensions (window)
  setCanvasFitScreen() {
    this.getContext().canvas.width = window.innerWidth;
    this.getContext().canvas.height = window.innerHeight;
  }

  // I don't know if this will be useful or not to animate.
  clearCanvas() {
    this.getContext().clearRect(
      0,
      0,
      this.getContext().canvas.width,
      this.getContext().canvas.height);
  }
}

// A tower is a rectangle-shape-building with windows.
class Tower {

  // create a Tower
  constructor(layer) {
    this.ctx = layer.getContext();

    let margin = -20;

    let minWidth = 50;
    let maxWidth = 200;
    let minHeight = this.ctx.canvas.height / 4;
    let maxHeight = this.ctx.canvas.height * 0.9;

    this.width = randomizeBetween(minWidth, maxWidth);
    this.height = randomizeBetween(minHeight, maxHeight);

    this.x = randomizeBetween(
      margin,
      this.ctx.canvas.width - margin - this.width
    );
    this.y = this.ctx.canvas.height;

    this.hue = randomizeBetween(0, 360);
    this.fill = "hsl(" + this.hue + "deg, 40%, 20%)";

    this.initWindows();
  }

  // init the windows of the tower
  initWindows() {
    this.tabWindows = [];
    this.windowsFill = "hsl(" + this.hue + "deg, 100%, 80%)";
    this.marginLeftRight = randomizeBetween(2, 10);
    this.marginTop = randomizeBetween(2, 50);
    this.marginBottom = randomizeBetween(2, 5);

    this.windowWidth = randomizeBetween(3, 20);
    this.windowHeight = randomizeBetween(3, 20);

    this.nbWindowsX = this.calcNbWindowsX();
    this.nbWindowsY = this.calcNbWindowsY();

    // default value : all windows are switched on
    for (let ix = 0 ; ix < this.nbWindowsX ; ix ++) {
      this.tabWindows[ix] = [];
      for (let jy = 0 ; jy < this.nbWindowsY ; jy ++) {
        this.tabWindows[ix][jy] = true;
      }
    }

  }

  // calculate the number of windows to display on X-axis
  calcNbWindowsX( ) {
    let nbWindowsXMin = 2;
    let nbWindowsXMax = Math.floor((this.width - (2 * this.marginLeftRight)) / this.windowWidth);

    return Math.floor(randomizeBetween(nbWindowsXMin, nbWindowsXMax));
  }

  // calculate the number of windows to display on Y-axis
  calcNbWindowsY() {
    let nbWindowsYMin = 2;
    let nbWindowsYMax = Math.floor((this.height - this.marginTop - this.marginBottom) / this.windowHeight);

    return Math.floor(randomizeBetween(nbWindowsYMin, nbWindowsYMax));
  }

  // draw the Tower in the context set by the constructor.
  draw() {
    this.ctx.fillStyle = this.fill;
    this.ctx.fillRect(this.x, this.y, this.width, -this.height);
  }

  drawWindows() {
    this.ctx.fillStyle = this.windowsFill;

    let interX = (this.width - (2 * this.marginLeftRight) - (this.windowWidth * this.tabWindows.length)) / (this.tabWindows.length - 1);
    let interY = (this.height - (this.marginTop + this.marginBottom) - (this.windowHeight * this.tabWindows[0].length)) / (this.tabWindows[0].length - 1);

    for (let ix = 0 ; ix < this.tabWindows.length ; ix ++) {

      for (let jy = 0 ; jy < this.tabWindows[ix].length ; jy ++) {
        if (!this.tabWindows[ix][jy]) {
          continue;
        }

        let xWin = this.x + this.marginLeftRight + (ix * (this.windowWidth + interX));

        let yWin = this.y - this.marginBottom - (jy * (this.windowHeight + interY));

        this.ctx.fillRect(xWin, yWin, this.windowWidth, -this.windowHeight);
      }
    }
  }
}

// the Pencil will draw all the towers in all the layers.
class Pencil {

  //
  constructor() {
    this.tabTower = [];
    this.tabLayer = [];
  }

  // init the number of the towers
  init(nbTower = 10) {

    this.deleteAllCanvas();

    let nbLayers = Math.floor(randomizeBetween(2, 6));

    for (let i = 0 ; i < nbLayers ; i ++) {
      this.tabLayer[i] = new Layer("layer" + i);
      this.tabLayer[i].clearCanvas();
    }

    var myLayerLevel = 0;
    var nbTowersByLayer = nbTower / nbLayers;
    for (let i = 0; i < nbTower; i++) {

      if (i > (nbTowersByLayer * (1 + myLayerLevel))) {
        myLayerLevel++;
      }

      this.tabTower[i] = new Tower(this.tabLayer[myLayerLevel]);
    }
  }

  // delete all canvas
  deleteAllCanvas() {
    let listCanvasToDelete = document.querySelectorAll("canvas");
    for (let i = 0 ; i < listCanvasToDelete.length ; i++) {
      listCanvasToDelete[i].remove();
    }
  }

  // draw the towers on the layers
  draw() {
    //var ctx = this.layer1.getContext();

    for (let i = 0; i < this.tabTower.length; i++) {
      this.tabTower[i].draw();
      this.tabTower[i].drawWindows();
    }
  }
}

var config = {
  numberOfTowers : 20,
};



var gui = new dat.GUI();
//gui.remember(config);
gui.add(config, "number_of_towers").min(1).max(100);
gui.add(this, "redraw");

function redraw() {
  let pen = new Pencil();
  pen.init(config.number_of_towers);
  pen.draw();
}

redraw();
