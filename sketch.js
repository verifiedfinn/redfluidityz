let particles = [];
const num = 3000;
const noiseScale = 0.002;
let t = 0;
let trailBuffer;

let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

let frameDropWarning = false;
let frameDropTimer = 0;
let targetParticles = num;
let lastFrameTime = 0;

function setup() {
  if (isChrome) {
    pixelDensity(1);
    createCanvas(windowWidth, windowHeight, P2D);
    trailBuffer = createGraphics(width, height, P2D);
  } else {
    createCanvas(windowWidth, windowHeight);
    trailBuffer = createGraphics(width, height);
  }

  trailBuffer.noStroke();
  background(0);

  for (let i = 0; i < num; i++) {
    particles.push(new Particle(random(width), random(height)));
  }

  lastFrameTime = millis();
}

function draw() {
  const now = millis();
  const frameTime = now - lastFrameTime;
  lastFrameTime = now;

  if (frameTime > 40) {
    console.log(`Frame drop: ${nf(frameTime, 0, 2)} ms`);
    if (frameTime > 100 && !frameDropWarning) {
      frameDropWarning = true;
      frameDropTimer = now;
      targetParticles = max(500, targetParticles - 200);
      particles = particles.slice(0, targetParticles);
      console.warn("⚠️ Frame spike! Reducing particles to", targetParticles);
    }
  }

  if (frameDropWarning && now - frameDropTimer > 5000) {
    frameDropWarning = false;
  }

  if (!isChrome || frameCount % 2 === 0) {
    trailBuffer.fill(0, 25);
    trailBuffer.rect(0, 0, width, height);
  }

  let mx = map(mouseX, 0, width, -PI, PI);
  let my = map(mouseY, 0, height, -PI, PI);

  for (let p of particles) {
    p.update(mx, my);
    p.display(trailBuffer);
  }

  t += 0.002;

  image(trailBuffer, 0, 0);
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.speed = random(0.5, 1.5);
    this.size = random(0.5, 2.5);
    this.offset = random(TWO_PI);
  }

  update(mx, my) {
    let nx = this.pos.x * noiseScale;
    let ny = this.pos.y * noiseScale;
    let nt = isChrome ? Math.floor(t * 20) / 20 : t;

    let n = noise(nx, ny, nt);
    let angle = n * TWO_PI * 2 + mx * (this.pos.y / height) + my * (this.pos.x / width);
    this.vel.set(cos(angle), sin(angle));

    this.pos.x += this.vel.x * this.speed + sin(t + this.offset) * 0.5;
    this.pos.y += this.vel.y * this.speed + cos(t + this.offset) * 0.5;

    this.pos.x = (this.pos.x + width) % width;
    this.pos.y = (this.pos.y + height) % height;
  }

  display(pg) {
    let dx = this.pos.x - width / 2;
    let dy = this.pos.y - height / 2;
    let d = Math.sqrt(dx * dx + dy * dy);

    let red = 150 + sin(t * 2 + this.offset + d * 0.005) * 80;
    let alpha = map(sin(t + d * 0.02), -1, 1, 60, 200);
    pg.fill(red, 0, 0, alpha);
    pg.ellipse(this.pos.x, this.pos.y, this.size);
  }
}
