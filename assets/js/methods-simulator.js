/* ===================================================================== */
/* EXOLIFE: BEYOND OUR SUN - TRANSIT SIMULATOR & CONTINUOUS WAVE ENGINE  */
/* ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const transitCanvas = document.getElementById('transit-animation-canvas');
  const lightCurveCanvas = document.getElementById('light-curve-canvas');
  
  const planetSizeSlider = document.getElementById('planet-size-slider');
  const planetSizeVal = document.getElementById('planet-size-val');
  const orbitSpeedSlider = document.getElementById('orbit-speed-slider');
  const orbitSpeedVal = document.getElementById('orbit-speed-val');
  
  const statDepth = document.getElementById('stat-depth');
  const statFrequency = document.getElementById('stat-frequency');

  if (!transitCanvas || !lightCurveCanvas) return;

  const transitCtx = transitCanvas.getContext('2d');
  const lightCtx = lightCurveCanvas.getContext('2d');

  let animationTime = 0;

  // Parameters
  let planetRadius = parseFloat(planetSizeSlider.value); // 0.6 to 3.0
  let orbitSpeed = parseFloat(orbitSpeedSlider.value);     // 0.4 to 2.5

  // Slider event listeners
  planetSizeSlider.addEventListener('input', (e) => {
    planetRadius = parseFloat(e.target.value);
    planetSizeVal.textContent = `${planetRadius.toFixed(1)} R⊕`;
    updateTelemetry();
  });

  orbitSpeedSlider.addEventListener('input', (e) => {
    orbitSpeed = parseFloat(e.target.value);
    orbitSpeedVal.textContent = `${orbitSpeed.toFixed(1)}x`;
    statFrequency.textContent = orbitSpeed > 1.5 ? 'Rapid' : orbitSpeed < 0.8 ? 'Slow' : 'Standard';
  });

  function updateTelemetry() {
    // Transit depth proportional to (Rp / Rstar)^2
    let relativeRadius = planetRadius / 3.0; // scaled
    let depthPercent = (Math.pow(relativeRadius, 2) * 2.5).toFixed(2);
    statDepth.textContent = `${depthPercent}%`;
  }

  updateTelemetry();

  // ===================================================================== */
  // SIMULATION ANIMATION LOOP                                           */
  // ===================================================================== */
  function runSimulation() {
    const tWidth = transitCanvas.width;
    const tHeight = transitCanvas.height;
    const lWidth = lightCurveCanvas.width;
    const lHeight = lightCurveCanvas.height;

    // --- 1. RENDER STAR & TRANSITING PLANET (Canvas 1) ---
    transitCtx.clearRect(0, 0, tWidth, tHeight);

    const starCx = tWidth / 2;
    const starCy = tHeight / 2;
    const starRadius = 50;

    // Draw Star with radiant glow
    const starGrad = transitCtx.createRadialGradient(starCx, starCy, 10, starCx, starCy, starRadius);
    starGrad.addColorStop(0, '#fef08a');
    starGrad.addColorStop(0.7, '#f59e0b');
    starGrad.addColorStop(1, 'rgba(245, 158, 11, 0.2)');
    transitCtx.fillStyle = starGrad;
    transitCtx.beginPath();
    transitCtx.arc(starCx, starCy, starRadius, 0, Math.PI * 2);
    transitCtx.fill();

    // Calculate Planet Orbital Position across star disk
    // Orbit period scaled by orbitSpeed
    let cycle = (animationTime * orbitSpeed * 0.015) % (Math.PI * 2);
    // Map cycle to horizontal x position across star (-90 to +90 pixels)
    let planetOffsetX = Math.sin(cycle) * 90; 
    let planetPx = starCx + planetOffsetX;
    let planetPy = starCy + 5; // slight tilt

    // Actual drawn radius scaled from R_earth
    let drawnPlanetRadius = planetRadius * 4.5;

    // Check if planet is transiting across the star disk (for dimming calculation)
    let isTransiting = Math.abs(planetOffsetX) < (starRadius + drawnPlanetRadius * 0.5);

    // Draw Planet
    transitCtx.fillStyle = '#0f172a';
    transitCtx.beginPath();
    transitCtx.arc(planetPx, planetPy, drawnPlanetRadius, 0, Math.PI * 2);
    transitCtx.fill();

    // Planet atmospheric rim highlight
    transitCtx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    transitCtx.lineWidth = 1.5;
    transitCtx.beginPath();
    transitCtx.arc(planetPx, planetPy, drawnPlanetRadius, 0, Math.PI * 2);
    transitCtx.stroke();


    // --- 2. RENDER CONTINUOUS LIGHT CURVE WAVEFORM (Canvas 2) ---
    lightCtx.clearRect(0, 0, lWidth, lHeight);

    // Draw background grid
    lightCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    lightCtx.lineWidth = 1;
    for (let x = 0; x < lWidth; x += 40) {
      lightCtx.beginPath();
      lightCtx.moveTo(x, 0);
      lightCtx.lineTo(x, lHeight);
      lightCtx.stroke();
    }
    for (let y = 0; y < lHeight; y += 40) {
      lightCtx.beginPath();
      lightCtx.moveTo(0, y);
      lightCtx.lineTo(lWidth, y);
      lightCtx.stroke();
    }

    // Baseline 100% brightness line
    let baselineY = 40;
    lightCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    lightCtx.setLineDash([4, 4]);
    lightCtx.beginPath();
    lightCtx.moveTo(0, baselineY);
    lightCtx.lineTo(lWidth, baselineY);
    lightCtx.stroke();
    lightCtx.setLineDash([]);

    // Plot continuous light curve waveform across time
    lightCtx.strokeStyle = '#38bdf8';
    lightCtx.lineWidth = 2.5;
    lightCtx.beginPath();

    const wavePoints = [];
    for (let x = 0; x <= lWidth; x += 2) {
      // Time coordinate shifting with animationTime
      let timeCoord = (x + animationTime * orbitSpeed * 1.5) * 0.03;
      
      // Periodic transit dip function using cosine wave power
      let relativeRadius = planetRadius / 3.0;
      let dipDepth = Math.pow(relativeRadius, 2) * 35; // Amplitude of dip
      
      // Shape the dip into a flat-bottomed U-shape transit curve
      let waveVal = Math.cos(timeCoord);
      let dip = 0;
      if (waveVal > 0.85) {
        let normalized = (waveVal - 0.85) / 0.15;
        dip = dipDepth * normalized;
      }

      let y = baselineY + dip;
      wavePoints.push({ x, y });
    }

    wavePoints.forEach((pt, index) => {
      if (index === 0) lightCtx.moveTo(pt.x, pt.y);
      else lightCtx.lineTo(pt.x, pt.y);
    });
    lightCtx.stroke();

    // Fill gradient under waveform
    lightCtx.lineTo(lWidth, lHeight);
    lightCtx.lineTo(0, lHeight);
    lightCtx.closePath();
    const waveGrad = lightCtx.createLinearGradient(0, 0, 0, lHeight);
    waveGrad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
    waveGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    lightCtx.fillStyle = waveGrad;
    lightCtx.fill();

    // Draw live scanning head indicator on light curve matching current animation time
    let scanX = (animationTime * orbitSpeed * 1.5) % lWidth;
    lightCtx.fillStyle = '#10b981';
    lightCtx.beginPath();
    lightCtx.arc(scanX, baselineY + (isTransiting ? Math.pow(planetRadius/3.0, 2)*35 : 0), 4, 0, Math.PI * 2);
    lightCtx.fill();

    animationTime++;
    requestAnimationFrame(runSimulation);
  }

  runSimulation();
});