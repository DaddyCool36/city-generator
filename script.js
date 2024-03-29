/** default constants :
 * centerX : the X center of the client window
 * centerY : the Y center of the client window
 */
const DEFAULT = {
  centerX: window.innerWidth / 2,
  centerY: window.innerHeight / 2
};

let self = this;

/** Return a random value between value1 and value2.
 * There is no ordering value of value1 and value2, the absolute value will be taken.
 * @parameter value1 : number
 * @parameter value2 : number
 * @return numeric: a random value between value1 and value2.
 */
function randomizeBetween(value1, value2) {
  return Math.abs(value2 - value1) * Math.random() + value1;
}

/** default configuration, editable.
* numberOfTowers : The number of tower to display, distributed on all layers (canvas)
* amplitudeXMax : The maximum left/right amplitude the last layer (the most on-top) can be translated
* amplitudeYMax : The maximum up/down amplitude the last layer (the most on-top) can be translated
* nbLayers : The number of layers (canvas) of towers to display. Beware : a layer of Fog will be
        inserted between each layer of tower
*/
var editableConfig = {
  numberOfTowers: 40,
  amplitudeXMax: 200,
  amplitudeYMax: 130,
  nbLayers: 6,
  windowChangeInterval: 1000
};

/* a Layer is a canvas to draw something on it.
 * This "something" can be towers, fog, stuff, silhouettes, etc ...
 * It has a context on which the "something" will be drawn.
 */
class Layer {
  /** Constructor of the Layer.
   * @parameter id : string or number, the unique id of the layer to display, this id
   * will be inserted in the #id attribute of the canvas tag.
   */
  constructor(id) {
    this.id = id;
  }

  /** generate a new canvas in the DOM.
   * This canvas will be inserted in the div#main (appendChild).
   * By default, it will be 300px wide and 300px high.
   * Then, the canvas will fit the screen size of the window.
   * @return : the inner DOM canvas just generated.
   */
  generateCanvas() {
    let canvasModel = document.createElement("canvas");
    let mainDiv = document.querySelector("div#main");
    mainDiv.appendChild(canvasModel);
    canvasModel.setAttribute("id", this.id);
    // default values
    canvasModel.setAttribute("width", "300px");
    canvasModel.setAttribute("height", "300px");

    this.setCanvasFitScreen();
    return document.querySelector("canvas#" + this.id);
  }

  /** Get the canvas of the layer. It generates it if it doesn't exist.
   * @return The cinner DOM canvas of the layer.
   */
  getCanvas() {
    let canvas = document.querySelector("canvas#" + this.id);
    if (canvas == null) {
      canvas = this.generateCanvas();
    }
    return canvas;
  }

  /** Get the 2D context of the canvas of the layer
   * @return the context 2D of the canvas.
   */
  getContext() {
    return this.getCanvas().getContext("2d");
  }

  /** Force the dimensions of the canvas to fit window dimensions
   * The canvas is centered in the window, according to the amplitudeXMax and amplitudeYMax of the config.
   */
  setCanvasFitScreen() {
    let myCanvas = this.getContext().canvas;
    myCanvas.width = window.innerWidth + editableConfig.amplitudeXMax;
    myCanvas.height = window.innerHeight + editableConfig.amplitudeYMax;
    myCanvas.style.left = -editableConfig.amplitudeXMax / 2 + "px";
    myCanvas.style.top = -editableConfig.amplitudeYMax / 2 + "px";
  }

  /** Clear the entire canvas
   */
  clearCanvas() {
    let myContext = this.getContext();
    myContext.clearRect(0, 0, myContext.canvas.width, myContext.canvas.height);
  }

  /** Translate the canvas to the new position.
   * @parameter newX (integer): the new X position (in pixels) of the Layer.
   * @parameter newY (integer): the new Y position (in pixels) of the Layer.
   */
  translateCanvas(newX, newY) {
    let myCanvas = this.getContext().canvas;
    myCanvas.style.left = newX + "px";
    myCanvas.style.top = newY + "px";
  }
}

/**
 * A tower is a city building. It needs a canvas context to be drawn.
 * It is randomly generated (dimensions, colors, position).
 * It has randomly generated windows.
 */
class Tower {
  /** Constructor of Tower. The layer parameter will be used to draw the tower.
   * By default the Tower will be randomly rendered with this values :
   * - width : between 50 and 200
   * - Height : between 25% and 90% of the canvas height.
   * - x position: all along the width of the canvas
   * - color of the Tower : a very dark color
   * The y position will be static : the bottom of the Tower is at the bottom of the canvas
   * The windows are initialized too.
   * @parameter layer: The Layer Object on which the Tower will be drawn.
   */
  constructor(layer) {
    this.layer = layer;
    this.ctx = layer.getContext();

    let margin = editableConfig.amplitudeXMax;

    let minWidth = 50;
    let maxWidth = 200;
    let minHeight = this.ctx.canvas.height * 0.25;
    let maxHeight = this.ctx.canvas.height * 0.9;

    this.width = Math.floor(randomizeBetween(minWidth, maxWidth));
    this.height = Math.floor(randomizeBetween(minHeight, maxHeight));

    this.x = Math.floor(
      randomizeBetween(-margin, this.ctx.canvas.width + margin - this.width)
    );
    this.y = this.ctx.canvas.height;

    this.hue = Math.floor(randomizeBetween(0, 360));
    this.fill = "hsl(" + this.hue + "deg, 10%, 5%)";

    this.initWindows();
  }

  /** init the windows of the tower.
   * By default the Windows will be randomly rendered with this values :
   * - number of windows on X-axis : between 2 and
   */
  initWindows() {
    this.tabWindows = [];
    this.windowsFillOn = "hsl(" + this.hue + "deg, 100%, 90%)";
    this.windowsFillOff = "hsl(" + this.hue + "deg, 30%, 10%)";

    this.marginLeftRight = Math.floor(randomizeBetween(2, 10));
    this.marginTop = Math.floor(randomizeBetween(2, 50));
    this.marginBottom = Math.floor(randomizeBetween(2, 5));

    this.windowWidth = Math.floor(randomizeBetween(3, 20));
    this.windowHeight = Math.floor(randomizeBetween(3, 20));

    this.nbWindowsX = this.calcNbWindowsX();
    this.nbWindowsY = this.calcNbWindowsY();

    // default value : all windows are switched on
    for (let ix = 0; ix < this.nbWindowsX; ix++) {
      this.tabWindows[Number(ix)] = [];
      for (let jy = 0; jy < this.nbWindowsY; jy++) {
        let windowsSwitch = Math.round(randomizeBetween(0, 1));

        this.tabWindows[Number(ix)][Number(jy)] = windowsSwitch === 0;
      }
    }
  }

  /** calculate the number of windows to display on X-axis. This number is a
   * random number between 2 and the maximum number of windows to fill the width
   * of the Tower without superposition.
   * @return integer a randomly generated number of windows.
   */
  calcNbWindowsX() {
    let nbWindowsXMax = Math.floor(
      (this.width - 2 * this.marginLeftRight) / this.windowWidth
    );
    let nbWindowsXMin = Math.floor(nbWindowsXMax / 2);
    if (nbWindowsXMin < 2) {
      nbWindowsXMin = 2;
    }

    return Math.round(randomizeBetween(nbWindowsXMin, nbWindowsXMax));
  }

  /** calculate the number of windows to display on Y-axis. This number is a
   * random number between 2 and the maximum number of windows to fill the height
   * of the Tower without superposition.
   * @return integer a randomly generated number of windows.
   */
  calcNbWindowsY() {
    let nbWindowsYMax = Math.floor(
      (this.height - this.marginTop - this.marginBottom) / this.windowHeight
    );
    let nbWindowsYMin = Math.floor(nbWindowsYMax / 2);
    if (nbWindowsYMin < 2) {
      nbWindowsYMin = 2;
    }

    return Math.floor(randomizeBetween(nbWindowsYMin, nbWindowsYMax));
  }

  /** draw the Tower in the context set by the constructor.
   */
  draw() {
    this.ctx.fillStyle = this.fill;
    this.ctx.fillRect(this.x, this.y, this.width, -this.height);
  }

  /** Draw the windows of the Tower. The windows are distributed by their number
   * Of Towers to fill the width and height of the Tower.
   */
  drawWindows() {
    this.ctx.fillStyle = this.windowsFillOn;

    let interX =
      (this.width -
        2 * this.marginLeftRight -
        this.windowWidth * this.tabWindows.length) /
      (this.tabWindows.length - 1);
    let interY =
      (this.height -
        (this.marginTop + this.marginBottom) -
        this.windowHeight * this.tabWindows[0].length) /
      (this.tabWindows[0].length - 1);

    for (let ix = 0, lengthX = this.tabWindows.length; ix < lengthX; ix++) {
      for (
        let jy = 0, lengthY = this.tabWindows[Number(ix)].length;
        jy < lengthY;
        jy++
      ) {
        this.ctx.fillStyle = this.windowsFillOn;

        if (!this.tabWindows[Number(ix)][Number(jy)]) {
          this.ctx.fillStyle = this.windowsFillOff;
        }

        let xWin =
          this.x + this.marginLeftRight + ix * (this.windowWidth + interX);

        let yWin =
          this.y - this.marginBottom - jy * (this.windowHeight + interY);

        this.ctx.fillRect(xWin, yWin, this.windowWidth, -this.windowHeight);
      }
    }
  }
}

/** A Fog is linear gradient to simulate a layer of pollution, city lights, and
 * depth of field of the differents Towers in the background.
 */
class Fog {
  /** initiate the Fog on the layer.
   * The differents altitudes of the Fog are randomly distributed.
   * @parameter layer : The layer to draw the Fog on.
   */
  constructor(layer) {
    this.ctx = layer.getContext();

    let hue = 0;
    let altitude0 = randomizeBetween(0.4, 0.6).toFixed(4);
    let altitude1 = randomizeBetween(0.75, 0.9).toFixed(4);
    let altitude2 = randomizeBetween(0.9, 0.97).toFixed(4);

    this.gradient = this.ctx.createLinearGradient(
      0,
      0,
      0,
      this.ctx.canvas.height
    );
    this.gradient.addColorStop(0, "hsla(" + hue + "deg, 0%, 20%, 0)");
    this.gradient.addColorStop(
      altitude0,
      "hsla(" + hue + "deg, 100%, 100%, 0)"
    );
    this.gradient.addColorStop(
      altitude1,
      "hsla(" + hue + "deg, 100%, 100%, 0.02)"
    );
    this.gradient.addColorStop(
      altitude2,
      "hsla(" + hue + "deg, 100%, 100%, 0.1)"
    );
    this.gradient.addColorStop(1, "hsla(" + hue + "deg, 100%, 100%, 0.3)");
  }

  /** draw the Fog in the context set by the constructor.
   */
  draw() {
    this.ctx.fillStyle = this.gradient;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
}

/** the Pencil will draw all the elements (Towers, Fog, ...) on all the layers.
 */
class Pencil {
  /** Constructor of the Pencil.
   * It initiate arrays of Towers, Fogs and Layers.
   */
  constructor() {
    this.tabTower = [];
    this.tabFog = [];
    this.tabLayer = [];
  }

  /** Init all the elements and the layers. The elements will be drawn on the Layers.
   * @parameter nbTowers : integer (Default 10): The number of Towers to create.
   */
  init(nbTowers = 10) {
    this.deleteAllCanvas();
    this.tabTower = [];
    this.tabFog = [];
    this.tabLayer = [];

    nbTowers = Math.floor(nbTowers);

    this.initLayers(editableConfig.nbLayers);
    //this.initFog();

    this.initAndDistribTowersOnLayers(nbTowers, editableConfig.nbLayers);

    // the layer of silhouettes
    let nbLayers = this.tabLayer.length;
    this.tabLayer[Number(nbLayers)] = new Layer("layer" + nbLayers);
    this.tabLayer[Number(nbLayers)].clearCanvas();
  }

  /** Init and clean all the layers
   */
  initLayers(nbLayersOfTowers) {
    for (var i = 0; i < nbLayersOfTowers * 2; i++) {
      this.tabLayer[Number(i)] = new Layer("layer" + i);
      this.tabLayer[Number(i)].clearCanvas();
    }
  }

  initFog() {
    let nbLayersOfFog = this.tabLayer.length / 2;
    for (let i = 0; i < nbLayersOfFog; i++) {
      this.tabFog[Number(i)] = new Fog(this.tabLayer[Number(i * 2 + 1)]);
    }
  }

  // Init the towers distributed on the layers
  initAndDistribTowersOnLayers(nbTowers, nbLayers) {
    var currentLayerLevel = 0;
    var nbTowersByLayer = Math.floor(nbTowers / nbLayers);

    for (let i = 0; i < nbTowers; i++) {
      if (i > nbTowersByLayer * (1 + currentLayerLevel)) {
        currentLayerLevel++;
        if (currentLayerLevel > nbLayers - 1) {
          currentLayerLevel = nbLayers - 1;
        }
      }
      this.tabTower[Number(i)] = new Tower(
        this.tabLayer[Number(currentLayerLevel * 2)]
      );
    }
  }

  // delete all canvas
  deleteAllCanvas() {
    let listCanvasToDelete = document.querySelectorAll("canvas");
    let listLength = listCanvasToDelete.length;
    for (let i = 0; i < listLength; i++) {
      listCanvasToDelete[Number(i)].remove();
    }
  }

  // draw the layers
  draw(layerId = null) {
    for (let i = 0; i < this.tabTower.length; i++) {
      if (
        layerId === null ||
        (layerId !== null && this.tabTower[Number(i)].layer.id === layerId)
      ) {
        this.tabTower[Number(i)].draw();
        this.tabTower[Number(i)].drawWindows();
      }
    }
  }

  drawFog() {
    for (var i = 0; i < this.tabFog.length; i++) {
      this.tabFog[Number(i)].draw();
    }
  }

  drawSilhouettes() {}

  getRandomTower() {
    let randomTower = Math.round(randomizeBetween(0, this.tabTower.length - 1));
    let myTower = this.tabTower[Number(randomTower)];
    return myTower;
  }

  randomLightWindows(myTower) {
    let randomWindowX = Math.round(
      randomizeBetween(0, myTower.tabWindows.length - 1)
    );
    let myWindowsLine = myTower.tabWindows[Number(randomWindowX)];
    let randomWindowY = Math.round(
      randomizeBetween(0, myWindowsLine.length - 1)
    );

    let light =
      myTower.tabWindows[Number(randomWindowX)][Number(randomWindowY)];
    myTower.tabWindows[Number(randomWindowX)][Number(randomWindowY)] = !light;
  }
}

var pen = new Pencil();

function mouseOverMain(event) {
  if (event == null) {
    return;
  }
  let mouseX = event.clientX;
  let mouseY = event.clientY;

  let deltaX = mouseX - DEFAULT.centerX;
  let deltaY = mouseY - DEFAULT.centerY;

  var moveHighestX = (deltaX / DEFAULT.centerX) * editableConfig.amplitudeXMax;
  var moveHighestY = (deltaY / DEFAULT.centerY) * editableConfig.amplitudeYMax;
  for (let i = 0, tabLength = pen.tabLayer.length; i < tabLength; i++) {
    let moveX = Math.floor(moveHighestX / (tabLength - i + 1));
    let moveY = Math.floor(moveHighestY / (tabLength - i + 1));
    pen.tabLayer[Number(i)].translateCanvas(
      -moveX - editableConfig.amplitudeXMax / 2,
      -moveY - editableConfig.amplitudeYMax / 2
    );
  }
}

function animate() {
  let myTower = pen.getRandomTower();

  pen.randomLightWindows(myTower);
  let layerToRedraw = myTower.layer.id;
  pen.draw(layerToRedraw);

  //   myTower.drawWindows();

  //window.requestAnimationFrame(animate);
}

editableConfig.apply = function() {
  pen.init(editableConfig.numberOfTowers);
  pen.draw();
  // disabled temporarly because of graphical perf
  //pen.drawFog();
  setInterval(animate, editableConfig.windowChangeInterval);

  document
    .querySelector("div#main")
    .addEventListener("mousemove", mouseOverMain);
};

//const dat = require("dat.gui");
let gui = new dat.GUI();

gui
  .add(editableConfig, "numberOfTowers")
  .min(2)
  .max(100)
  .step(1);

gui
  .add(editableConfig, "nbLayers")
  .min(2)
  .max(10)
  .step(1);

gui
  .add(editableConfig, "amplitudeXMax")
  .min(0)
  .max(500)
  .step(10);

gui
  .add(editableConfig, "amplitudeYMax")
  .min(0)
  .max(500)
  .step(10);

gui
  .add(editableConfig, "windowChangeInterval")
  .min(1)
  .max(10000)
  .step(1);

gui.add(editableConfig, "apply");

editableConfig.apply();
