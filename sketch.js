x = 0, s = 1000;

var balls = [];
var numBalls = 25;

var state = 1;
var noiseStarts = [];

var things = []

var amp = 0;
var freq = 120;
var t = 0;

var particles = [];
var speed;

var numOfPoints = 100;

var images = ['jpg1', 'jpg2', 'jpg3', 'jpg4', 'jpg5', 'jpg6'];
var music = ["assets/MindsEye.mp3","assets/lasers.mp3"]

//VARIABLES//////////////////////////////////////////
var osc = new maximJs.maxiOsc();


//ENVELOPE//////////////////////////////////////////
var envF = new maximEx.envFollower();

//LOADING SAMPLE///////////////////////////////////
var samp = new maximJs.maxiSample();
var samp2 = new maximJs.maxiSample();
var rSlider, gSlider, bSlider;
var l = 0;



function preload() {

    //LOADING IMAGES////////////////////////////
    for (var i = 0; i <= 5; i++) {
        images[i] = loadImage("assets/myCanvas" + i + ".jpg");
    }

    //creating the MaximJs audio context
    audio = new maximJs.maxiAudio(); //We're using maximJs without an audio loop
    audio.play = playLoop;
    audio.init();
    audio.loadSample("assets/MindsEye.mp3", samp);
    audio.loadSample("assets/lasers.mp3", samp2);
}

function setup() {

    createCanvas(windowWidth-23.6, windowHeight-23.6);


    //RADIATION
    for (var i = 0; i < 800; i++) {
        particles[i] = new Particles();
    }


    for (var i = 0; i < numBalls; i++) {
        //Ball(x, y, s, r, sp, partnerSize///////
        balls[i] = new Ball(0, 0, 10, 10 * i);
    }

    for (var i = 0; i < 5; i++) {
        things[i] = new thing();
        things[i].setup();

    }



}

//PLAY LOOP///////////////////////////////////
function playLoop() {
    if(test === 0){

      var sig = samp.play();
    }else{
      var sig = samp2.play();
    }

    //amp from 0.01 to 0.5
    amp = envF.analyse(sig, 0.01, 0.5);
    this.output = sig;


}



function draw() {

    switch (state) {
            
        case 1:
             displayThree();
            break;
            
        case 2:       
             displayTwo();
            break;
            
        case 3:
             displayOne();
            break;
            
        case 4:
            displayFour();
            break;
    
    }


};


setInterval(function() {

    reset();
    state++;
    if (state > 4) {

        state = 1;
    }

}, 20000);

var test = 0;

setInterval(function(){
  console.log("test");
  samp.trigger();
  samp2.trigger();
  test++;
  test = test%2;

}, 180000)

function reset() {
    resetMatrix();
    clear();
    x = 0;
    s = 1000;


}

function displayOne() {


    //TRANSLATE AT TOP LEFT CORNER
    translate(s / 6, s / 6);

    noFill();
    stroke(0, 10);
    s += 0.5;
    s %= 5000;


    for (var i = 0; i < 30*amp; i++) {
        push();

        //ROTATE/////////////////////////
        rotate(s*amp*100);
        triangle(x, -i, -i, x, i, 100);

        pop();
        //MOVING/////////////////////////
        x++;
    }

}

function displayTwo() {
    
    background(0);

    //FIRST ELLIPSE / ORBIT///////////////////////////////////
    push();
    translate(width / 2, height / 2);
    things[0].display(200, 200, 1000);
    pop();

    //SECOND ELLIPSE / ORBIT///////////////////////////////////
    push();
    translate(width / 2, height / 2);
    things[1].display(400, 600, 1000);
    pop();

    //THIRD ELLIPSE / ORBIT///////////////////////////////////
    push();
    translate(width / 2, height / 2);
    things[1].display(100, 100, 1000);
    pop();

    

}

function displayThree() {
    push();
    translate(width / 2, height / 2);


    for (var i = 0; i < balls.length; i++) {
        balls[i].draw(balls);
        balls[i].move();
    }
    pop();

}

function displayFour() {
  background(0);
   var w = 0;
   var h = 0;

    //Amp from 1 to 5////////////////////////////
    var amp2 = map(amp, 0, 1, 0, 5);

    //Amp=index of Images 0,1,2,3//////////////////
    var index = parseInt(amp2);
    var aspect = images[index].width/images[index].height;
    if(width>height){
           h = height;
           w= h*aspect;
    }else {
      w=width;
      h = w/aspect;
        }
    translate((width / 2) - (w/2), (height / 2) - (h/2));
    image(images[index], 0, 0, w, h);

}



function thing() {

    //////FUNCTION SETUP//////////////////////////
    this.setup = function() {

        for (var i = 0; i < numOfPoints; i++) {
            noiseStarts.push(random(1000));

        }
    }

    //////FUNCTION DISPLAY///////////////////////

    this.display = function(a, b, c) {
        noStroke();

        //COLOURS
        fill(random(255), 0, random(100));
        //CHANGING BY AMP
        scale(sin(frameCount / 500 * amp));


        //CURVE EQUATION///////
        for (var i = 0; i < numOfPoints; i++) {
            var x = cos((TWO_PI / numOfPoints) * i) * (a + noise(noiseStarts[i]) * b);
            var y = sin((TWO_PI / numOfPoints) * i) * (a + noise(noiseStarts[i]) * b);
            noiseStarts[i] += 0.01;

            rotate(sin(frameCount / c));
            //POINTS/CELLS//////
            ellipse(x, y, random(0.5, 100), random(0.5, 100));
        }
    }
}


function Ball(x, y, s, r, sp, partnerSize) {

    //////VARIABLES//////////////////////////////////////////////////////////////////////////////
    this.x = x;
    this.y = y;
    this.s = s;
    this.r = r;
    this.angle = 0;
    this.speed = random(-1, 1);

    //SIZE OF ARRAY YOU PASS IN
    this.partnerNum = floor(random(partnerSize));


    //////FUNCTION//////////////////////////////////////////////////////////////////////////////
    this.draw = function(partner) {

        fill(lerpColor(color(255, 0, 0, 100), color(0, 0, 255, 200), random(0, 1)));
        noStroke();
        ellipse(this.x, this.y, this.s);

        stroke(0);

        line(this.x, this.y, partner[this.partnerNum].x, partner[this.partnerNum].y);
    }


    //////MOVE//////////////////////////////////////////////////////////////////////////////
    this.move = function() {

        //CURVE EQUATION/
        var offset = map(sin(this.angle * 5 + frameCount * 0.01), -1, 1, 0, 50);
        var r = this.r + offset;
        this.x = r * cos(this.angle)*amp*5;
        this.y = r * sin(this.angle)*amp*5;

        //MOVE
        this.angle += this.speed;

    }

}


function Particles() {
    
    this.x = random(-width, width);
    this.y = random(-height, height);
    this.z = random(width);
    this.zp = this.z;

    this.update = function() {
        this.z = this.z - speed;
        if (this.z < 1) {
            this.z = width;
            this.x = random(-width, width);
            this.y = random(-height, height);
            this.zp = this.z; //particles move out towards the width of the screen
        }
    }

    this.show = function() {
        fill(255, 0, 0, 20);
        noStroke();

        var sx = map(this.x / this.z, 0, 1, 0, width);
        var sy = map(this.y / this.z, 0, 1, 0, height);
        var r = map(this.z, 0, width, 16, 0);
        ellipse(sx, sy, r, r);

        var px = map(this.x / this.zp, 0, 1, 0, width);
        var py = map(this.y / this.zp, 0, 1, 0, height);

        this.zp = this.z; //resetting

        stroke(255, 0, 0, 70);
        line(px, py, sx, sy);
    }
    
}
