let particles = [];
const baseNum = 3000;        // tuned for ~1920x1080; scales with area below
const maxNum = 6000;         // hard cap so tall pages don't melt laptops
const noiseScale = 0.002;
let t = 0;
let trailBuffer;
let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
let frameDropWarning = false;
let frameDropTimer = 0;
let targetParticles;
let lastFrameTime = 0;

// mouse fed by the parent page via postMessage (pointer-events:none
// means the iframe never gets real mouse events)
let extMouseX = null;
let extMouseY = null;
window.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'mouse') {
    extMouseX = e.data.x;
    extMouseY = e.data.y;
  }
});

function particleBudget() {
  let scale = (width * height) / (1920 * 1080);
  return floor(constrain(baseNum * scale, 800, maxNum));
}

function rebuild() {
  if (isChrome) {
    trailBuffer = createGraphics(width, height, P2D);
  } else {
    trailBuffer = createGraphics(width, height);
  }
  trailBuffer.noStroke();
  background(0);
  targetParticles = particleBudget();
  particles = [];
  for (let i = 0; i < targetParticles; i++) {
    particles.push(new Particle(random(width), random(height)));
  }
}

function setup() {
  if (isChrome) {
    pixelDensity(1);
    createCanvas(windowWidth, windowHeight, P2D);
  } else {
    createCanvas(windowWidth, windowHeight);
  }
  rebuild();
  lastFrameTime = millis();
}

function draw() {
  // self-heal: iframe resized without windowResized firing
  if (abs(windowHeight - height) > 8 || abs(windowWidth - width) > 8) {
    resizeCanvas(windowWidth, windowHeight);
    rebuild();
    return;
  }

  const now = millis();
  const frameTime = now - lastFrameTime;
  lastFrameTime = now;
  if (frameTime > 40) {
    if (frameTime > 100 && !frameDropWarning) {
      frameDropWarning = true;
      frameDropTimer = now;
      targetParticles = max(500, targetParticles - 200);
      particles = particles.slice(0, targetParticles);
    }
  }
  if (frameDropWarning && now - frameDropTimer > 5000) {
    frameDropWarning = false;
  }

  if (!isChrome || frameCount % 2 === 0) {
    trailBuffer.fill(0, 25);
    trailBuffer.rect(0, 0, width, height);
  }

  // use bridged mouse if the parent is feeding it; fall back to p5's
  let useX = (extMouseX !== null) ? extMouseX : mouseX;
  let useY = (extMouseY !== null) ? extMouseY : mouseY;
  let mx = map(useX, 0, width, -PI, PI);
  let my = map(useY, 0, height, -PI, PI);

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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  rebuild();
}
