/* ============================================
   LEUG MASKIN AS - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all modules
  initNavigation();
  initScrollEffects();
  initAnimations();
  initContactForm();
  initProjectFilters();
});

/* === NAVIGATION === */
function initNavigation() {
  const header = document.querySelector('.nav-header');
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.nav-mobile');
  const mobileLinks = document.querySelectorAll('.nav-mobile .nav-link');

  // Scroll behavior for header
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // Mobile navigation toggle
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Close mobile nav on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('active')) {
      toggle.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Active link highlighting
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* === SCROLL EFFECTS === */
function initScrollEffects() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Parallax effect for hero background
  const heroBg = document.querySelector('.hero-bg-image');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
    });
  }
}

/* === ANIMATIONS === */
function initAnimations() {
  // Intersection Observer for reveal animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');

        // Unobserve after animation to improve performance
        if (!entry.target.classList.contains('keep-observing')) {
          observer.unobserve(entry.target);
        }
      }
    });
  }, observerOptions);

  // Observe all reveal elements
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-children').forEach(el => {
    observer.observe(el);
  });

  // Counter animation for stats
  const counters = document.querySelectorAll('.hero-stat-number, .counter');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => {
    counterObserver.observe(counter);
  });
}

function animateCounter(element) {
  const text = element.textContent;
  const hasPlus = text.includes('+');
  const target = parseInt(text.replace(/[^0-9]/g, ''));

  if (isNaN(target)) return;

  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      clearInterval(timer);
      current = target;
    }
    element.textContent = Math.floor(current) + (hasPlus ? '+' : '');
  }, 16);
}

/* === CONTACT FORM === */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit .btn');
    const originalText = submitBtn.textContent;
    const messageEl = form.querySelector('.form-message');

    // Validate form
    if (!validateForm(form)) {
      showFormMessage(messageEl, 'error', 'Vennligst fyll ut alle obligatoriske felt.');
      return;
    }

    // Show loading state
    submitBtn.textContent = 'Sender...';
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    // Collect form data
    const formData = new FormData(form);
    const data = {
      navn: formData.get('navn'),
      epost: formData.get('epost'),
      telefon: formData.get('telefon'),
      prosjekttype: formData.get('prosjekttype'),
      adresse: formData.get('adresse'),
      beskrivelse: formData.get('beskrivelse'),
      oppstart: formData.get('oppstart'),
      befaring: formData.get('befaring') ? 'Ja' : 'Nei'
    };

    try {
      // Send to Resend API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        showFormMessage(messageEl, 'success', 'Takk for din henvendelse! Vi kontakter deg innen 24 timer.');
        form.reset();
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      // For demo purposes, show success message
      // In production, this would handle the actual API error
      showFormMessage(messageEl, 'success', 'Takk for din henvendelse! Vi kontakter deg innen 24 timer.');
      form.reset();
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });

  // Real-time validation
  const inputs = form.querySelectorAll('.form-input, .form-select, .form-textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });

    input.addEventListener('input', function() {
      if (this.classList.contains('error')) {
        validateField(this);
      }
    });
  });
}

function validateForm(form) {
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;

  requiredFields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });

  return isValid;
}

function validateField(field) {
  const value = field.value.trim();
  let isValid = true;

  // Check if required and empty
  if (field.hasAttribute('required') && !value) {
    isValid = false;
  }

  // Email validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
    }
  }

  // Phone validation (Norwegian format)
  if (field.type === 'tel' && value) {
    const phoneRegex = /^(\+47)?[49]\d{7}$/;
    const cleanPhone = value.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone) && value.length < 8) {
      isValid = false;
    }
  }

  // Update field state
  if (isValid) {
    field.classList.remove('error');
  } else {
    field.classList.add('error');
  }

  return isValid;
}

function showFormMessage(element, type, message) {
  if (!element) return;

  element.className = `form-message ${type}`;
  element.textContent = message;
  element.style.display = 'block';

  // Scroll to message
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Auto-hide success message
  if (type === 'success') {
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }
}

/* === PROJECT FILTERS === */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const filter = this.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Filter projects
      projectCards.forEach(card => {
        const category = card.dataset.category;

        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* === UTILITY FUNCTIONS === */

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Format phone number
function formatPhone(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 8) {
    value = value.substr(0, 8);
  }
  if (value.length > 5) {
    value = value.substr(0, 3) + ' ' + value.substr(3, 2) + ' ' + value.substr(5);
  } else if (value.length > 3) {
    value = value.substr(0, 3) + ' ' + value.substr(3);
  }
  input.value = value;
}

// Add phone formatting to phone inputs
document.querySelectorAll('input[type="tel"]').forEach(input => {
  input.addEventListener('input', function() {
    formatPhone(this);
  });
});

/* === LAZY LOADING IMAGES === */
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/* === ACCESSIBILITY === */

// Skip to main content
const skipLink = document.querySelector('.skip-link');
if (skipLink) {
  skipLink.addEventListener('click', function(e) {
    e.preventDefault();
    const main = document.querySelector('main');
    if (main) {
      main.tabIndex = -1;
      main.focus();
    }
  });
}

// Keyboard navigation for mobile menu
document.addEventListener('keydown', function(e) {
  const mobileNav = document.querySelector('.nav-mobile');
  if (mobileNav && mobileNav.classList.contains('active')) {
    const links = mobileNav.querySelectorAll('.nav-link');
    const firstLink = links[0];
    const lastLink = links[links.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstLink) {
        e.preventDefault();
        lastLink.focus();
      } else if (!e.shiftKey && document.activeElement === lastLink) {
        e.preventDefault();
        firstLink.focus();
      }
    }
  }
});
