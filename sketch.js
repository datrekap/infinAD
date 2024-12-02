//universal variables
let mic, fft, vid;

//flower variables
let flowers = [];
let numFlowers = 2;
let micLevel = 0;
let glowAmount = 0;

//pollen particles variables 
let particles = [];
let flowField = [];
let cols, rows;
let scl = 10;

//motion detection variables
let video;
let prevFrame;
let motionThreshold = 30;
let imageSets = [[], [], []]; // Four sets of images
let activeImages = [];
let gridSize = 20;
let minMotionPixels = 10;
let currentSetIndex = 0; // Tracks which set to use
let motionPreviouslyDetected = false;

function preload() {
  //BG video
  vid = createVideo('CenterBG.mp4');

  //Image Ads
  imageSets[0].push(loadImage('ADS/edu1.png'));
  imageSets[0].push(loadImage('ADS/edu2.png'));
  imageSets[0].push(loadImage('ADS/edu3.png'));

  imageSets[1].push(loadImage('ADS/fashion1.png'));
  imageSets[1].push(loadImage('ADS/fashion2.png'));
  imageSets[1].push(loadImage('ADS/fashion3.png'));

  imageSets[2].push(loadImage('ADS/tech1.png'));
  imageSets[2].push(loadImage('ADS/tech2.png'));
  imageSets[2].push(loadImage('ADS/tech3.png'));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  //Video setup
  vid.hide();
  vid.loop();

  //webcam setup
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  prevFrame = createImage(width, height);

  angleMode(DEGREES);
  colorMode(HSB);
  noStroke();

  // Initialize microphone with error handling
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);

   // Set up the flow field
  cols = floor(width / scl);
  rows = floor(height / scl);
  for (let y = 0; y < rows; y++) {
    let gridRow = [];
    for (let x = 0; x < cols; x++) {
      gridRow.push(0); // Initialize field with 0 angles
    }
    flowField.push(gridRow);
  }
  
  //Create flowers
  for (let i = 0; i < numFlowers; i++) {
    let angle = (360 / numFlowers) * i;
    let radius = 250;
    let x = 0 + cos(angle) * radius;
    let y = 0 + sin(angle) * radius;
    let area = random(0.8, 1.2);
    let hueOffset = random(-60, -60);
    flowers.push(new Flower(x, y, 1.0, hueOffset));
  }
  flowers.push(new Flower(0, 0, 2.0, 2));
}

function draw() {
  colorMode(HSB);
  //background(190, 40, 0);
  image(vid, 0, 0, width, height);
  translate(width/2, height/2);
  //fft analysis for pollens 
  let spectrum = fft.analyze();
  let energy = fft.getEnergy("mid");
  
  // Get microphone level with amplification and smoothing
  let targetLevel = mic.getLevel();
  micLevel = lerp(micLevel, targetLevel * 4, 0.09);
  glowAmount = lerp(glowAmount, micLevel * 300, 0.1);

  // Draw all flowers
  for (let flower of flowers) {
    flower.draw(micLevel, glowAmount);
  }
  
   // Update the flow field with Perlin noise
  let noiseScale = 0.5;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let angle = noise(x * noiseScale, y * noiseScale, frameCount * 0.01) * TWO_PI * 2;
      flowField[y][x] = angle;
    }
  }
  
    for (let i = 0; i < energy / 10; i++) {
    particles.push(new Particle());
  }
  colorMode(RGB);
  // Update and display particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].followFlowField();
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) {
      particles.splice(i, 1); // Remove particle if it has faded
    }
  }
  push();
  translate(-width, -height);
  //ADS pop up
  let motionDetected = detectMotion();

  // If motion is detected, add a new pop-up image from the current set
  if (motionDetected) {
    if (random() < 0.9) { // Probability for spawning a new image
      let imgSet = imageSets[currentSetIndex];
      let img = random(imgSet);

      // Calculate scaling factor to fit image within canvas
      let scaleFactor = min(width / img.width, height / img.height, 1);

      let newImage = {
        img: img,
        x: (random(width + width/2))- windowWidth/4,
        y: (random(height + height/2)) - windowHeight/4,
        width: img.width * scaleFactor/2.5,
        height: img.height * scaleFactor/2.5,
        startTime: millis()
      };
      activeImages.push(newImage);
    }
    motionPreviouslyDetected = true;
  } else if (motionPreviouslyDetected && activeImages.length === 0) {
    // Move to the next set only if there was previous motion and now no active images
    currentSetIndex = (currentSetIndex + 1) % imageSets.length;
    motionPreviouslyDetected = false;
  }

  // Display active images and remove those that have exceeded their duration
  for (let i = activeImages.length - 1; i >= 0; i--) {
    let imgData = activeImages[i];
    if (millis() - imgData.startTime > 5000) { // Remove after 5 seconds
      activeImages.splice(i, 1);
    } else {
      image(imgData.img, imgData.x, imgData.y, imgData.width, imgData.height);
    }
  }

  prevFrame.copy(video, 0, 0, width, height, 0, 0, width, height);

  pop();
}

//Detect motion
function detectMotion() {
  video.loadPixels();
  prevFrame.loadPixels();
  
  let motionPixels = 0;

  for (let x = 0; x < video.width; x += gridSize) {
    for (let y = 0; y < video.height; y += gridSize) {
      let index = (x + y * video.width) * 4;
      let r1 = video.pixels[index];
      let g1 = video.pixels[index + 1];
      let b1 = video.pixels[index + 2];
      let r2 = prevFrame.pixels[index];
      let g2 = prevFrame.pixels[index + 1];
      let b2 = prevFrame.pixels[index + 2];

      let diff = dist(r1, g1, b1, r2, g2, b2);
      
      if (diff > motionThreshold) {
        motionPixels++;
      }
    }
  }

  return motionPixels > minMotionPixels;
}


