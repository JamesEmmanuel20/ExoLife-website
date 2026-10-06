/* ===================================================================== */
/* EXOLIFE: BEYOND OUR SUN - CANVAS SIMULATION & CALCULATOR ENGINE       */
/* ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('solar-system-canvas');
  if (!canvas) return; // Exit if not on the calculator page

  const ctx = canvas.getContext('2d');

  // DOM Input Elements
  const starTypeSelect = document.getElementById('star-type-select');
  const starDescription = document.getElementById('star-description');
  const planetRadiusSlider = document.getElementById('planet-radius-slider');
  const planetRadiusOutput = document.getElementById('planet-radius-output');
  const atmosphereSlider = document.getElementById('atmosphere-thickness-slider');
  const atmosphereOutput = document.getElementById('atmosphere-thickness-output');
  const orbitalDistanceSlider = document.getElementById('orbital-distance-slider');
  const orbitalDistanceOutput = document.getElementById('orbital-distance-output');

  // Telemetry & Verdict Elements
  const telemetryTemp = document.getElementById('telemetry-temp');
  const telemetryFlux = document.getElementById('telemetry-flux');
  const telemetryAtmosphere = document.getElementById('telemetry-atmosphere');
  const verdictBadge = document.getElementById('habitability-verdict-badge');
  const missionLogText = document.getElementById('mission-log-text');
  const savePlanetBtn = document.getElementById('save-planet-btn');

  // Star Definitions (Luminosity in Solar units, Temperature, Color, Habitable Zone Inner/Outer in AU)
  const starDatabase = {
    'm-dwarf': { name: 'M-Dwarf', luminosity: 0.05, color: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)', innerHz: 0.1, outerHz: 0.25, desc: 'Cool red star. Habitable zone is very close.' },
    'k-type':  { name: 'K-Type',  luminosity: 0.45, color: '#f97316', glow: 'rgba(249, 115, 22, 0.3)', innerHz: 0.5, outerHz: 0.85, desc: 'Stable orange star with a balanced habitable zone.' },
    'g-type':  { name: 'G-Type',  luminosity: 1.00, color: '#facc15', glow: 'rgba(250, 204, 21, 0.3)', innerHz: 0.95, outerHz: 1.37, desc: 'Sun-like yellow star. Standard Earth-like conditions.' },
    'f-type':  { name: 'F-Type',  luminosity: 2.50, color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.3)', innerHz: 1.5, outerHz: 2.2, desc: 'Hot white-yellow star. Habitable zone is much further out.' }
  };

  // Simulation State Object
  const simulationState = {
    starKey: 'k-type',
    planetRadius: 1.0,
    atmosphere: 1.0,
    orbitalDistance: 1.0,
    orbitAngle: 0
  };

  // Resize canvas to fit container high-DPI crispness
  function resizeCanvas() {
    const parentContainer = canvas.parentElement;
    canvas.width = parentContainer.clientWidth;
    canvas.height = parentContainer.clientHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Event Listeners for UI Inputs
  starTypeSelect.addEventListener('change', (e) => {
    simulationState.starKey = e.target.value;
    const selectedStar = starDatabase[simulationState.starKey];
    starDescription.textContent = selectedStar.desc;
    
    // Auto-adjust distance slider mid-point for UX convenience
    if (simulationState.starKey === 'm-dwarf') orbitalDistanceSlider.value = 0.2;
    if (simulationState.starKey === 'f-type') orbitalDistanceSlider.value = 1.8;
    simulationState.orbitalDistance = parseFloat(orbitalDistanceSlider.value);
    orbitalDistanceOutput.textContent = `${simulationState.orbitalDistance.toFixed(2)} AU`;
    
    updateCalculationsAndLog('star_changed');
  });

  planetRadiusSlider.addEventListener('input', (e) => {
    simulationState.planetRadius = parseFloat(e.target.value);
    planetRadiusOutput.textContent = `${simulationState.planetRadius.toFixed(1)} R⊕`;
  });

  atmosphereSlider.addEventListener('input', (e) => {
    simulationState.atmosphere = parseFloat(e.target.value);
    atmosphereOutput.textContent = `${simulationState.atmosphere.toFixed(1)} atm`;
    updateCalculationsAndLog('atmosphere_changed');
  });

  orbitalDistanceSlider.addEventListener('input', (e) => {
    simulationState.orbitalDistance = parseFloat(e.target.value);
    orbitalDistanceOutput.textContent = `${simulationState.orbitalDistance.toFixed(2)} AU`;
    updateCalculationsAndLog('distance_changed');
  });

  // Scientific Calculation Engine
  function computeAstrophysics() {
    const star = starDatabase[simulationState.starKey];
    
    // Stellar Flux formula: S = L / d^2
    const stellarFlux = star.luminosity / Math.pow(simulationState.orbitalDistance, 2);
    
    // Effective Temperature formula incorporating greenhouse warming from atmosphere
    // Base Stefan-Boltzmann equilibrium temperature adjusted for atmosphere factor
    const baseTemp = 279 * Math.pow(stellarFlux, 0.25);
    const greenhouseBoost = Math.pow(simulationState.atmosphere, 0.25) * 15;
    const surfaceTempKelvin = baseTemp + (simulationState.atmosphere > 0 ? greenhouseBoost : 0);
    const surfaceTempCelsius = surfaceTempKelvin - 273.15;

    // Habitability Verdict Logic (Liquid water range: ~200K to 330K roughly -73°C to 57°C)
    let habitabilityStatus = 'habitable'; // 'too-hot', 'habitable', 'too-cold'
    let orbitColor = '#10b981'; // Green
    let badgeClass = 'badge-green';
    let badgeText = 'Goldilocks Zone (Habitable)';

    if (simulationState.orbitalDistance < star.innerHz || surfaceTempKelvin > 330) {
      habitabilityStatus = 'too-hot';
      orbitColor = '#ef4444'; // Red
      badgeClass = 'badge-red';
      badgeText = 'Too Hot (Scorched)';
    } else if (simulationState.orbitalDistance > star.outerHz || surfaceTempKelvin < 200) {
      habitabilityStatus = 'too-cold';
      orbitColor = '#3b82f6'; // Blue
      badgeClass = 'badge-blue';
      badgeText = 'Too Cold (Frozen)';
    }

    return {
      flux: stellarFlux.toFixed(2),
      tempK: Math.round(surfaceTempKelvin),
      tempC: Math.round(surfaceTempCelsius),
      status: habitabilityStatus,
      orbitColor: orbitColor,
      badgeClass: badgeClass,
      badgeText: badgeText
    };
  }

  // Update Telemetry UI & Mission Logs
  function updateCalculationsAndLog(triggerType) {
    const results = computeAstrophysics();

    // Update DOM telemetry text
    telemetryTemp.textContent = `${results.tempK} K (${results.tempC}°C)`;
    telemetryFlux.textContent = `${results.flux} kW/m²`;
    
    if (simulationState.atmosphere === 0) {
      telemetryAtmosphere.textContent = 'Airless Vacuum';
    } else if (simulationState.atmosphere > 3.0) {
      telemetryAtmosphere.textContent = 'Extreme Greenhouse';
    } else {
      telemetryAtmosphere.textContent = 'Balanced Atmosphere';
    }

    // Update Verdict Badge
    verdictBadge.className = `verdict-badge ${results.badgeClass}`;
    verdictBadge.textContent = results.badgeText;

    // Dynamic Mission Computer Logs
    if (triggerType === 'star_changed') {
      missionLogText.textContent = `New host star acquired: ${starDatabase[simulationState.starKey].name}. Recalibrating Goldilocks boundaries.`;
    } else if (results.status === 'too-hot') {
      missionLogText.textContent = `Warning: High stellar flux detected! Surface water is evaporating into steam. Move orbit further out.`;
    } else if (results.status === 'too-cold') {
      missionLogText.textContent = `Telemetry alert: Planet is receiving insufficient radiation. Surface is freezing into global ice sheets.`;
    } else {
      missionLogText.textContent = `BINGO! Planetary parameters align within the Goldilocks zone. Stable liquid water chemistry is sustainable.`;
    }
  }

  // Main Render Loop for HTML5 Canvas
  function renderSimulation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const star = starDatabase[simulationState.starKey];
    const results = computeAstrophysics();

    // 1. Draw Goldilocks Zone Ring (Deep green translucent band)
    const maxDisplayScale = canvas.width < 600 ? 80 : 120;
    const innerHzRadius = star.innerHz * maxDisplayScale * 1.5;
    const outerHzRadius = star.outerHz * maxDisplayScale * 1.5;

    ctx.beginPath();
    ctx.arc(centerX, centerY, (innerHzRadius + outerHzRadius) / 2, 0, Math.PI * 2);
    ctx.lineWidth = outerHzRadius - innerHzRadius;
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.stroke();

    // Goldilocks outer border ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerHzRadius, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 2. Draw Planet Orbit Path (Color-coded based on habitability)
    const currentOrbitRadius = simulationState.orbitalDistance * maxDisplayScale * 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, currentOrbitRadius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = results.orbitColor;
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw Central Star with Glow Corona
    const starRadius = 24 + (star.luminosity * 4);
    
    // Corona glow gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, starRadius * 0.2, centerX, centerY, starRadius * 2.5);
    gradient.addColorStop(0, star.color);
    gradient.addColorStop(0.5, star.glow);
    gradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(centerX, centerY, starRadius * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Star Core
    ctx.beginPath();
    ctx.arc(centerX, centerY, starRadius, 0, Math.PI * 2);
    ctx.fillStyle = star.color;
    ctx.shadowColor = star.color;
    ctx.shadowBlur = 25;
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // 4. Calculate and Draw Orbiting Planet
    simulationState.orbitAngle += 0.008 / Math.sqrt(simulationState.orbitalDistance); // Keplerian-style orbital speed approximation
    const planetX = centerX + currentOrbitRadius * Math.cos(simulationState.orbitAngle);
    const planetY = centerY + currentOrbitRadius * Math.sin(simulationState.orbitAngle);
    const planetDisplayRadius = Math.max(5, simulationState.planetRadius * 6);

    // Planet body
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetDisplayRadius, 0, Math.PI * 2);
    ctx.fillStyle = simulationState.atmosphere > 3 ? '#38bdf8' : (results.status === 'habitable' ? '#34d399' : '#f87171');
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Request next animation frame
    requestAnimationFrame(renderSimulation);
  }

  // Initial calculation call & start animation loop
  updateCalculationsAndLog('star_changed');
  renderSimulation();

  // LocalStorage Save Handler for "Save Planet to Lab" button
  if (savePlanetBtn) {
    savePlanetBtn.addEventListener('click', () => {
      const results = computeAstrophysics();
      const customPlanet = {
        id: 'planet_' + Date.now(),
        name: `World-${Math.floor(Math.random() * 900) + 100}`,
        starType: starDatabase[simulationState.starKey].name,
        radius: simulationState.planetRadius,
        distance: simulationState.orbitalDistance,
        atmosphere: simulationState.atmosphere,
        tempC: results.tempC,
        status: results.badgeText,
        savedAt: new Date().toLocaleDateString()
      };

      let savedPlanets = JSON.parse(localStorage.getItem('exolife_custom_planets')) || [];
      savedPlanets.push(customPlanet);
      localStorage.setItem('exolife_custom_planets', JSON.stringify(savedPlanets));

      // Visual feedback
      const originalText = savePlanetBtn.textContent;
      savePlanetBtn.textContent = 'Planet Saved Successfully! ✓';
      savePlanetBtn.style.backgroundColor = '#10b981';
      setTimeout(() => {
        savePlanetBtn.textContent = originalText;
        savePlanetBtn.style.backgroundColor = '';
      }, 2000);
    });
  }
});