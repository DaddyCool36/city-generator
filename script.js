/** default constants */
const DEFAULT = {
   centerX : window.innerWidth / 2,
   centerY : window.innerHeight / 2,
};

/* Return a random value between value1 and value2 */
function randomizeBetween(value1, value2) {
   return Math.abs(value2 - value1) * Math.random() + value1;
}

/** default configuration, editable. */
var editableConfig = {
   numberOfTowers : 40,
   amplitudeXMax : 200,
   amplitudeYMax : 130,
   nbLayers : 6,
};

/* a Layer is a canvas to draw something on it. */
class Layer {

   // The parameter is the HTML attribute "id" for the canvas.
   constructor(id) {
      this.id = id;
   }

   // force to add a new canvas tag in the body
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
      let myCanvas = this.getContext().canvas;
      myCanvas.width = window.innerWidth + editableConfig.amplitudeXMax;
      myCanvas.height = window.innerHeight + editableConfig.amplitudeYMax;
      myCanvas.style.left = (-editableConfig.amplitudeXMax / 2) + "px";
      myCanvas.style.top = (-editableConfig.amplitudeYMax / 2) + "px";
   }

   // Clear the canvas
   clearCanvas() {
      let myContext = this.getContext();
      myContext.clearRect(
         0,
         0,
         myContext.canvas.width,
         myContext.canvas.height);
      }

   // Move the canvas to the new position
   translateCanvas(newX, newY) {
      let myCanvas = this.getContext().canvas;
      myCanvas.style.left = newX + "px";
      myCanvas.style.top = newY + "px";
   }
}

// A tower is a rectangle-shape-building with windows.
class Tower {

   // create a Tower
   constructor(layer) {
      this.layer = layer;
      this.ctx = layer.getContext();

      let margin = editableConfig.amplitudeXMax;

      let minWidth = 50;
      let maxWidth = 200;
      let minHeight = this.ctx.canvas.height / 4;
      let maxHeight = this.ctx.canvas.height * 0.9;

      this.width = randomizeBetween(minWidth, maxWidth);
      this.height = randomizeBetween(minHeight, maxHeight);

      this.x = randomizeBetween(
         -margin,
         this.ctx.canvas.width + margin - this.width
      );
      this.y = this.ctx.canvas.height;

      this.hue = randomizeBetween(0, 360);
      this.fill = "hsl(" + this.hue + "deg, 10%, 5%)";

      this.initWindows();
   }

   // init the windows of the tower
   initWindows() {
      this.tabWindows = [];
      this.windowsFillOn = "hsl(" + this.hue + "deg, 100%, 90%)";
      this.windowsFillOff = "hsl(" + this.hue + "deg, 30%, 10%)";

      this.marginLeftRight = randomizeBetween(2, 10);
      this.marginTop = randomizeBetween(2, 50);
      this.marginBottom = randomizeBetween(2, 5);

      this.windowWidth = randomizeBetween(3, 20);
      this.windowHeight = randomizeBetween(3, 20);

      this.nbWindowsX = this.calcNbWindowsX();
      this.nbWindowsY = this.calcNbWindowsY();

      // default value : all windows are switched on
      for (let ix = 0 ; ix < this.nbWindowsX ; ix ++) {
         this.tabWindows[Number(ix)] = [];
         for (let jy = 0 ; jy < this.nbWindowsY ; jy ++) {
            let windowsSwitch = Math.round(randomizeBetween(0, 1));

            this.tabWindows[Number(ix)][Number(jy)] = (windowsSwitch === 0);
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
      this.ctx.fillStyle = this.windowsFillOn;

      let interX = (this.width - (2 * this.marginLeftRight) - (this.windowWidth * this.tabWindows.length)) / (this.tabWindows.length - 1);
      let interY = (this.height - (this.marginTop + this.marginBottom) - (this.windowHeight * this.tabWindows[0].length)) / (this.tabWindows[0].length - 1);

      for (let ix = 0, lengthX = this.tabWindows.length ; ix < lengthX ; ix ++) {

         for (let jy = 0, lengthY = this.tabWindows[Number(ix)].length ; jy < lengthY ; jy ++) {

            this.ctx.fillStyle = this.windowsFillOn;

            if (!this.tabWindows[Number(ix)][Number(jy)]) {
               this.ctx.fillStyle = this.windowsFillOff;
            }

            let xWin = this.x + this.marginLeftRight + (ix * (this.windowWidth + interX));

            let yWin = this.y - this.marginBottom - (jy * (this.windowHeight + interY));

            this.ctx.fillRect(xWin, yWin, this.windowWidth, -this.windowHeight);
         }
      }
   }
}

class Fog {

   // initiate the Fog on the layer
   constructor(layer) {
      this.ctx = layer.getContext();

      let hue = 0;
      let altitude0 = randomizeBetween(0.4, 0.6);
      let altitude1 = randomizeBetween(0.75, 0.9);
      let altitude2 = randomizeBetween(0.9, 0.97);

      this.gradient = this.ctx.createLinearGradient(
            0,
            0,
            0,
            this.ctx.canvas.height);
      this.gradient.addColorStop(0,          "hsla(" + hue + "deg, 0%, 20%, 0)");
      this.gradient.addColorStop(altitude0,  "hsla(" + hue + "deg, 100%, 100%, 0)");
      this.gradient.addColorStop(altitude1,  "hsla(" + hue + "deg, 100%, 100%, 0.02)");
      this.gradient.addColorStop(altitude2,  "hsla(" + hue + "deg, 100%, 100%, 0.1)");
      this.gradient.addColorStop(1,          "hsla(" + hue + "deg, 100%, 100%, 0.3)");

   }

   // draw the Fog in the context set by the constructor.
   draw() {
      this.ctx.fillStyle = this.gradient;
      this.ctx.fillRect(
            0,
            0,
            this.ctx.canvas.width,
            this.ctx.canvas.height);
   }
}

// the Pencil will draw the towers and the fog alternatively on all the layers.
class Pencil {

   //
   constructor() {
      this.tabTower = [];
      this.tabFog = [];
      this.tabLayer = [];
   }

   // init the towers on the layers
   init(nbTowers = 10) {

      this.deleteAllCanvas();
      this.tabTower = [];
      this.tabFog = [];
      this.tabLayer = [];

      nbTowers = Math.floor(nbTowers);

      this.initLayers(editableConfig.nbLayers);
      this.initFog();

      this.initAndDistribTowersOnLayers(nbTowers, editableConfig.nbLayers);
   }

   // Init and clean the layers
   initLayers(nbLayersOfTowers) {
      for (let i = 0 ; i < (nbLayersOfTowers * 2) ; i ++) {
         this.tabLayer[Number(i)] = new Layer("layer" + i);
         this.tabLayer[Number(i)].clearCanvas();
      }
   }

   initFog() {
      let nbLayersOfFog = this.tabLayer.length / 2;
      for (let i = 0 ; i < nbLayersOfFog ; i ++) {
         this.tabFog[Number(i)] = new Fog(this.tabLayer[Number((i * 2) + 1)]);
      }
   }

   // Init the towers distributed on the layers
   initAndDistribTowersOnLayers(nbTowers, nbLayers) {
      var currentLayerLevel = 0;
      var nbTowersByLayer = Math.floor(nbTowers / nbLayers);

      for (let i = 0; i < nbTowers; i++) {

         if (i > (nbTowersByLayer * (1 + currentLayerLevel))) {

            currentLayerLevel++ ;
            if (currentLayerLevel > (nbLayers - 1)) {
               currentLayerLevel = nbLayers - 1;
            }
         }
         this.tabTower[Number(i)] = new Tower(this.tabLayer[Number(currentLayerLevel * 2)]);

      }
   }

   // delete all canvas
   deleteAllCanvas() {
      let listCanvasToDelete = document.querySelectorAll("canvas");
      let listLength = listCanvasToDelete.length;
      for (let i = 0 ; i < listLength ; i++) {
         listCanvasToDelete[Number(i)].remove();
      }
   }

   // draw the layers
   draw(layerId = null) {

      for (let i = 0; i < this.tabTower.length; i++) {
         if (layerId === null ||
            (layerId !== null && this.tabTower[Number(i)].layer.id === layerId)) {
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

   getRandomTower() {
      let randomTower = Math.floor(randomizeBetween(0, this.tabTower.length));
      let myTower = this.tabTower[Number(randomTower)];
      return myTower;
   }

   randomLightWindows(myTower) {

      let randomWindowX = Math.floor(randomizeBetween(0, myTower.tabWindows.length));
      let myWindowsLine = myTower.tabWindows[Number(randomWindowX)];
      let randomWindowY = Math.floor(randomizeBetween(0, myWindowsLine.length));

      let light = myTower.tabWindows[Number(randomWindowX)][Number(randomWindowY)];
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
   for (let i = 0, tabLength = pen.tabLayer.length ; i < tabLength ; i ++) {

      let moveX = Math.floor(moveHighestX / (tabLength - i + 1));
      let moveY = Math.floor(moveHighestY / (tabLength - i + 1));
      pen.tabLayer[Number(i)].translateCanvas(
         - moveX - (editableConfig.amplitudeXMax / 2),
         - moveY - (editableConfig.amplitudeYMax / 2)
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

function reset() {

   pen.init(editableConfig.numberOfTowers);
   pen.draw();
   pen.drawFog();
   setInterval(animate, 1000) ;

   document
      .querySelector("div#main")
      .addEventListener ("mousemove", mouseOverMain);
}



let gui = new dat.GUI();
//gui.remember(editableConfig);
gui.add(editableConfig, "numberOfTowers").min(2).max(100).step(1);
gui.add(editableConfig, "nbLayers").min(2).max(10).step(1);
gui.add(editableConfig, "amplitudeXMax").min(0).max(500).step(10);
gui.add(editableConfig, "amplitudeYMax").min(0).max(500).step(10);
gui.add(this, "reset");

reset();
