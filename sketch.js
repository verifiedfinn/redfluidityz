let particles = [];
const num = 3000;
const noiseScale = 0.002;
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  background(0);
  frameRate(60); // smoother timing across browsers

  for (let i = 0; i < num; i++) {
    particles.push(new Particle(random(width), random(height)));
  }
}

function draw() {
  fill(0, 20); // preserve trailing aesthetic
  rect(0, 0, width, height);

  for (let p of particles) {
    p.update();
    p.display();
  }

  t += 0.002;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0); // clears weird stretched trails on resize
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.speed = random(0.5, 1.5);
    this.size = random(0.5, 2.5);
    this.offset = random(TWO_PI);
  }

  update() {
    let mx = map(mouseX, 0, width, -PI, PI);
    let my = map(mouseY, 0, height, -PI, PI);

    let n = noise(this.pos.x * noiseScale, this.pos.y * noiseScale, t);
    let angle = n * TWO_PI * 2 + mx * (this.pos.y / height) + my * (this.pos.x / width);
    this.vel.set(cos(angle), sin(angle));

    this.pos.x += this.vel.x * this.speed + sin(t + this.offset) * 0.5;
    this.pos.y += this.vel.y * this.speed + cos(t + this.offset) * 0.5;

    this.pos.x = (this.pos.x + width) % width;
    this.pos.y = (this.pos.y + height) % height;
  }

  display() {
    let dx = this.pos.x - width / 2;
    let dy = this.pos.y - height / 2;
    let d = sqrt(dx * dx + dy * dy); // same result, faster than dist()

    let red = 150 + sin(t * 2 + this.offset + d * 0.005) * 80;
    let alpha = map(sin(t + d * 0.02), -1, 1, 60, 200);

    fill(red, 0, 0, alpha);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}
