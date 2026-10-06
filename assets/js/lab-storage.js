/* ===================================================================== */
/* EXOLIFE: BEYOND OUR SUN - LOCALSTORAGE LAB CONTROLLER                 */
/* ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const planetsGrid = document.getElementById('saved-planets-grid');
  const emptyLabState = document.getElementById('empty-lab-state');
  const savedCountBadge = document.getElementById('saved-count-badge');
  const clearAllBtn = document.getElementById('clear-all-btn');

  if (!planetsGrid) return; // Exit if not on the lab page

  // Load saved planets from localStorage
  function loadSavedPlanets() {
    return JSON.parse(localStorage.getItem('exolife_custom_planets')) || [];
  }

  // Save updated planets array back to localStorage
  function savePlanetsToStorage(planetsArray) {
    localStorage.setItem('exolife_custom_planets', JSON.stringify(planetsArray));
    renderLabDashboard();
  }

  // Render the dashboard grid or empty state
  function renderLabDashboard() {
    const planets = loadSavedPlanets();
    planetsGrid.innerHTML = '';
    savedCountBadge.textContent = `${planets.length} World${planets.length === 1 ? '' : 's'} Saved`;

    if (planets.length === 0) {
      emptyLabState.style.display = 'flex';
      planetsGrid.style.display = 'none';
      if (clearAllBtn) clearAllBtn.style.display = 'none';
      return;
    }

    emptyLabState.style.display = 'none';
    planetsGrid.style.display = 'grid';
    if (clearAllBtn) clearAllBtn.style.display = 'inline-flex';

    planets.forEach((planet, index) => {
      const card = document.createElement('article');
      card.className = 'planet-lab-card scroll-fade-in';
      card.innerHTML = `
        <div class="card-top-row">
          <input type="text" class="planet-title-input" value="${planet.name}" data-id="${planet.id}" aria-label="Planet Name">
          <button class="delete-planet-btn" data-id="${planet.id}" aria-label="Delete saved planet">&times;</button>
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
          <span>Saved: ${planet.savedAt}</span>
        </div>
      `;

      planetsGrid.appendChild(card);
    });

    attachCardEventListeners();
  }

  // Attach event listeners for renaming and deleting individual planets
  function attachCardEventListeners() {
    // Rename input listener (updates name on blur or enter)
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