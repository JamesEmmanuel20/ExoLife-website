/* ===================================================================== */
/* EXOLIFE: BEYOND OUR SUN - SCROLLYTELLING & SPECTROSCOPY LABORATORY     */
/* ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const chapterCards = document.querySelectorAll('.scrolly-chapter-card');
  const scrollyContainer = document.querySelector('.scrolly-container');
  const viewportCanvas = document.getElementById('scrolly-visualizer-canvas');
  const viewportTitle = document.getElementById('viewport-title');
  const viewportCaption = document.getElementById('viewport-caption');

  // Spectroscopy elements
  const spectroscopyCanvas = document.getElementById('spectroscopy-graph-canvas');
  const toggleH2O = document.getElementById('toggle-h2o');
  const toggleCO2 = document.getElementById('toggle-co2');
  const toggleCH4 = document.getElementById('toggle-ch4');
  const toggleO3 = document.getElementById('toggle-o3');
  const biosphereStatusBadge = document.getElementById('biosphere-status-badge');
  const spectrumAnalysisText = document.getElementById('spectrum-analysis-text');

  let activeChapterIndex = 1;
  let animationFrameId = null;

  // ===================================================================== */
  // 1. SCROLLYTELLING CHAPTER OBSERVER & THEME SWITCHING                  */
  // ===================================================================== */
  const chapterObserverOptions = {
    root: null,
    rootMargin: '-25% 0px -45% 0px',
    threshold: 0.15
  };

  const chapterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        chapterCards.forEach(card => card.classList.remove('active-chapter'));
        entry.target.classList.add('active-chapter');
        
        activeChapterIndex = parseInt(entry.target.getAttribute('data-chapter'), 10);
        updateViewportMetadata(activeChapterIndex);

        // Apply dynamic thematic container class
        if (scrollyContainer) {
          scrollyContainer.className = `scrolly-container theme-${activeChapterIndex}`;
        }
      }
    });
  }, chapterObserverOptions);

  chapterCards.forEach(card => chapterObserver.observe(card));

  function updateViewportMetadata(chapterNum) {
    if (chapterNum === 1) {
      viewportTitle.textContent = 'Chapter 1: The Habitable Zone';
      viewportCaption.textContent = 'A blue world orbits peacefully inside the green "Goldilocks" sweet spot.';
    } else if (chapterNum === 2) {
      viewportTitle.textContent = 'Chapter 2: Choosing the Right Sun';
      viewportCaption.textContent = 'Comparing a sputtering, flare-prone red dwarf with a calm yellow sun.';
    } else if (chapterNum === 3) {
      viewportTitle.textContent = 'Chapter 3: Reading Starlight';
      viewportCaption.textContent = 'Starlight passes through an exoplanet atmosphere, leaving a spectral fingerprint.';
    } else if (chapterNum === 4) {
      viewportTitle.textContent = 'Chapter 4: Gravity & Air Retention';
      viewportCaption.textContent = 'Demonstrating how a planet’s mass helps it hold onto a protective atmosphere.';
    }
  }

  // 2. THEMATIC NARRATIVE VIEWPORT CANVAS ANIMATION ENGINE                */
  // ===================================================================== */
  function startViewportAnimation() {
    if (!viewportCanvas) return;
    const ctx = viewportCanvas.getContext('2d');
    let angle = 0;

    function render() {
      ctx.clearRect(0, 0, viewportCanvas.width, viewportCanvas.height);
      const cx = viewportCanvas.width / 2;
      const cy = viewportCanvas.height / 2;

      // Draw subtle starfield background across all chapters
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(cx - 120, cy - 80, 2, 2);
      ctx.fillRect(cx + 140, cy - 50, 1.5, 1.5);
      ctx.fillRect(cx - 90, cy + 90, 2, 2);
      ctx.fillRect(cx + 100, cy + 70, 1, 1);
      if (activeChapterIndex === 1) {
        // --- THEME 1: THE HABITABLE ZONE (Goldilocks Sweet Spot) ---
        // Center Star (Yellow Sun)
        const sunGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 32);
        sunGrad.addColorStop(0, '#fef08a');
        sunGrad.addColorStop(0.5, '#f59e0b');
        sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 32, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);
        ctx.fill();

        // 1. Inner Scorched Orbit (Too hot)
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 55, 0, Math.PI * 2);
        ctx.stroke();

        const innerPx = cx + Math.cos(-angle * 1.5) * 55;
        const innerPy = cy + Math.sin(-angle * 1.5) * 55;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(innerPx, innerPy, 5, 0, Math.PI * 2);
        ctx.fill();

        // 2. Habitable Zone (Emerald Green Goldilocks Sweet Spot)
        ctx.save();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(cx, cy, 100, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Habitable Zone Orbit Line
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 100, 0, Math.PI * 2);
        ctx.stroke();

        // Earth-like World in Habitable Zone
        const habPx = cx + Math.cos(angle) * 100;
        const habPy = cy + Math.sin(angle) * 100;

        // Atmosphere glow
        const habGlow = ctx.createRadialGradient(habPx, habPy, 6, habPx, habPy, 16);
        habGlow.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
        habGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = habGlow;
        ctx.beginPath();
        ctx.arc(habPx, habPy, 16, 0, Math.PI * 2);
        ctx.fill();

        // Planet body (Blue ocean + white clouds)
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(habPx, habPy, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(habPx - 3, habPy - 2, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 3. Outer Frozen Orbit (Too cold)
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 145, 0, Math.PI * 2);
        ctx.stroke();

        const outerPx = cx + Math.cos(angle * 0.6) * 145;
        const outerPy = cy + Math.sin(angle * 0.6) * 145;
        ctx.fillStyle = '#93c5fd';
        ctx.beginPath();
        ctx.arc(outerPx, outerPy, 7, 0, Math.PI * 2);
        ctx.fill();

      }
      else if (activeChapterIndex === 2) {
        // --- THEME 2: STELLAR FURNACES & FLARES (Red Dwarf Activity) ---
        // Agitated Red Dwarf Star (Center-Left)
        const starX = cx - 70;
        const starY = cy;
        
        const redStarGrad = ctx.createRadialGradient(starX, starY, 10, starX, starY, 40);
        redStarGrad.addColorStop(0, '#f87171');
        redStarGrad.addColorStop(0.7, '#dc2626');
        redStarGrad.addColorStop(1, 'rgba(153, 27, 27, 0)');
        ctx.fillStyle = redStarGrad;
        ctx.beginPath();
        ctx.arc(starX, starY, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.arc(starX, starY, 24, 0, Math.PI * 2);
        ctx.fill();

        // Dynamic Erupting Solar Flare Loops
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.6 + Math.sin(angle * 6) * 0.4})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(starX + 15, starY - 15);
        ctx.bezierCurveTo(starX + 60, starY - 90 - Math.sin(angle * 4) * 30, starX + 120, starY - 40, starX + 35, starY + 10);
        ctx.stroke();

        // Barren Planet getting hit by stellar wind
        const px = cx + 90;
        const py = cy + Math.sin(angle * 1.5) * 35;
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fill();

        // Solar wind particle streaks
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.lineWidth = 1.5;
        for (let i = -2; i <= 2; i++) {
          let yOffset = i * 15;
          ctx.beginPath();
          ctx.moveTo(starX + 35, starY + yOffset);
          ctx.lineTo(px - 10, py + yOffset + (i * 3));
          ctx.stroke();
        }

      } else if (activeChapterIndex === 3) {
        // --- THEME 3: TRANSMISSION SPECTROSCOPY (Starlight Barcode Fingerprints) ---
        // Exoplanet Centerpiece
        const planetX = cx;
        const planetY = cy;

        // Glowing Atmospheric Limb Ring
        const atmosGlow = ctx.createRadialGradient(planetX, planetY, 35, planetX, planetY, 52);
        atmosGlow.addColorStop(0, 'rgba(56, 189, 248, 0.0)');
        atmosGlow.addColorStop(0.7, 'rgba(56, 189, 248, 0.5)');
        atmosGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = atmosGlow;
        ctx.beginPath();
        ctx.arc(planetX, planetY, 52, 0, Math.PI * 2);
        ctx.fill();

        // Dark Planetary Silhouette
        ctx.fillStyle = '#070919';
        ctx.beginPath();
        ctx.arc(planetX, planetY, 38, 0, Math.PI * 2);
        ctx.fill();

        // Filtering Starlight Rays passing through the atmosphere limb
        for (let i = -3; i <= 3; i++) {
          let yPos = cy + (i * 18);
          let rayAlpha = 0.4 + Math.sin(angle * 3 + i) * 0.2;
          
          ctx.strokeStyle = `rgba(245, 158, 11, ${rayAlpha})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, yPos);
          // Bend light slightly around planet limb (refraction/absorption simulation)
          let bend = Math.abs(i) <= 1 ? (i * 8) : 0;
          ctx.lineTo(planetX - 45, yPos);
          ctx.lineTo(planetX + 45, yPos + bend);
          ctx.lineTo(viewportCanvas.width, yPos);
          ctx.stroke();
        }

      } else if (activeChapterIndex === 4) {
        // --- THEME 4: GRAVITATION & MASS (Deep Core Well & Retention) ---
        const coreX = cx;
        const coreY = cy;

        // Gravitational Grid Warping Lines
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.2)';
        ctx.lineWidth = 1;
        for (let gx = -120; gx <= 120; gx += 30) {
          ctx.beginPath();
          ctx.moveTo(coreX + gx, coreY - 100);
          ctx.lineTo(coreX + (gx * 0.4), coreY + (gx * 0.1));
          ctx.lineTo(coreX + gx, coreY + 100);
          ctx.stroke();
        }

        // Massive Super-Earth Core
        const coreGrad = ctx.createRadialGradient(coreX, coreY, 5, coreX, coreY, 40);
        coreGrad.addColorStop(0, '#818cf8');
        coreGrad.addColorStop(0.6, '#4f46e5');
        coreGrad.addColorStop(1, '#312e81');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(coreX, coreY, 36, 0, Math.PI * 2);
        ctx.fill();

        // Magnetic Shield Field Lines curving around the planet
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(coreX, coreY, 55 + Math.sin(angle * 2) * 4, 85, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(coreX, coreY, 75 + Math.cos(angle * 2) * 4, 110, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      angle += 0.025;
      animationFrameId = requestAnimationFrame(render);
    }

    render();
  }
  startViewportAnimation();

  // ===================================================================== */
  // 3. INTERACTIVE SPECTROSCOPY WIDGET GRAPH ENGINE                       */
  // ===================================================================== */
  // ===================================================================== */
  // 3. INTERACTIVE SPECTROSCOPY WIDGET: COMPELLING ABSORPTION BANDS       */
  // ===================================================================== */
  function renderSpectroscopyGraph() {
    if (!spectroscopyCanvas) return;
    const ctx = spectroscopyCanvas.getContext('2d');
    const width = spectroscopyCanvas.width;
    const height = spectroscopyCanvas.height;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw the vibrant optical spectrum gradient background (Infrared -> Visible -> UV)
    const spectrumGradient = ctx.createLinearGradient(0, 0, width, 0);
    spectrumGradient.addColorStop(0.00, '#7c2d12'); // Deep Infrared
    spectrumGradient.addColorStop(0.25, '#ea580c'); // Red / Orange
    spectrumGradient.addColorStop(0.45, '#eab308'); // Yellow / Green
    spectrumGradient.addColorStop(0.65, '#0ea5e9'); // Cyan / Blue
    spectrumGradient.addColorStop(0.85, '#6366f1'); // Violet
    spectrumGradient.addColorStop(1.00, '#a855f7'); // Ultraviolet

    ctx.fillStyle = spectrumGradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle scanline texture over the spectrum bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1);
    }

    // 2. Calculate and render molecular absorption bands (dark dips across wavelengths)
    const steps = width;
    for (let x = 0; x < steps; x++) {
      let wavelength = 0.5 + (x / width) * 4.5; // 0.5µm to 5.0µm
      let absorptionDepth = 0.0;

      // Water Vapor ($H_2O$) absorption signatures at 1.4µm and 1.9µm
      if (toggleH2O && toggleH2O.checked) {
        absorptionDepth += 0.85 * Math.exp(-Math.pow(wavelength - 1.4, 2) / 0.035);
        absorptionDepth += 0.95 * Math.exp(-Math.pow(wavelength - 1.9, 2) / 0.045);
      }

      // Carbon Dioxide ($CO_2$) absorption bands at 2.7µm and 4.3µm
      if (toggleCO2 && toggleCO2.checked) {
        absorptionDepth += 0.90 * Math.exp(-Math.pow(wavelength - 2.7, 2) / 0.05);
        absorptionDepth += 1.00 * Math.exp(-Math.pow(wavelength - 4.3, 2) / 0.04);
      }

      // Methane ($CH_4$) key biomarker features at 1.66µm and 2.3µm
      if (toggleCH4 && toggleCH4.checked) {
        absorptionDepth += 0.75 * Math.exp(-Math.pow(wavelength - 1.66, 2) / 0.025);
        absorptionDepth += 0.85 * Math.exp(-Math.pow(wavelength - 2.3, 2) / 0.035);
      }

      // Ozone ($O_3$) Chappuis ultraviolet shield band at 0.6µm
      if (toggleO3 && toggleO3.checked) {
        absorptionDepth += 0.70 * Math.exp(-Math.pow(wavelength - 0.6, 2) / 0.02);
      }

      // Cap absorption depth between 0 and 1
      absorptionDepth = Math.min(1.0, absorptionDepth);

      if (absorptionDepth > 0.02) {
        // Draw deep, glowing absorption band slice
        ctx.fillStyle = `rgba(7, 9, 19, ${absorptionDepth * 0.92})`;
        ctx.fillRect(x, 0, 2, height);

        // Add soft cyan neon inner glow on the edges of strong absorption lines
        if (absorptionDepth > 0.5) {
          ctx.fillStyle = `rgba(56, 189, 248, ${(absorptionDepth - 0.5) * 0.4})`;
          ctx.fillRect(x, 0, 1, height);
        }
      }
    }

    // 3. Draw Wavelength Scale Markers at the bottom of the spectrum bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    [1.0, 2.0, 3.0, 4.0].forEach(micron => {
      let markerX = ((micron - 0.5) / 4.5) * width;
      ctx.fillRect(markerX, height - 10, 1, 10);
      ctx.fillText(`${micron}µm`, markerX, height - 14);
    });

    updateSpectroscopyAnalysis();
  }

  function updateSpectroscopyAnalysis() {
    let activeGasesCount = 0;
    let descriptionParts = [];

    if (toggleH2O && toggleH2O.checked) {
      activeGasesCount++;
      descriptionParts.push('Water Vapor detected at 1.4µm & 1.9µm — signs of potential global hydration and clouds.');
    }
    if (toggleCO2 && toggleCO2.checked) {
      activeGasesCount++;
      descriptionParts.push('Carbon Dioxide verified at 2.7µm & 4.3µm — confirming a robust greenhouse atmosphere.');
    }
    if (toggleCH4 && toggleCH4.checked) {
      activeGasesCount++;
      descriptionParts.push('Methane signature observed — an exciting potential marker for organic or biological activity.');
    }
    if (toggleO3 && toggleO3.checked) {
      activeGasesCount++;
      descriptionParts.push('Ozone detected at 0.6µm — signaling photochemical oxygen interaction in the upper sky.');
    }

    if (activeGasesCount === 0) {
      biosphereStatusBadge.textContent = 'Atmosphere Status: Airless Baseline';
      biosphereStatusBadge.className = 'badge-neutral';
      spectrumAnalysisText.textContent = 'No atmospheric ingredients active. The starlight graph shows a flat line typical of an airless, barren rock.';
    } else if (activeGasesCount >= 3) {
      biosphereStatusBadge.textContent = 'Atmosphere Status: High Habitable Potential';
      biosphereStatusBadge.className = 'badge-success';
      spectrumAnalysisText.innerHTML = descriptionParts.join('<br>');
    } else {
      biosphereStatusBadge.textContent = 'Atmosphere Status: Moderate Volatile Retention';
      biosphereStatusBadge.className = 'badge-accent';
      spectrumAnalysisText.innerHTML = descriptionParts.join('<br>');
    }
  }

  [toggleH2O, toggleCO2, toggleCH4, toggleO3].forEach(checkbox => {
    if (checkbox) {
      checkbox.addEventListener('change', renderSpectroscopyGraph);
    }
  });

  renderSpectroscopyGraph();
});