console.log("Website environment initialized successfully!");

document.addEventListener('DOMContentLoaded', () => {
  // Using GSAP from CDN, available globally
  gsap.registerPlugin(ScrollTrigger);
  // Topbar and Hero Height adjustments
  const stickyHeader = document.querySelector('.sticky-header');
  const mainHeader = document.querySelector('header');

  const adjustHeroHeight = () => {
    const topbar = document.querySelector('.topbar');
    let offset = 0;
    if (topbar) offset += topbar.offsetHeight;
    if (mainHeader) offset += mainHeader.offsetHeight;
    document.documentElement.style.setProperty('--header-offset', `${offset}px`);
  };

  // Function to update active background and contrast for sticky header
  const updateHeaderStyle = (bg, text) => {
    document.documentElement.style.setProperty('--active-bg', bg);
    if (text) document.documentElement.style.setProperty('--theme-text', text);

    // Toggle dark mode class if background is dark (text is white)
    const isDark = (text === '#ffffff' || bg === '#1a1a2e' || bg === '#FF4081');
    if (isDark) {
      stickyHeader.classList.add('is-dark');
    } else {
      stickyHeader.classList.remove('is-dark');
    }
  };

  window.addEventListener('resize', adjustHeroHeight);
  adjustHeroHeight();



  // Sticky Stacking Cards Logic
  const initStackingCards = (cardSelector, activeClass, inactiveClass, stickyTop, immediateTransition = false) => {
    const cards = document.querySelectorAll(cardSelector);
    if (cards.length === 0) return;

    cards.forEach((card, i) => {
      card.style.zIndex = i + 1;

      // Use ScrollTrigger to smoothly scale down the "past" card
      // as the "upcoming" card approaches its sticky position.
      if (i < cards.length - 1) {
        const nextCard = cards[i + 1];
        const cardHeight = card.offsetHeight;

        // Use the current card as trigger if immediateTransition is true
        const triggerEl = immediateTransition ? card : nextCard;
        const startPoint = immediateTransition ? `top ${stickyTop}px` : `top ${stickyTop + (cardHeight * 0.5)}px`;

        gsap.to(card, {
          scale: 0.8,
          opacity: 0,
          scrollTrigger: {
            trigger: triggerEl,
            start: startPoint,
            endTrigger: nextCard,
            end: `top ${stickyTop}px`,
            scrub: true
          }
        });
      }
    });

    const updateActiveCard = () => {
      let activeIndex = -1;
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        // A card is considered "active" if it has reached its sticky position
        if (rect.top <= stickyTop + 15) {
          activeIndex = i;
        }
      });

      cards.forEach((card, i) => {
        // Remove all state classes first
        card.classList.remove(activeClass, inactiveClass, 'card--past', 'card--upcoming');

        if (i === activeIndex) {
          card.classList.add(activeClass);
        } else if (i < activeIndex) {
          card.classList.add(inactiveClass);
          card.classList.add('card--past');
        } else {
          card.classList.add(inactiveClass);
          card.classList.add('card--upcoming');
        }

        // Handle dots if they exist
        const dots = card.querySelectorAll('.card-dot');
        dots.forEach((dot, di) => {
          if (di === activeIndex) dot.classList.add('card-dot--active');
          else dot.classList.remove('card-dot--active');
        });
      });
    };
    window.addEventListener('scroll', updateActiveCard, { passive: true });
    updateActiveCard();

    // Refresh ScrollTrigger to ensure calculations are correct after initial load
    ScrollTrigger.refresh();
  };

  // Use 64 for 4rem (16px * 4) and 80 for 5rem (16px * 5)
  initStackingCards('.usecase-card', 'usecase-card--active', 'usecase-card--inactive', 64, true);
  initStackingCards('.testimonial-card', 'testimonial-card--active', 'testimonial-card--inactive', 80, true);

  // --- STICKY HEADER LOGIC ---
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const mainHeaderBottom = mainHeader.offsetHeight + mainHeader.offsetTop;

    // Display sticky header ONLY when the original header is gone AND user scrolls UP
    if (currentScrollY > mainHeaderBottom + 100) {
      if (currentScrollY < lastScrollY) {
        // Scrolling UP - show
        stickyHeader.classList.add('visible');
      } else if (currentScrollY > lastScrollY + 10) {
        // Scrolling DOWN - hide (added 10px threshold to avoid sensitivity issues)
        stickyHeader.classList.remove('visible');
      }
    } else {
      // Near top - hide
      stickyHeader.classList.remove('visible');
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  // --- THEME & STICKY BG TRANSITIONS ---
  const root = document.documentElement;

  // Initial State (Hero)

  const tweenTheme = (vars, delay = 0) => gsap.to(root, { duration: 0.5, ease: 'power2.out', delay, ...vars });

  // Track the active background for the sticky header
  // We animate --active-bg directly in each ScrollTrigger to keep it seamless

  // Initial State (Hero)
  gsap.set(root, { '--active-bg': '#FDF6FA' });

  // Zone 0: Hero -> Create
  const trigger0 = document.querySelector('.gradient-transition-hero');
  if (trigger0) {
    ScrollTrigger.create({
      trigger: trigger0,
      start: 'top 10%', // fires when gradient is almost at the top — hero holds its color much longer
      onEnter: () => tweenTheme({ '--theme-bg': '#1A1A2E', '--theme-text': '#FFFFFF', '--theme-text-secondary': '#9CA3AF' }),
      onLeaveBack: () => {
        tweenTheme({ '--theme-bg': '#FDF6FA' }); // bg reverts immediately
        tweenTheme({ '--theme-text': '#1A1A2E', '--theme-text-secondary': '#475569' }, 0.25); // text follows
      },
    });
  }

  // Zone 1: Create -> Why Pick
  const trigger1 = document.querySelector('.gradient-transition-what-you-can-create');
  if (trigger1) {
    ScrollTrigger.create({
      trigger: trigger1,
      start: 'bottom 95%',
      onEnter: () => tweenTheme({ '--theme-1-bg': '#F4F8FF', '--theme-1-gradient-start': '#F4F8FF', '--theme-text': '#1A1A2E', '--theme-text-secondary': '#475569', '--theme-card-text': '#1A1A2E', '--theme-card-desc': '#64748B', '--theme-icon': '#64748B', '--theme-cta-bg': '#6D28D9', '--theme-cta-text': '#FFFFFF' }),
      onLeaveBack: () => {
        tweenTheme({ '--theme-1-bg': '#1A1A2E', '--theme-1-gradient-start': '#1A1A2E' });
        tweenTheme({ '--theme-text': '#FFFFFF', '--theme-text-secondary': '#9CA3AF', '--theme-card-text': '#FFFFFF' }, 0.25);
      },
    });
  }

  // Zone 2: Why Pick -> Testimonials
  const trigger2 = document.querySelector('.gradient-transition-why-pick');
  if (trigger2) {
    ScrollTrigger.create({
      trigger: trigger2,
      start: 'bottom 95%',
      onEnter: () => tweenTheme({ '--theme-2-bg': '#FDF6FA', '--theme-2-gradient-start': '#FDF6FA' }),
      onLeaveBack: () => tweenTheme({ '--theme-2-bg': '#F4F8FF', '--theme-2-gradient-start': '#F4F8FF' }),
    });
  }

  // Zone 3: Testimonials -> Distraction
  const trigger3 = document.querySelector('.gradient-transition-testimonials');
  if (trigger3) {
    ScrollTrigger.create({
      trigger: trigger3,
      start: 'bottom 95%',
      onEnter: () => tweenTheme({ '--theme-3-bg': '#FFE3E9', '--theme-3-gradient-start': '#FFE3E9' }),
      onLeaveBack: () => tweenTheme({ '--theme-3-bg': '#FDF6FA', '--theme-3-gradient-start': '#FDF6FA' }),
    });
  }

  // Zone 4: Science/Blog -> FAQ
  const trigger4 = document.querySelector('.gradient-transition-blog');
  if (trigger4) {
    ScrollTrigger.create({
      trigger: trigger4,
      start: 'bottom 95%',
      onEnter: () => tweenTheme({ '--theme-4-bg': '#FFFFFF', '--theme-4-gradient-start': '#FFFFFF' }),
      onLeaveBack: () => tweenTheme({ '--theme-4-bg': '#FFE3E9', '--theme-4-gradient-start': '#FFE3E9' }),
    });
  }

  // Initial state
  updateHeaderStyle('#FDF6FA', '#1e293b');

  // Hero Trigger
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    onEnter: () => updateHeaderStyle('#FDF6FA', '#1e293b'),
    onEnterBack: () => updateHeaderStyle('#FDF6FA', '#1e293b'),
  });



  // --- REVEAL ANIMATIONS ---
  const revealElements = document.querySelectorAll('.create-header, .why-pick-header, .testimonials-header, .science-header, .science-cta, .faq-header');
  revealElements.forEach(header => {
    const els = header.children;
    gsap.set(els, { y: 30, opacity: 0 });
    ScrollTrigger.create({
      trigger: header,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(els, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' });
      },
      once: true
    });
  });

  // --- DISTRACTION HEADER: scroll-driven per-character opacity ---
  const distractionHeader = document.querySelector('.distraction-header');
  if (distractionHeader) {
    const section = distractionHeader.closest('.distraction-section');
    const h2List = distractionHeader.querySelectorAll('h2');

    // Wrap each character in a span so we can animate opacity per character (works for any text length/content)
    function wrapCharactersInSpans(heading) {
      const text = heading.textContent;
      heading.textContent = '';
      for (const char of text) {
        const span = document.createElement('span');
        span.className = 'distraction-h2-char';
        span.textContent = char;
        span.style.opacity = '0.3';
        heading.appendChild(span);
      }
    }
    h2List.forEach(wrapCharactersInSpans);

    // Reveal non-h2 children (e.g. CTA) when header enters view
    const otherChildren = [...distractionHeader.children].filter(el => el.tagName !== 'H2');
    gsap.set(otherChildren, { y: 30, opacity: 0 });
    ScrollTrigger.create({
      trigger: distractionHeader,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(otherChildren, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' });
      },
      once: true
    });

    // Scroll-driven opacity: progress 0 when section bottom at 20% from bottom, 1 when section top at top
    ScrollTrigger.create({
      trigger: section || distractionHeader,
      start: 'bottom 80%',
      end: 'top top',
      onUpdate: (self) => {
        const progress = self.progress;
        h2List.forEach(h2 => {
          const chars = h2.querySelectorAll('.distraction-h2-char');
          const N = chars.length;
          chars.forEach((span, i) => {
            const sliceStart = i / N;
            const sliceEnd = (i + 1) / N;
            const localProgress = (progress - sliceStart) / (sliceEnd - sliceStart);
            const t = Math.max(0, Math.min(1, localProgress));
            span.style.opacity = (0.3 + 0.7 * t).toFixed(4);
          });
        });
      }
    });

  }

  // Staggered Blog Cards Reveal
  const blogGrid = document.querySelector('.blog-grid');
  if (blogGrid) {
    const cards = blogGrid.querySelectorAll('.blog-card');
    gsap.set(cards, { y: 40, opacity: 0 });
    ScrollTrigger.create({
      trigger: blogGrid,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(cards, { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out' });
      },
      once: true
    });
  }

  // --- INTERACTIVE ELEMENTS ---

  // FAQ Accordion
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      accordionItems.forEach(i => {
        i.classList.remove('active');
        const icon = i.querySelector('.ph');
        if (icon) { icon.classList.replace('ph-minus', 'ph-plus'); }
      });
      if (!isActive) {
        item.classList.add('active');
        const icon = item.querySelector('.ph');
        if (icon) { icon.classList.replace('ph-plus', 'ph-minus'); }
      }
    });
  });

  // Metric Counting
  const metrics = document.querySelectorAll('.metric-number');
  metrics.forEach(metric => {
    const target = parseFloat(metric.getAttribute('data-target'));
    const suffix = metric.getAttribute('data-suffix') || '';
    const obj = { value: 0 };
    ScrollTrigger.create({
      trigger: metric,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(obj, {
          value: target,
          duration: 1,
          ease: 'power2.out',
          onUpdate: () => {
            const val = target % 1 === 0 ? Math.floor(obj.value) : obj.value.toFixed(1);
            metric.textContent = val + suffix;
          }
        });
      },
      once: true
    });
  });

  // Video Hover Playback
  document.querySelectorAll('.video-thumbnail').forEach(thumb => {
    const video = thumb.querySelector('video');
    if (video) {
      thumb.addEventListener('mouseenter', () => {
        video.play().catch(err => console.log("Video interrupted:", err));
      });
      thumb.addEventListener('mouseleave', () => { video.pause(); });
    }
  });
});
