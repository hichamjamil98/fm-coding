/* ==========================================================================
   HOME — SWIPER AUTOPLAY LOOP
   Requires Swiper to be loaded before this file.

   Goals:
   - Preserve the exact width and starting position defined in Webflow.
   - Disable mouse/touch dragging.
   - Keep active and upcoming slides visible.
   - Fade only slides that move to the left.
========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initHomeSwipers();
  });
  
  /* ==========================================================================
     INITIALIZATION
  ========================================================================== */
  
  function initHomeSwipers() {
    if (typeof Swiper === "undefined") {
      console.warn("[Home Swiper] Swiper is missing.");
      return;
    }
  
    document.querySelectorAll(".swiper").forEach((sliderElement) => {
      if (sliderElement.dataset.cleanSwiperReady === "true") return;
  
      const wrapper = sliderElement.querySelector(".swiper-wrapper");
  
      if (!wrapper) return;
  
      /*
        Remove clones and inline states created by older versions
        of the custom slider script.
      */
      cleanupPreviousCustomSwiper(wrapper);
  
      const slides = Array.from(
        wrapper.querySelectorAll(":scope > .swiper-slide")
      );
  
      if (slides.length < 2) return;
  
      /*
        Native loop needs enough physical slides.
        If the authored slider contains only two slides,
        duplicate them once before Swiper initializes.
      */
      ensureMinimumSlides(wrapper, slides, 4);
  
      sliderElement.dataset.cleanSwiperReady = "true";
      sliderElement.setAttribute("data-home-swiper", "");
  
      const section =
        sliderElement.closest(".section") ||
        sliderElement.parentElement;
  
      const previousButton =
        section?.querySelector("[data-swiper-prev]") ||
        sliderElement.querySelector(".swiper-button-prev");
  
      const nextButton =
        section?.querySelector("[data-swiper-next]") ||
        sliderElement.querySelector(".swiper-button-next");
  
      const options = {
        /*
          "auto" preserves the width configured on .swiper-slide in Webflow.
          Swiper therefore does not recalculate a different slide width.
        */
        slidesPerView: "auto",
        slidesPerGroup: 1,
        spaceBetween: 24,
  
        centeredSlides: false,
        centeredSlidesBounds: false,
  
        loop: true,
        loopAdditionalSlides: 2,
        loopPreventsSliding: true,
  
        speed: 900,
  
        /*
          Drag is disabled completely.
        */
        allowTouchMove: false,
        simulateTouch: false,
        grabCursor: false,
        followFinger: false,
        touchRatio: 0,
  
        watchSlidesProgress: true,
  
        observer: true,
        observeParents: true,
        resizeObserver: true,
  
        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          waitForTransition: true
        },
  
        keyboard: {
          enabled: false
        },
  
        a11y: {
          enabled: true,
          prevSlideMessage: "Slide précédente",
          nextSlideMessage: "Slide suivante"
        },
  
        on: {
          beforeInit(swiper) {
            swiper.el.classList.add("is--swiper-ready");
          },
  
          init(swiper) {
            updateLeftSlideOpacity(swiper);
          },
  
          setTranslate(swiper) {
            updateLeftSlideOpacity(swiper);
          },
  
          transitionStart(swiper) {
            updateLeftSlideOpacity(swiper);
          },
  
          transitionEnd(swiper) {
            updateLeftSlideOpacity(swiper);
          },
  
          loopFix(swiper) {
            updateLeftSlideOpacity(swiper);
          },
  
          resize(swiper) {
            updateLeftSlideOpacity(swiper);
          }
        }
      };
  
      if (previousButton && nextButton) {
        options.navigation = {
          prevEl: previousButton,
          nextEl: nextButton
        };
      }
  
      const swiper = new Swiper(sliderElement, options);
  
      sliderElement.swiperInstance = swiper;
    });
  }
  
  /* ==========================================================================
     CLEANUP OLD CUSTOM STATES
  ========================================================================== */
  
  function cleanupPreviousCustomSwiper(wrapper) {
    wrapper
      .querySelectorAll('[data-home-clone="true"]')
      .forEach((slide) => slide.remove());
  
    wrapper
      .querySelectorAll(":scope > .swiper-slide")
      .forEach((slide) => {
        slide.removeAttribute("data-real-slide-index");
        slide.removeAttribute("data-slide-group");
        slide.removeAttribute("data-home-clone");
        slide.removeAttribute("aria-hidden");
  
        slide.style.removeProperty("opacity");
        slide.style.removeProperty("visibility");
        slide.style.removeProperty("pointer-events");
  
        slide.classList.remove(
          "is--past",
          "is--active",
          "is--future",
          "is--next"
        );
      });
  }
  
  /* ==========================================================================
     ENSURE ENOUGH SLIDES FOR NATIVE LOOP
  ========================================================================== */
  
  function ensureMinimumSlides(wrapper, sourceSlides, minimumCount) {
    let currentCount = wrapper.children.length;
    let sourceIndex = 0;
  
    while (currentCount < minimumCount) {
      const source =
        sourceSlides[sourceIndex % sourceSlides.length];
  
      const clone = source.cloneNode(true);
  
      clone.removeAttribute("id");
      clone.removeAttribute("style");
      clone.removeAttribute("aria-hidden");
      clone.dataset.homeClone = "true";
  
      clone.classList.remove(
        "swiper-slide-active",
        "swiper-slide-prev",
        "swiper-slide-next",
        "swiper-slide-visible",
        "swiper-slide-fully-visible",
        "is--past",
        "is--active",
        "is--future",
        "is--next"
      );
  
      wrapper.appendChild(clone);
  
      sourceIndex += 1;
      currentCount += 1;
    }
  }
  
  /* ==========================================================================
     LEFT-SIDE OPACITY
  
     The Webflow position of the Swiper container is used as the fixed anchor.
  
     - A slide at or to the right of that anchor keeps opacity 1.
     - A slide moving to the left fades progressively to opacity 0.
     - Upcoming slides and loop clones are never hidden.
  ========================================================================== */
  
  function updateLeftSlideOpacity(swiper) {
    const sliderRect = swiper.el.getBoundingClientRect();
    const anchorX = sliderRect.left;
  
    swiper.slides.forEach((slide) => {
      const slideRect = slide.getBoundingClientRect();
      const distanceFromAnchor = slideRect.left - anchorX;
  
      let opacity = 1;
  
      if (distanceFromAnchor < 0) {
        const fadeDistance = Math.max(slideRect.width * 0.45, 1);
  
        opacity = clamp(
          1 + distanceFromAnchor / fadeDistance,
          0,
          1
        );
      }
  
      slide.style.opacity = String(opacity);
      slide.style.visibility = "visible";
      slide.style.pointerEvents =
        opacity <= 0.01 ? "none" : "auto";
  
      const isLeft = distanceFromAnchor < -1;
  
      slide.classList.toggle("is--left", isLeft);
      slide.classList.toggle("is--visible-side", !isLeft);
  
      slide.setAttribute(
        "aria-hidden",
        opacity <= 0.01 ? "true" : "false"
      );
    });
  }
  
  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }