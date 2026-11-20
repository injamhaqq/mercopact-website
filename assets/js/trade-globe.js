(() => {
  const scene = document.querySelector('[data-trade-globe]');
  if (!scene) return;

  const canvas = scene.querySelector('canvas');
  const context = canvas.getContext('2d', { alpha: true });
  const toggle = scene.querySelector('[data-globe-toggle]');
  if (!context) return;

  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const radians = Math.PI / 180;
  const turn = 2 * Math.PI;
  const introductoryMotion = 4200;

  // 144 × 72 grid derived from Natural Earth's public-domain 1:110m land polygons.
  const landGrid = atob('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQA/gAAAAAAAAAAAAAAAAAAD/7///AAAA4AAYAAAAAAAAAE9f///8AB4AAAADAAAAAAAABbZMP//8AAAAA4A/8AYAAAAADxeuAf/8AAAAGAP//YIAAgOAA/G/wP/4AACAGO/////8Bh///7P9wH/gAA/5j+///////9/////w+P4PAB/z/////////Gf////UUHwCAH///////////A////8BwDgAAPv////////z4AMB//+B+AAACLn///////wCAAYAf//x/AAACHP///////gOAAAAP//7/wAAPP////////4MAAAAP////QAAD/////////wIAAAAD///84AAD/////////wAAAAAD////AAAB//Xn/////gAAAAAD///0AAAH6+Dn/////MAAAAAD///gAAAPl//z////8IAAAAAB///AAAAPAP/n///+IAAAAAAB///AAAAF8Af/////MwAAAAAA//8AAAAP+AP/////DAAAAAAAf/4AAAAP/v//////gAAAAAAAP8EAAAAf///v////gAAAAAAAD4EAAAA////7////AAAAAAAAB4AAAAB///3+H//+AAAAAEAAA4jAAAB///7/B+fgAAAAAAAAA/i8AAB///7+B8fQgAAAAAAAAHwAAAB///94BwXggAAAAAAAAA4AAAB////gAwHwQAAAAAAAAAY/AAA///+wAwFgQAAAAAAAAAP/AAAf///wAIEAYAAAAAAAAAB/4AAfv//wAACCQAAAAAAAAAB/8AAAD//gAAGGAAAAAAAAAAD/8AAAH//AAAGfwAAAAAAAAAH//AAAD/+AAADPjAAAAAAAAAH//4AAD/8AAABAo8gAAAAAAAD//8AAB/8AAAAgBeIAAAAAAAD//8AAB/8AAAACwLCAAAAAAAB//4AAB/8AAAAACgAAAAAAAAB//wAAB/8QAAAALIAAAAAAAAA//wAAD/9wAAAAfsABAAAAAAAP/wAAB/xwAAAA/+AAAAAAAAAP/wAAB/xgAAAH//AgAAAAAAAP/AAAA/xgAAAH//gAAAAAAAAf+AAAA/gAAAAH//gAAAAAAAAf8AAAAfgAAAAD//gAAAAAAAAf4AAAAfAAAAAD//gAAAAAAAAf4AAAAcAAAAADg/gAAAAAAAA/gAAAAAAAAAAAAPAEAAAAAAA/AAAAAAAAAAAAACAGAAAAAAA8AAAAAAAAAAAAACAMAAAAAAA8AAAAAAAAAAAAAAAYAAAAAAB4AAAAAAAAAAAAAAAQAAAAAAA4AAAAAAAAEAAAAAAAAAAAAAAxgAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAGAAAAAAAOAADefsAAAAAAAAAeAAAAAAb/8f////wAAAAAAQA+AAAf////7//////wAAAJ4f/+AAB////////////gAAf////wAA////////////+AAT////+ADn/////////////gAD/////+Df////////////+AWB/////////////////////4////////////////////////////////////////////////');
  const isLand = (latitude, longitude) => {
    const row = Math.floor((90 - latitude) * .4);
    const column = Math.floor((longitude + 180) * .4);
    const bit = row * 144 + column;
    return landGrid.charCodeAt(bit >> 3) & (128 >> (bit % 8));
  };

  function point(latitude, longitude) {
    const lat = latitude * radians;
    const lon = longitude * radians;
    return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
  }

  const dots = [];
  for (let latitude = -78; latitude < 82; latitude += 2.7) {
    const count = Math.round(135 * Math.cos(latitude * radians));
    for (let i = 0; i < count; i++) {
      const longitude = -180 + (i + .5) * 360 / count;
      dots.push({ position: point(latitude, longitude), land: isLand(latitude, longitude) });
    }
  }

  // Illustrative market connections. They are decorative and carry no customer or activity data.
  const hub = point(51.51, -.12);
  const destinations = [point(40.7, -74), point(25.2, 55.27), point(19.08, 72.88), point(35.68, 139.69)];
  const arcs = destinations.map((target, index) => {
    const angle = Math.acos(hub.reduce((acc, value, axis) => acc + value * target[axis], 0));
    return Array.from({ length: 64 }, (_, step) => {
      const t = step / 63;
      const height = 1 + Math.sin(t * Math.PI) * (.1 + index * .025);
      return hub.map((value, axis) => height * (
        Math.sin((1 - t) * angle) * value + Math.sin(t * angle) * target[axis]
      ) / Math.sin(angle));
    });
  });

  let width = 0;
  let height = 0;
  let radius = 0;
  let centreX = 0;
  let centreY = 0;
  let angle = -.34;
  let pulse = 0;
  let mode = 'paused';
  let frameId = 0;
  let previousTime = 0;
  let elapsed = 0;
  let visible = false;

  function render() {
    if (!radius) return;
    const sinY = Math.sin(angle);
    const cosY = Math.cos(angle);
    const sinTilt = Math.sin(.38);
    const cosTilt = Math.cos(.38);
    const c = context;
    c.clearRect(0, 0, width, height);

    function project([x, y, z]) {
      const rotatedX = x * cosY + z * sinY;
      const depth = z * cosY - x * sinY;
      const rotatedY = y * cosTilt - depth * sinTilt;
      const rotatedZ = depth * cosTilt + y * sinTilt;
      return { x: centreX + rotatedX * radius, y: centreY - rotatedY * radius, z: rotatedZ };
    }

    const halo = c.createRadialGradient(centreX, centreY, radius * .55, centreX, centreY, radius * 1.48);
    halo.addColorStop(0, '#4db48a31');
    halo.addColorStop(.64, '#347b6452');
    halo.addColorStop(1, '#347b6400');
    c.fillStyle = halo;
    c.fillRect(0, 0, width, height);

    c.lineWidth = 1;
    c.strokeStyle = '#87cdb44d';
    c.beginPath();
    c.ellipse(centreX, centreY + radius * .05, radius * 1.33, radius * .51, -.23, 0, turn);
    c.stroke();
    c.strokeStyle = '#93cdb52b';
    c.setLineDash([3, 6]);
    c.beginPath();
    c.ellipse(centreX, centreY, radius * 1.2, radius * 1.2, 0, 0, turn);
    c.stroke();
    c.setLineDash([]);

    const sphere = c.createRadialGradient(centreX - radius * .34, centreY - radius * .53, 0, centreX, centreY, radius);
    sphere.addColorStop(0, '#224c41');
    sphere.addColorStop(.7, '#12322d');
    sphere.addColorStop(1, '#0b251f');
    c.fillStyle = sphere;
    c.strokeStyle = '#6fbd9a73';
    c.beginPath();
    c.arc(centreX, centreY, radius, 0, turn);
    c.fill();
    c.stroke();

    for (const { position, land } of dots) {
      const p = project(position);
      if (p.z <= 0) continue;
      const light = Math.max(0, Math.min(1, .33 + p.z * .67 - (p.x - centreX) / radius * .18));
      c.globalAlpha = light * (land ? .94 : .25);
      c.fillStyle = land ? '#b0f1c9' : '#72b1a1';
      const dot = Math.max(.64, radius * (land ? .0081 : .0038)) * (.72 + .28 * p.z);
      c.fillRect(p.x - dot / 2, p.y - dot / 2, dot, dot);
    }
    c.globalAlpha = 1;

    for (const [index, arc] of arcs.entries()) {
      const positions = arc.map(project);
      const start = positions[0];
      const end = positions.at(-1);
      const gradient = c.createLinearGradient(start.x, start.y, end.x, end.y);
      gradient.addColorStop(0, '#f2cf87');
      gradient.addColorStop(1, '#b0f3b796');
      c.strokeStyle = gradient;
      c.lineWidth = Math.max(1.2, radius * .006);
      c.beginPath();
      let connected = false;
      for (const p of positions) {
        const onFront = p.z > 0 || Math.hypot(p.x - centreX, p.y - centreY) > radius;
        if (onFront) {
          if (connected) c.lineTo(p.x, p.y);
          else c.moveTo(p.x, p.y);
        }
        connected = onFront;
      }
      c.stroke();
      const light = positions[Math.floor(((pulse + .22 * index) % 1) * (positions.length - 1))];
      if (light.z > 0 || Math.hypot(light.x - centreX, light.y - centreY) > radius) {
        c.fillStyle = '#f5e6ac';
        c.beginPath();
        c.arc(light.x, light.y, Math.max(1.65, radius * .011), 0, turn);
        c.fill();
      }
    }

    for (const [index, place] of [hub, ...destinations].entries()) {
      const marker = project(place);
      if (marker.z <= 0) continue;
      const markerRadius = Math.max(2, radius * (index === 0 ? .017 : .011));
      c.beginPath();
      c.arc(marker.x, marker.y, markerRadius + 3, 0, turn);
      c.lineWidth = 1;
      c.strokeStyle = '#e9c68278';
      c.stroke();
      c.beginPath();
      c.arc(marker.x, marker.y, markerRadius, 0, turn);
      c.fillStyle = index === 0 ? '#ffe6a6' : '#a4ebbf';
      c.fill();
    }
  }

  function resize() {
    const size = canvas.getBoundingClientRect();
    width = size.width;
    height = size.height;
    if (!width || !height) return;
    const density = Math.min(window.devicePixelRatio || 1, 1.65);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    context.setTransform(density, 0, 0, density, 0, 0);
    radius = Math.min(width, height) * .387;
    centreX = width * .50;
    centreY = height * .48;
    render();
    scene.dataset.globeReady = '';
  }

  function schedule() {
    if (mode !== 'paused' && visible && !document.hidden && !frameId) {
      frameId = requestAnimationFrame(animate);
    }
  }

  function animate(now) {
    frameId = 0;
    if (mode === 'paused' || !visible || document.hidden) return;
    if (!previousTime) previousTime = now;
    const step = now - previousTime;
    if (step >= 30) {
      previousTime = now;
      const change = Math.min(step, 80);
      elapsed += change;
      angle += change * .000053;
      pulse = (pulse + change / 4400) % 1;
      render();
    }
    if (mode === 'intro' && elapsed >= introductoryMotion) setMotion('paused');
    else schedule();
  }

  function setMotion(next) {
    mode = next;
    previousTime = 0;
    elapsed = 0;
    const playing = mode !== 'paused';
    toggle.textContent = playing ? 'Pause globe' : 'Play globe';
    if (playing) schedule();
    else if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

  toggle.addEventListener('click', () => setMotion(mode === 'paused' ? 'manual' : 'paused'));
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) setMotion('paused');
  });
  document.addEventListener('visibilitychange', () => {
    previousTime = 0;
    schedule();
  });

  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      previousTime = 0;
      schedule();
    }).observe(scene);
  } else {
    visible = true;
  }
  toggle.hidden = false;
  setMotion(motionPreference.matches ? 'paused' : 'intro');
})();
