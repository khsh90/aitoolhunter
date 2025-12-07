/**
 * Custom hook for scroll-triggered animations
 * Similar to Gamma.site animation system
 */

import { useEffect } from 'react';

export function useScrollAnimation() {
  useEffect(() => {
    // Trigger load animations immediately
    const loadAnimations = () => {
      const elementsToAnimate = document.querySelectorAll('.animate-on-load');
      elementsToAnimate.forEach((element) => {
        element.classList.add('animated');
      });
    };

    // Trigger scroll animations when elements come into view
    const handleScroll = () => {
      const scrollElements = document.querySelectorAll('.animate-on-scroll:not(.animated)');

      scrollElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        // Trigger animation when element is 80% visible
        const triggerPoint = windowHeight * 0.8;

        if (rect.top < triggerPoint && rect.bottom > 0) {
          element.classList.add('animated');
        }
      });
    };

    // Run load animations after a small delay to ensure content is rendered
    const loadTimer = setTimeout(loadAnimations, 100);

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check for elements already in view
    handleScroll();

    // Cleanup
    return () => {
      clearTimeout(loadTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}

export default useScrollAnimation;
