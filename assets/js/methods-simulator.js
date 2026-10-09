/* ===================================================================== */
/* EXOLIFE: BEYOND OUR SUN - DETECTION METHODS INTERACTIVE SIMULATOR      */
/* ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.method-tab-btn');
  const sizeSlider = document.getElementById('sim-planet-size');
  const distSlider = document.getElementById('sim-orbital-dist');
  const valSize = document.getElementById('val-planet-size');
  const valDist = document.getElementById('val-orbital-dist');
  const detectorExplanation = document.getElementById('detector-explanation');
  const signalTitle = document.getElementById('signal-title');
  const signalCanvas = document.getElementById('detector-signal-canvas');

  if (!signalCanvas) return;

  let currentMethod = 'transit'; // 'transit' or 'radial'

  // Tab Switcher
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentMethod = e.target.getAttribute('data-method');

      if (currentMethod === 'transit') {
        signalTitle.textContent = 'Transit Light Curve Signal';
        detectorExplanation.textContent = 'Notice how a larger planet radius creates a deeper light dip during a stellar transit event!';
      } else {
        signalTitle.textContent = 'Radial Velocity Doppler Wobble Curve';
        detectorExplanation.textContent = 'Notice how closer orbital distance and larger mass increase the velocity amplitude of the star wobble!';
      }
      renderSignalSimulation();
    });
  });

  // Slider Listeners
  if (sizeSlider) {
    sizeSlider.addEventListener('input', () => {
      valSize.textContent = `${parseFloat(sizeSlider.value).toFixed(1)} R⊕`;
      renderSignalSimulation();
    });
  }

  if (distSlider) {
    distSlider.addEventListener('input', () => {
      valDist.textContent = `${parseFloat(distSlider.value).toFixed(2)} AU`;
      renderSignalSimulation();
    });
  }

  // Render Signal Curve on Canvas
  function renderSignalSimulation() {
    const ctx = signalCanvas.getContext('2d');
    const width = signalCanvas.width;
    const height = signalCanvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const planetSize = parseFloat(sizeSlider.value);
    const orbitalDist = parseFloat(distSlider.value);

    const points = [];
    const steps = width;

    if (currentMethod === 'transit') {
      // Transit Light Curve: Baseline 100% with a U-shaped dip in the center
      const dipDepth = Math.pow(planetSize, 2) * 0.035; // Deeper dip for larger radius

      for (let x = 0; x <= steps; x++) {
        let phase = (x / width) * Math.PI * 4 - Math.PI * 2; // -2pi to 2pi
        let flux = 1.0;

        // U-shaped transit dip around center phase
        if (Math.abs(phase) < 0.6) {
          flux -= dipDepth * Math.cos((phase / 0.6) * (Math.PI / 2));
        }

        let y = height - (flux * (height - 60) + 30);
        points.push({ x, y });
      }

      // Draw Transit Curve Line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // Fill underneath curve dip
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
      ctx.fillStyle = grad;
      ctx.fill();

    } else {
      // Radial Velocity Doppler Sine Wave
      // Amplitude increases with mass/size and closer distance
      const amplitude = (planetSize * 15) / Math.sqrt(orbitalDist);

      for (let x = 0; x <= steps; x++) {
        let t = (x / width) * Math.PI * 4;
        let velocity = amplitude * Math.sin(t);

        let y = (height / 2) - velocity;
        points.push({ x, y });
      }

      // Draw Velocity Sine Wave
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // Center axis line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Initial render
  renderSignalSimulation();
});