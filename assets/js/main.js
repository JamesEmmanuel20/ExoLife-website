/* ===================================================================== */
/* EXOLIFE: BEYOND OUR SUN - GLOBAL MAIN JAVASCRIPT                      */
/* ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinksList = document.querySelector('.nav-links-list');

  if (mobileMenuToggle && navLinksList) {
    mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      
      // Toggle ARIA state and visual active classes
      mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
      navLinksList.classList.toggle('active');
    });

    // Close mobile menu when clicking any nav link
    const navItems = navLinksList.querySelectorAll('.nav-link-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        navLinksList.classList.remove('active');
      });
    });
  }
});