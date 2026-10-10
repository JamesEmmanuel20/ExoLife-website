/* ===================================================================== */
/* EXOLIFE: BEYOND OUR SUN - SCROLL STORYTELLING & OBSERVER TRIGGERS     */
/* ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const fadeElements = document.querySelectorAll('.scroll-fade-in');

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('appear');
          // Optional: Stop observing once faded in
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    fadeElements.forEach(element => {
      scrollObserver.observe(element);
    });
  } else {
    // Fallback for older browsers: make elements visible immediately
    fadeElements.forEach(element => {
      element.classList.add('appear');
    });
  }
});