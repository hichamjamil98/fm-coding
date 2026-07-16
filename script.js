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
    initSideNav(EASE);
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
  
  function initSideNav(EASE) {
    const trigger = document.querySelector(".nav--left");
    const sideNav = document.querySelector(".side--nav");
    const sidePanel = document.querySelector(".side--nav-menu");
  
    const iconOpen = document.querySelector(".menu--to-open");
    const iconClose = document.querySelector(".menu--to-close");
  
    if (!trigger || !sideNav || !sidePanel) return;
  
    const menuLinks = sideNav.querySelectorAll(".side--nav-menu .nav--link");
    const socials = sideNav.querySelectorAll(".social--link");
    const animatedItems = [...menuLinks, ...socials];
  
    let isOpen = false;
    let timeline = null;
    let ignoreOutsideClick = false;
  
    gsap.set(sideNav, {
      display: "none",
      opacity: 0,
      pointerEvents: "none"
    });
  
    gsap.set(sidePanel, {
      x: "105%",
      opacity: 1
    });
  
    gsap.set(animatedItems, {
      opacity: 0,
      filter: "blur(6px)"
    });
  
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
  
    function lockScroll() {
      document.documentElement.classList.add("is--locked");
      document.body.classList.add("is--locked");
    }
  
    function unlockScroll() {
      document.documentElement.classList.remove("is--locked");
      document.body.classList.remove("is--locked");
    }
  
    function openMenu() {
      if (isOpen) return;
  
      isOpen = true;
  
      sideNav.classList.add("is--open");
      trigger.classList.add("is--menu-open");
      trigger.setAttribute("aria-expanded", "true");
  
      lockScroll();
  
      if (timeline) timeline.kill();
  
      timeline = gsap.timeline();
  
      timeline
        .set(sideNav, {
          display: "flex",
          pointerEvents: "auto"
        })
        .to(
          sideNav,
          {
            opacity: 1,
            duration: 0.6,
            ease: "power2.out"
          },
          0
        )
        .to(
          sidePanel,
          {
            x: "0%",
            duration: 0.85,
            ease: "expo.out"
          },
          0.04
        )
        .to(
          animatedItems,
          {
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.65,
            stagger: 0.045,
            ease: "power2.out"
          },
          0.32
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
            duration: 0.45,
            ease: EASE
          },
          0.08
        );
      }
    }
  
    function closeMenu() {
      if (!isOpen) return;
  
      isOpen = false;
  
      sideNav.classList.remove("is--open");
      trigger.classList.remove("is--menu-open");
      trigger.setAttribute("aria-expanded", "false");
  
      unlockScroll();
  
      if (timeline) timeline.kill();
  
      timeline = gsap.timeline();
  
      timeline
        .to(
          animatedItems,
          {
            opacity: 0,
            filter: "blur(6px)",
            duration: 0.3,
            stagger: {
              each: 0.02,
              from: "end"
            },
            ease: "power2.inOut"
          },
          0
        )
        .to(
          sidePanel,
          {
            x: "105%",
            duration: 0.75,
            ease: "expo.inOut"
          },
          0.08
        )
        .to(
          sideNav,
          {
            opacity: 0,
            duration: 0.55,
            ease: "power2.inOut"
          },
          0.18
        );
  
      if (iconClose) {
        timeline.to(
          iconClose,
          {
            opacity: 0,
            scale: 0.75,
            rotate: -90,
            duration: 0.35,
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
            duration: 0.45,
            ease: EASE
          },
          0.08
        );
      }
  
      timeline.set(sideNav, {
        display: "none",
        pointerEvents: "none"
      });
    }
  
    trigger.setAttribute("aria-expanded", "false");
  
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
  
      ignoreOutsideClick = true;
  
      setTimeout(() => {
        ignoreOutsideClick = false;
      }, 0);
  
      isOpen ? closeMenu() : openMenu();
    });
  
    document.addEventListener("pointerdown", (event) => {
      if (!isOpen || ignoreOutsideClick) return;
      if (sidePanel.contains(event.target)) return;
      if (trigger.contains(event.target)) return;
  
      closeMenu();
    });
  
    window.addEventListener("keydown", (event) => {
      if (!isOpen || event.key !== "Escape") return;
  
      event.preventDefault();
      closeMenu();
    });
  
    menuLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }
  
  /* ==========================================================================
     5. SCROLL ANIMATIONS
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