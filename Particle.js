class Particle {
  constructor() {
    let angle = random(360); // Random angle around the circle
    let radius = 10; // Radius of the ellipse (half of its size)
    this.pos = createVector(cos(angle) * radius, sin(angle) * radius); // Random point on ellipse
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.lifespan = 255;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  followFlowField() {
    let x = floor((this.pos.x + width / 2) / scl);
    let y = floor((this.pos.y + height / 2) / scl);
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      let angle = flowField[y][x];
      let force = p5.Vector.fromAngle(angle);
      force.setMag(0.5);
      this.applyForce(force);
    }
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.lifespan -= 4;
  }

  finished() {
    return this.lifespan < 0;
  }

  show() {
    noStroke();
    fill(255, 204, 100, this.lifespan);
    ellipse(this.pos.x, this.pos.y, 4);
  }
}