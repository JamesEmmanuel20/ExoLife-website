/* ===================================================================== */
/* EXOLIFE: BEYOND OUR SUN - WORLDS GALLERY & PROCEDURAL CANVAS ENGINE   */
/* ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('exoplanets-grid');
  const loadingState = document.getElementById('worlds-loading-state');
  const searchInput = document.getElementById('worlds-search-input');
  const filterChips = document.querySelectorAll('.filter-chip');
  
  const modal = document.getElementById('planet-compare-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalSendBuilderBtn = document.getElementById('modal-send-builder-btn');

  if (!gridContainer) return; // Exit if not on worlds page

  let exoplanetsDatabase = [];
  let currentActivePlanet = null;

  // ===================================================================== */
  // 1. PROCEDURAL PLANET CANVAS GENERATION ENGINE                         */
  // ===================================================================== */
  function drawProceduralPlanet(canvas, visualType, planetName) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = width * 0.38;

    ctx.clearRect(0, 0, width, height);

    // Outer Atmosphere Glow
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.3);
    glow.addColorStop(0, getAtmosphereGlowColor(visualType));
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // Planet Base Sphere Clipping Mask
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Planet Surface Gradient
    const baseGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
    
    if (visualType === 'rocky-earth') {
      baseGrad.addColorStop(0, '#38bdf8');
      baseGrad.addColorStop(0.5, '#1e3a8a');
      baseGrad.addColorStop(1, '#070913');
    } else if (visualType.includes('ocean')) {
      baseGrad.addColorStop(0, '#0284c7');
      baseGrad.addColorStop(0.6, '#0369a1');
      baseGrad.addColorStop(1, '#0f172a');
    } else if (visualType === 'hot-jupiter' || visualType === 'gas-giant' || visualType === 'sub-neptune') {
      baseGrad.addColorStop(0, '#f97316');
      baseGrad.addColorStop(0.5, '#b45309');
      baseGrad.addColorStop(1, '#451a03');
    } else if (visualType === 'ice-world') {
      baseGrad.addColorStop(0, '#93c5fd');
      baseGrad.addColorStop(0.5, '#3b82f6');
      baseGrad.addColorStop(1, '#1e3a8a');
    } else {
      baseGrad.addColorStop(0, '#f87171');
      baseGrad.addColorStop(0.6, '#b91c1c');
      baseGrad.addColorStop(1, '#450a0a');
    }

    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // Add Swirling Cloud / Surface Bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx - 10, cy - 15, radius * 0.9, radius * 0.3, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx + 15, cy + 20, radius * 0.8, valForSeed(planetName) * 0.25, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 3D Terminator Shadow (Crescent Shading)
    const shadowGrad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
    shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = shadowGrad;
    ctx.fill();
    ctx.restore();
  }

  function getAtmosphereGlowColor(type) {
    if (type === 'rocky-earth') return 'rgba(56, 189, 248, 0.35)';
    if (type.includes('ocean')) return 'rgba(14, 165, 233, 0.4)';
    if (type.includes('jupiter') || type.includes('gas')) return 'rgba(249, 115, 22, 0.4)';
    if (type.includes('ice')) return 'rgba(147, 197, 253, 0.35)';
    return 'rgba(239, 68, 68, 0.35)';
  }

  function valForSeed(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
    return (hash % 20) + 10;
  }

  // ===================================================================== */
  // 2. FETCH DATASET WITH GLOBAL 50-PLANET FALLBACK                       */
  // ===================================================================== */
  async function loadExoplanetData() {
    try {
      const response = await fetch('assets/data/exoplanets.json');
      if (!response.ok) throw new Error('Network response failed');
      exoplanetsDatabase = await response.json();
    } catch (error) {
      console.warn('Live JSON fetch unavailable (likely file:// protocol restriction). Loading global 50-planet fallback dataset.', error);
      exoplanetsDatabase = window.fallbackExoplanets || [];
    }
    renderGallery(exoplanetsDatabase);
  }

  // ===================================================================== */
  // 3. RENDER CATALOG GRID & CARDS                                        */
  // ===================================================================== */
  function renderGallery(planetsToRender) {
    gridContainer.innerHTML = '';
    if (planetsToRender.length === 0) {
      loadingState.style.display = 'flex';
      loadingState.querySelector('h2').textContent = 'No Exoplanets Found';
      loadingState.querySelector('p').textContent = 'Try adjusting your search query or category filter.';
      loadingState.querySelector('.empty-icon').textContent = '🔍';
      return;
    }

    loadingState.style.display = 'none';

    planetsToRender.forEach((planet) => {
      const card = document.createElement('article');
      card.className = 'exoplanet-catalog-card scroll-fade-in';
      
      let badgeClass = 'status-habitable';
      if (planet.status === 'Scorched') badgeClass = 'status-scorched';
      else if (planet.status === 'Frozen') badgeClass = 'status-frozen';
      else if (planet.status === 'Too Hot') badgeClass = 'status-toohot';

      card.innerHTML = `
        <div class="card-canvas-preview">
          <canvas width="90" height="90" data-visual="${planet.visualType}" data-name="${planet.name}"></canvas>
        </div>
        <div class="card-planet-info">
          <h3>${planet.name}</h3>
          <span class="card-star-tag">${planet.hostStar}</span>
          <span class="card-status-badge ${badgeClass}">${planet.status}</span>
        </div>
      `;

      // Draw procedural canvas inside card preview
      const cardCanvas = card.querySelector('canvas');
      drawProceduralPlanet(cardCanvas, planet.visualType, planet.name);

      // Open modal click handler
      card.addEventListener('click', () => {
        openComparisonModal(planet);
      });

      gridContainer.appendChild(card);
    });
  }

  // ===================================================================== */
  // 4. MODAL MANAGEMENT & EARTH COMPARISON                                */
  // ===================================================================== */
  function openComparisonModal(planet) {
    currentActivePlanet = planet;
    
    document.getElementById('modal-planet-name').textContent = planet.name;
    document.getElementById('modal-planet-star').textContent = planet.hostStar;
    document.getElementById('modal-radius').textContent = `${planet.radius} R⊕`;
    document.getElementById('modal-distance').textContent = `${planet.distance} Light-Years`;
    document.getElementById('modal-temp').textContent = `${planet.tempC} °C`;
    document.getElementById('modal-method').textContent = planet.discoveryMethod;
    document.getElementById('modal-planet-desc').textContent = planet.description;

    // Draw modal canvases
    const alienCanvas = document.getElementById('modal-planet-canvas');
    drawProceduralPlanet(alienCanvas, planet.visualType, planet.name);

    const earthCanvas = document.getElementById('modal-earth-canvas');
    drawProceduralPlanet(earthCanvas, 'rocky-earth', 'Earth');

    modal.showModal();
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => modal.close());
  }

  modal.addEventListener('click', (e) => {
    const dialogDimensions = modal.getBoundingClientRect();
    if (e.clientX < dialogDimensions.left || e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top || e.clientY > dialogDimensions.bottom) {
      modal.close();
    }
  });

  // Send to Planet Builder shortcut
  if (modalSendBuilderBtn) {
    modalSendBuilderBtn.addEventListener('click', () => {
      if (!currentActivePlanet) return;
      const simPayload = {
        name: currentActivePlanet.name,
        starType: currentActivePlanet.hostStar,
        radius: currentActivePlanet.radius,
        distance: Math.min(4.0, Math.max(0.2, currentActivePlanet.distance / 100)),
        atmosphere: currentActivePlanet.visualType.includes('ocean') ? 1.5 : 1.0,
        tempC: currentActivePlanet.tempC,
        status: currentActivePlanet.status,
        savedAt: new Date().toLocaleDateString()
      };
      localStorage.setItem('exolife_active_simulation_planet', JSON.stringify(simPayload));
      window.location.href = 'calculator.html';
    });
  }

  // ===================================================================== */
  // 5. SEARCH & FILTER LISTENERS                                          */
  // ===================================================================== */
  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const activeChip = document.querySelector('.filter-chip.active');
    const filterVal = activeChip ? activeChip.getAttribute('data-filter') : 'all';

    const filtered = exoplanetsDatabase.filter(planet => {
      const matchesSearch = planet.name.toLowerCase().includes(query) || planet.hostStar.toLowerCase().includes(query);
      const matchesCategory = filterVal === 'all' || planet.status === filterVal || planet.discoveryMethod === filterVal;
      return matchesSearch && matchesCategory;
    });

    renderGallery(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      filterChips.forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      applyFilters();
    });
  });

  // Initialize data load
  loadExoplanetData();
});