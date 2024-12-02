class Flower {
  constructor(x, y, size, hueOffset) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.hueOffset = hueOffset;
    this.numPetals = 12;
    this.numLayers = 4;
    this.rotationOffset = random(360);
  }
  draw(micLevel, glowAmount) {
    push();
    translate(this.x, this.y);
    scale(this.size);

    this.rotationOffset += 0.1; // Increased rotation response

    // Draw the glow effect
    drawingContext.shadowBlur = 20 + glowAmount * 2; // Increased glow response
    drawingContext.shadowColor = color((300 + this.hueOffset) % 360, 80, 70, 0.5);
    //drawingContext.shadowColor = color(300 + this.hueOffset, 50, 60);

    // Draw multiple layers of petals
    for (let layer = this.numLayers; layer > 0; layer--) {
      let baseLayerSize = map(layer, 1, this.numLayers, 20, 70);
      let layerSize = baseLayerSize * (1 + micLevel); // Increased size response

    let hue = (map(layer, 1, this.numLayers, 320 + micLevel * 20, 280) + this.hueOffset) % 360;
    let saturation = map(layer, 1, this.numLayers, 90, 60 + micLevel * 20);
    let brightness = map(layer, 1, this.numLayers, 95 + glowAmount, 85 + glowAmount);

      push();
      rotate(this.rotationOffset * (layer / 2));

      for (let i = 0; i < this.numPetals; i++) {
        let angle = (360 / this.numPetals) * i;
        let petalSize =
          layerSize * (1 + 0.2 * sin(frameCount + layer * 30) + micLevel);

        push();
        rotate(angle);
        fill(hue, saturation, brightness);

        beginShape();
        for (let t = 0; t <= 1; t += 0.01) {
          let pulseEffect =
            1 + (micLevel * sin(frameCount * 2 + layer * 30) * 2.5);
          let px = petalSize * pow(sin(t * 180), 0.5) * pulseEffect;
          let py =
            petalSize *
            (0.5 * sin(t * 180) + 0.5 * sin(t * 180 * 2)) *
            pulseEffect;
          vertex(px, py);
        }
        for (let t = 1; t >= 0; t -= 0.01) {
          let pulseEffect = 1 + micLevel * sin(frameCount * 4 + layer * 30) * 0.5;
          let px = -petalSize * pow(sin(t * 180), 0.5) * pulseEffect;
          let py = petalSize * (0.5 * sin(t * 180) + 0.5 * sin(t * 180 * 2)) * pulseEffect;
          vertex(px, py);
        }
        endShape(CLOSE);
        pop();
      }
      pop();
    }

    // Draw center
    drawingContext.shadowBlur = 40 + glowAmount;
    drawingContext.shadowColor = color(45 + this.hueOffset / 4, 80, 100, 0.6);

    for (let i = 5; i > 0; i--) {
      let size = map(i, 1, 5, 4, 16) * (1 + micLevel * 0.5);
      let brightness = map(i, 1, 5, 60, 90 + glowAmount);
      fill(45 + this.hueOffset / 4, 80, brightness);
      circle(0, 0, size);
    }

    // Pollen details
    for (let i = 0; i < 12; i++) {
      let angle = random(360);
      let radius = random(6);
      let x = cos(angle) * radius;
      let y = sin(angle) * radius;
      fill(45 + this.hueOffset / 4, 60, 100);
      circle(x, y, 1.3);
    }

    pop();
  }
}