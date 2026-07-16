/* ==========================================================================
   ANIMATIONS — GLOBAL INIT
   Requires:
   - GSAP
   - ScrollTrigger (optional, required for scroll animations)
========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined") {
    console.warn("[Animations] GSAP is missing.");
    return;
  }

  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  const EASE = "power4.out";

  initButtonCharacterStagger();
  initRodButtons();
  initLoadAnimations(EASE);
  initLoadingAnimations(EASE);
  initNavbar(EASE);
  initNavbarScrollState();
  initScrollAnimations(EASE);
});

/* ==========================================================================
   1. BUTTON CHARACTER STAGGER
   Usage:
   <span data-button-animate-chars>Discover</span>
========================================================================== */

function initButtonCharacterStagger() {
  const elements = document.querySelectorAll("[data-button-animate-chars]");
  const delayStep = 0.012;

  elements.forEach((element) => {
    if (element.dataset.charsReady === "true") return;

    const text = element.textContent;
    element.innerHTML = "";

    [...text].forEach((character, index) => {
      const span = document.createElement("span");

      span.textContent = character === " " ? "\u00A0" : character;
      span.style.transitionDelay = `${index * delayStep}s`;

      element.appendChild(span);
    });

    element.dataset.charsReady = "true";
  });
}

/* ==========================================================================
   2. BUTTON ROD HOVER
   Expected structure:
   .btn--wrapper
     .btn--rod
     p
========================================================================== */

function initRodButtons() {
  if (window.matchMedia("(hover: none)").matches) return;

  document.querySelectorAll(".btn--wrapper").forEach((button) => {
    const rod = button.querySelector(".btn--rod");
    const text = button.querySelector("p");

    if (!rod || button.dataset.rodReady === "true") return;

    button.dataset.rodReady = "true";

    gsap.set(rod, {
      transformOrigin: "left center",
      scaleX: 0.35,
      scaleY: 1
    });

    const timeline = gsap.timeline({
      paused: true,
      defaults: {
        duration: 0.55,
        ease: "expo.out"
      }
    });

    timeline.to(
      rod,
      {
        scaleX: 1,
        scaleY: 1.35
      },
      0
    );

    if (text) {
      timeline.to(
        text,
        {
          x: 4
        },
        0
      );
    }

    button.addEventListener("mouseenter", () => timeline.play());
    button.addEventListener("mouseleave", () => timeline.reverse());
  });
}

/* ==========================================================================
   3. LOAD ANIMATIONS
   Usage:
   animation="load"
   animation="load-up"
   animation="load-left"
   animation="load-right"
   animation="load-split"
========================================================================== */

function initLoadAnimations(EASE) {
  const timeline = gsap.timeline({
    defaults: {
      ease: EASE
    }
  });

  timeline.fromTo(
    '[animation="load"]',
    {
      opacity: 0,
      y: "1rem"
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.08,
      clearProps: "transform"
    },
    0.1
  );

  timeline.fromTo(
    '[animation="load-up"]',
    {
      opacity: 0,
      y: "2rem"
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.08,
      clearProps: "transform"
    },
    0.15
  );

  timeline.fromTo(
    '[animation="load-left"]',
    {
      opacity: 0,
      x: "2rem"
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.9,
      stagger: 0.08,
      clearProps: "transform"
    },
    0.15
  );

  timeline.fromTo(
    '[animation="load-right"]',
    {
      opacity: 0,
      x: "-2rem"
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.9,
      stagger: 0.08,
      clearProps: "transform"
    },
    0.15
  );

  document.querySelectorAll('[animation="load-split"]').forEach((element) => {
    if (element.dataset.loadSplitReady === "true") return;

    const content = element.innerHTML;

    element.innerHTML = `
      <span class="load-split__line-mask">
        <span class="load-split__line">${content}</span>
      </span>
    `;

    element.dataset.loadSplitReady = "true";

    const line = element.querySelector(".load-split__line");

    timeline.fromTo(
      line,
      {
        yPercent: 110,
        opacity: 0
      },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.95,
        clearProps: "transform"
      },
      0.2
    );
  });
}

/* ==========================================================================
   4. SIDE NAV OPEN / CLOSE
   Expected selectors:
   .nav--left
   .side--nav
   .side--nav-menu
   .menu--to-open
   .menu--to-close
========================================================================== */

function initNavbar(EASE) {
  const MOBILE_BREAKPOINT = 991;

  const navbar = document.querySelector(".navbar");
  const trigger = document.querySelector(".navbar-menu-trigger");
  const navMenu = document.querySelector(".nav--menu");
  const mask = document.querySelector(".navbar--mask");
  const iconOpen = document.querySelector(".navbar--menu-open");
  const iconClose = document.querySelector(".navbar--menu-close");

  if (!navbar || !trigger || !navMenu) return;

  const links = navMenu.querySelectorAll(".navbar--link");

  let isOpen = false;
  let timeline = null;

  function isMobileMenu() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function lockScroll() {
    document.documentElement.classList.add("is--locked");
    document.body.classList.add("is--locked");
  }

  function unlockScroll() {
    document.documentElement.classList.remove("is--locked");
    document.body.classList.remove("is--locked");
  }

  function resetDesktopState() {
    isOpen = false;

    if (timeline) {
      timeline.kill();
      timeline = null;
    }

    navbar.classList.remove("is--open");
    trigger.setAttribute("aria-expanded", "false");
    unlockScroll();

    gsap.set(navMenu, {
      clearProps: "all"
    });

    gsap.set(links, {
      clearProps: "all"
    });

    if (mask) {
      gsap.set(mask, {
        clearProps: "all"
      });
    }

    if (iconOpen) {
      gsap.set(iconOpen, {
        clearProps: "all"
      });
    }

    if (iconClose) {
      gsap.set(iconClose, {
        clearProps: "all"
      });
    }
  }

  function setMobileInitialState() {
    isOpen = false;

    navbar.classList.remove("is--open");
    trigger.setAttribute("aria-expanded", "false");
    unlockScroll();

    gsap.set(navMenu, {
      display: "none",
      opacity: 0,
      pointerEvents: "none"
    });

    gsap.set(links, {
      opacity: 0,
      y: "1.25rem",
      filter: "blur(6px)"
    });

    if (mask) {
      gsap.set(mask, {
        opacity: 0,
        pointerEvents: "none"
      });
    }

    if (iconOpen) {
      gsap.set(iconOpen, {
        opacity: 1,
        scale: 1,
        rotate: 0
      });
    }

    if (iconClose) {
      gsap.set(iconClose, {
        opacity: 0,
        scale: 0.75,
        rotate: -90
      });
    }
  }

  function openNavbar() {
    if (!isMobileMenu() || isOpen) return;

    isOpen = true;

    navbar.classList.add("is--open");
    trigger.setAttribute("aria-expanded", "true");
    lockScroll();

    if (timeline) timeline.kill();

    timeline = gsap.timeline();

    timeline
      .set(navMenu, {
        display: "flex",
        pointerEvents: "auto"
      })
      .to(
        mask,
        {
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.45,
          ease: "power2.out"
        },
        0
      )
      .to(
        navMenu,
        {
          opacity: 1,
          duration: 0.55,
          ease: "power2.out"
        },
        0
      )
      .to(
        links,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.65,
          stagger: 0.06,
          ease: EASE
        },
        0.15
      );

    if (iconOpen) {
      timeline.to(
        iconOpen,
        {
          opacity: 0,
          scale: 0.75,
          rotate: 90,
          duration: 0.35,
          ease: EASE
        },
        0
      );
    }

    if (iconClose) {
      timeline.to(
        iconClose,
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.4,
          ease: EASE
        },
        0.08
      );
    }
  }

  function closeNavbar(immediate = false) {
    if (!isMobileMenu()) {
      resetDesktopState();
      return;
    }

    if (!isOpen && !immediate) return;

    isOpen = false;

    navbar.classList.remove("is--open");
    trigger.setAttribute("aria-expanded", "false");
    unlockScroll();

    if (timeline) timeline.kill();

    if (immediate) {
      setMobileInitialState();
      return;
    }

    timeline = gsap.timeline();

    timeline
      .to(
        links,
        {
          opacity: 0,
          y: "1rem",
          filter: "blur(6px)",
          duration: 0.3,
          stagger: {
            each: 0.025,
            from: "end"
          },
          ease: "power2.inOut"
        },
        0
      )
      .to(
        navMenu,
        {
          opacity: 0,
          duration: 0.45,
          ease: "power2.inOut"
        },
        0.12
      )
      .to(
        mask,
        {
          opacity: 0,
          pointerEvents: "none",
          duration: 0.4,
          ease: "power2.inOut"
        },
        0.12
      );

    if (iconClose) {
      timeline.to(
        iconClose,
        {
          opacity: 0,
          scale: 0.75,
          rotate: -90,
          duration: 0.3,
          ease: EASE
        },
        0
      );
    }

    if (iconOpen) {
      timeline.to(
        iconOpen,
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.4,
          ease: EASE
        },
        0.08
      );
    }

    timeline.set(navMenu, {
      display: "none",
      pointerEvents: "none"
    });
  }

  function toggleNavbar() {
    if (!isMobileMenu()) return;
    isOpen ? closeNavbar() : openNavbar();
  }

  function applyResponsiveState() {
    if (isMobileMenu()) {
      setMobileInitialState();
    } else {
      resetDesktopState();
    }
  }

  trigger.setAttribute("role", "button");
  trigger.setAttribute("tabindex", "0");
  trigger.setAttribute("aria-expanded", "false");

  trigger.addEventListener("click", (event) => {
    if (!isMobileMenu()) return;

    event.preventDefault();
    event.stopPropagation();

    toggleNavbar();
  });

  trigger.addEventListener("keydown", (event) => {
    if (!isMobileMenu()) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    toggleNavbar();
  });

  if (mask) {
    mask.addEventListener("click", () => {
      if (isMobileMenu()) {
        closeNavbar();
      }
    });
  }

  document.addEventListener("pointerdown", (event) => {
    if (!isMobileMenu() || !isOpen) return;
    if (navMenu.contains(event.target)) return;
    if (trigger.contains(event.target)) return;
    if (mask && mask.contains(event.target)) return;

    closeNavbar();
  });

  window.addEventListener("keydown", (event) => {
    if (!isMobileMenu()) return;

    if (event.key === "Escape") {
      closeNavbar();
    }
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      if (isMobileMenu()) {
        closeNavbar();
      }
    });
  });

  let resizeTimer;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      applyResponsiveState();
    }, 150);
  });

  applyResponsiveState();
}

/* ==========================================================================
   5. DESKTOP NAVBAR BACKGROUND ON SCROLL
   Desktop only:
   - At the top: keeps the Webflow background.
   - After scrolling: adds .is--scrolled.
========================================================================== */

function initNavbarScrollState() {
  const navbar = document.querySelector(".navbar");
  const DESKTOP_BREAKPOINT = 992;
  const SCROLL_THRESHOLD = 8;

  if (!navbar) return;

  let ticking = false;

  function updateNavbarState() {
    const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
    const hasScrolled = window.scrollY > SCROLL_THRESHOLD;

    if (isDesktop && hasScrolled) {
      navbar.classList.add("is--scrolled");
    } else {
      navbar.classList.remove("is--scrolled");
    }

    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(updateNavbarState);
  }

  window.addEventListener("scroll", requestUpdate, {
    passive: true
  });

  window.addEventListener("resize", requestUpdate);

  updateNavbarState();
}

/* ==========================================================================
   6. FULL PAGE LOADING ANIMATION
   Usage:
   animation="loading"

   Unlike animation="load", this starts after all images, videos and fonts
   have finished loading.
========================================================================== */

function initLoadingAnimations(EASE) {
  const elements = document.querySelectorAll('[animation="loading"]');

  if (!elements.length) return;

  gsap.set(elements, {
    opacity: 0,
    y: "1.5rem"
  });

  function playLoadingAnimation() {
    gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: EASE,
      clearProps: "transform"
    });
  }

  if (document.readyState === "complete") {
    playLoadingAnimation();
  } else {
    window.addEventListener("load", playLoadingAnimation, {
      once: true
    });
  }
}

/* ==========================================================================
   7. SCROLL ANIMATIONS
   Usage:
   animation="fade"
   animation="fade-up"
   animation="fade-left"
   animation="fade-right"
   animation="fade-stagger"
   animation="fade-split"
========================================================================== */

function initScrollAnimations(EASE) {
  if (typeof ScrollTrigger === "undefined") {
    console.warn("[Animations] ScrollTrigger is missing.");
    return;
  }

  initFadeAnimation(
    '[animation="fade"]',
    {
      opacity: 0,
      y: "1rem"
    },
    EASE
  );

  initFadeAnimation(
    '[animation="fade-up"]',
    {
      opacity: 0,
      y: "2rem"
    },
    EASE
  );

  initFadeAnimation(
    '[animation="fade-left"]',
    {
      opacity: 0,
      x: "2rem"
    },
    EASE
  );

  initFadeAnimation(
    '[animation="fade-right"]',
    {
      opacity: 0,
      x: "-2rem"
    },
    EASE
  );

  initFadeStagger(EASE);
  initFadeSplit(EASE);

  ScrollTrigger.refresh();
}

function initFadeAnimation(selector, fromVars, EASE) {
  document.querySelectorAll(selector).forEach((element) => {
    gsap.fromTo(
      element,
      fromVars,
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: EASE,
        clearProps: "transform",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          once: true
        }
      }
    );
  });
}

function initFadeStagger(EASE) {
  document.querySelectorAll('[animation="fade-stagger"]').forEach((parent) => {
    const children = parent.children;

    if (!children.length) return;

    gsap.fromTo(
      children,
      {
        opacity: 0,
        y: "1.5rem"
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: EASE,
        clearProps: "transform",
        scrollTrigger: {
          trigger: parent,
          start: "top 85%",
          once: true
        }
      }
    );
  });
}

function initFadeSplit(EASE) {
  document.querySelectorAll('[animation="fade-split"]').forEach((element) => {
    if (element.dataset.fadeSplitReady === "true") return;

    const content = element.innerHTML;

    element.innerHTML = `
      <span class="fade-split__line-mask">
        <span class="fade-split__line">${content}</span>
      </span>
    `;

    element.dataset.fadeSplitReady = "true";

    const line = element.querySelector(".fade-split__line");

    gsap.fromTo(
      line,
      {
        yPercent: 110,
        opacity: 0
      },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.85,
        ease: EASE,
        clearProps: "transform",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          once: true
        }
      }
    );
  });
}