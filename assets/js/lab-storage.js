/* ===================================================================== */
/* EXOLIFE: BEYOND OUR SUN - LOCALSTORAGE LAB CONTROLLER (WITH SEARCH)   */
/* ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const planetsGrid = document.getElementById('saved-planets-grid');
  const emptyLabState = document.getElementById('empty-lab-state');
  const savedCountBadge = document.getElementById('saved-count-badge');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const searchInput = document.getElementById('lab-search-input');

  if (!planetsGrid) return; // Exit if not on the lab page

  // Load saved planets from localStorage
  function loadSavedPlanets() {
    return JSON.parse(localStorage.getItem('exolife_custom_planets')) || [];
  }

  // Save updated planets array back to localStorage
  function savePlanetsToStorage(planetsArray) {
    localStorage.setItem('exolife_custom_planets', JSON.stringify(planetsArray));
    renderLabDashboard(searchInput ? searchInput.value : '');
  }

  // Render the dashboard grid or empty state with optional search filter
  function renderLabDashboard(filterQuery = '') {
    const planets = loadSavedPlanets();
    savedCountBadge.textContent = `${planets.length} World${planets.length === 1 ? '' : 's'} Saved`;

    if (planets.length === 0) {
      emptyLabState.style.display = 'flex';
      planetsGrid.style.display = 'none';
      if (clearAllBtn) clearAllBtn.style.display = 'none';
      if (searchInput) searchInput.parentElement.style.display = 'none';
      return;
    }

    if (searchInput) searchInput.parentElement.style.display = 'block';

    // Filter planets based on search query
    const query = filterQuery.toLowerCase().trim();
    const filteredPlanets = planets.filter(planet => 
      planet.name.toLowerCase().includes(query) || 
      planet.starType.toLowerCase().includes(query) ||
      planet.status.toLowerCase().includes(query)
    );

    planetsGrid.innerHTML = '';

    if (filteredPlanets.length === 0) {
      planetsGrid.style.display = 'none';
      // Show temporary no-results notice inside empty state or grid area
      emptyLabState.style.display = 'flex';
      emptyLabState.querySelector('h2').textContent = 'No Worlds Match Your Search';
      emptyLabState.querySelector('p').textContent = `No saved planets matched "${filterQuery}". Try searching for a different name or star type.`;
      emptyLabState.querySelector('a').style.display = 'none';
      return;
    }

    // Reset empty state text in case it was modified by search
    emptyLabState.querySelector('h2').textContent = 'Your Laboratory is Empty';
    emptyLabState.querySelector('p').textContent = "You haven't saved any custom worlds yet. Head over to the Planet Builder simulator, tweak stellar parameters, and save your favorite discoveries here!";
    emptyLabState.querySelector('a').style.display = 'inline-flex';

    emptyLabState.style.display = 'none';
    planetsGrid.style.display = 'grid';
    if (clearAllBtn) clearAllBtn.style.display = 'inline-flex';

    filteredPlanets.forEach((planet) => {
      const card = document.createElement('article');
      card.className = 'planet-lab-card scroll-fade-in clickable-card';
      card.setAttribute('title', 'Click to view this planet in the simulator');
      card.innerHTML = `
        <div class="card-top-row">
          <input type="text" class="planet-title-input" value="${planet.name}" data-id="${planet.id}" aria-label="Planet Name" onclick="event.stopPropagation()">
          <button class="delete-planet-btn" data-id="${planet.id}" aria-label="Delete saved planet" onclick="event.stopPropagation()">&times;</button>
        </div>
        
        <ul class="planet-specs-list">
          <li><span>Host Star:</span> <strong>${planet.starType}</strong></li>
          <li><span>Planet Radius:</span> <strong>${planet.radius} R⊕</strong></li>
          <li><span>Orbital Distance:</span> <strong>${planet.distance} AU</strong></li>
          <li><span>Atmosphere:</span> <strong>${planet.atmosphere} atm</strong></li>
          <li><span>Surface Temp:</span> <strong>${planet.tempC}°C</strong></li>
        </ul>

        <div class="card-footer-row">
          <span class="verdict-status">${planet.status}</span>
        </div>

        <button class="secondary-action-button card-launch-btn">
          Launch in Simulator &rarr;
        </button>
      `;

      // Card click event to load into simulator and redirect
      card.addEventListener('click', () => {
        localStorage.setItem('exolife_active_simulation_planet', JSON.stringify(planet));
        window.location.href = 'calculator.html';
      });

      planetsGrid.appendChild(card);
    });

    attachCardEventListeners();
  }

  // Attach event listeners for renaming, deleting, and searching
  function attachCardEventListeners() {
    // Rename input listener
    const titleInputs = planetsGrid.querySelectorAll('.planet-title-input');
    titleInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const newName = e.target.value.trim() || 'Unnamed World';
        let planets = loadSavedPlanets();
        
        planets = planets.map(p => p.id === id ? { ...p, name: newName } : p);
        localStorage.setItem('exolife_custom_planets', JSON.stringify(planets));
      });
    });

    // Delete button listener
    const deleteButtons = planetsGrid.querySelectorAll('.delete-planet-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        let planets = loadSavedPlanets();
        planets = planets.filter(p => p.id !== id);
        savePlanetsToStorage(planets);
      });
    });
  }

  // Search input live filter listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderLabDashboard(e.target.value);
    });
  }

  // Clear All button listener
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete all saved planets from your lab?')) {
        localStorage.removeItem('exolife_custom_planets');
        renderLabDashboard();
      }
    });
  }

  // Initial render call on page load
  renderLabDashboard();
});