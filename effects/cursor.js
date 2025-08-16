(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  const E = {
    friction: 0.5,
    trails: 20,
    size: 50,
    dampening: 0.25,
    tension: 0.98,
  };

  let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let lines = [];

  class Node {
    constructor() { this.x = pos.x; this.y = pos.y; this.vx = 0; this.vy = 0; }
  }

  class Line {
    constructor(spring) {
      this.spring = spring + 0.1 * (Math.random() - 0.2);
      this.friction = E.friction + 0.01 * (Math.random() - 0.2);
      this.nodes = Array.from({ length: E.size }, () => new Node());
    }

    update() {
      let e = this.spring;
      this.nodes[0].vx += (pos.x - this.nodes[0].x) * e;
      this.nodes[0].vy += (pos.y - this.nodes[0].y) * e;

      for (let i = 0; i < this.nodes.length; i++) {
        const t = this.nodes[i];
        if (i > 0) {
          const n = this.nodes[i - 1];
          t.vx += (n.x - t.x) * e;
          t.vy += (n.y - t.y) * e;
          t.vx += n.vx * E.dampening;
          t.vy += n.vy * E.dampening;
        }
        t.vx *= this.friction;
        t.vy *= this.friction;
        t.x += t.vx;
        t.y += t.vy;
        e *= E.tension;
      }
    }

    draw(hue) {
      ctx.beginPath();
      const n0 = this.nodes[0];
      ctx.moveTo(n0.x, n0.y);

      for (let a = 1; a < this.nodes.length - 1; a++) {
        const e = this.nodes[a];
        const t = this.nodes[a + 1];
        const nx = (e.x + t.x) / 2;
        const ny = (e.y + t.y) / 2;
        ctx.quadraticCurveTo(e.x, e.y, nx, ny);
      }

      const e = this.nodes[this.nodes.length - 2];
      const t = this.nodes[this.nodes.length - 1];
      ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
      ctx.strokeStyle = `hsla(${Math.round(hue)},50%,50%,0.2)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();
    }
  }

  let f = {
    phase: Math.random() * Math.PI * 2,
    offset: 285,
    frequency: 0.0015,
    amplitude: 85,
    update() {
      this.phase += this.frequency;
      return this.offset + Math.sin(this.phase) * this.amplitude;
    }
  };

  function initLines() {
    lines = [];
    for (let i = 0; i < E.trails; i++) {
      lines.push(new Line(0.4 + (i / E.trails) * 0.025));
    }
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function render() {
    if (!ctx) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    const hue = f.update();
    lines.forEach(line => {
      line.update();
      line.draw(hue);
    });

    requestAnimationFrame(render);
  }

  function onMove(e) {
    pos.x = e.clientX || (e.touches && e.touches[0].pageX);
    pos.y = e.clientY || (e.touches && e.touches[0].pageY);
  }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove);
  window.addEventListener('resize', () => { resizeCanvas(); initLines(); });

  // initialize
  resizeCanvas();
  initLines();
  render();
})();
