/* ==========================================================================
   HOME — STABLE INFINITE SWIPER
   Requires Swiper to be loaded before this file.

   This version does not use Swiper's native loop mode.
   Instead, it builds several identical slide groups and silently recenters
   the slider on an equivalent copy. This is more stable when the original
   slider contains only two slides.
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
  
    document.querySelectorAll(".swiper").forEach((sliderElement, sliderIndex) => {
      if (sliderElement.dataset.swiperInitialized === "true") return;
  
      const wrapper = sliderElement.querySelector(".swiper-wrapper");
  
      if (!wrapper) return;
  
      const originalSlides = Array.from(
        wrapper.querySelectorAll(":scope > .swiper-slide")
      );
  
      const originalCount = originalSlides.length;
  
      if (originalCount < 2) return;
  
      /*
        Build five identical groups:
        [group 0][group 1][group 2][group 3][group 4]
  
        The slider starts inside group 2.
        When it reaches group 0, 1, 3 or 4, it is silently moved back
        to the equivalent slide in group 2.
      */
      buildCircularTrack(wrapper, originalSlides, 5);
  
      sliderElement.dataset.swiperInitialized = "true";
      sliderElement.dataset.homeSwiper = "";
      sliderElement.dataset.swiperIndex = String(sliderIndex);
  
      const section =
        sliderElement.closest(".section") ||
        sliderElement.parentElement;
  
      const previousButton =
        section?.querySelector("[data-swiper-prev]") ||
        sliderElement.querySelector(".swiper-button-prev");
  
      const nextButton =
        section?.querySelector("[data-swiper-next]") ||
        sliderElement.querySelector(".swiper-button-next");
  
      const pagination =
        section?.querySelector("[data-swiper-pagination]") ||
        sliderElement.querySelector(".swiper-pagination");
  
      const middleGroupStart = originalCount * 2;
  
      const options = {
        initialSlide: middleGroupStart,
  
        slidesPerView: 1,
        spaceBetween: 16,
  
        loop: false,
        rewind: false,
  
        speed: 900,
  
        grabCursor: true,
        watchSlidesProgress: true,
  
        observer: true,
        observeParents: true,
        resizeObserver: true,
  
        followFinger: true,
        simulateTouch: true,
        allowTouchMove: true,
        touchRatio: 1,
  
        threshold: 5,
        longSwipes: true,
        longSwipesRatio: 0.2,
        longSwipesMs: 250,
        shortSwipes: true,
  
        resistance: true,
        resistanceRatio: 0.65,
  
        touchStartPreventDefault: false,
        touchMoveStopPropagation: false,
  
        preventClicks: true,
        preventClicksPropagation: true,
  
        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          waitForTransition: true
        },
  
        keyboard: {
          enabled: true,
          onlyInViewport: true
        },
  
        a11y: {
          enabled: true,
          prevSlideMessage: "Slide précédente",
          nextSlideMessage: "Slide suivante"
        },
  
        breakpoints: {
          480: {
            slidesPerView: 1.04,
            spaceBetween: 16
          },
  
          768: {
            slidesPerView: 1.06,
            spaceBetween: 20
          },
  
          992: {
            slidesPerView: 1.08,
            spaceBetween: 24
          }
        },
  
        on: {
          beforeInit(swiper) {
            swiper.el.classList.add("is--swiper-ready");
          },
  
          init(swiper) {
            updateSlideOpacity(swiper);
          },
  
          setTranslate(swiper) {
            updateSlideOpacity(swiper);
          },
  
          transitionStart(swiper) {
            updateSlideOpacity(swiper);
          },
  
          transitionEnd(swiper) {
            recenterCircularTrack(swiper, originalCount);
            updateSlideOpacity(swiper);
          },
  
          touchEnd(swiper) {
            updateSlideOpacity(swiper);
          },
  
          resize(swiper) {
            updateSlideOpacity(swiper);
          }
        }
      };
  
      if (previousButton && nextButton) {
        options.navigation = {
          prevEl: previousButton,
          nextEl: nextButton
        };
      }
  
      if (pagination) {
        options.pagination = {
          el: pagination,
          clickable: true,
          renderBullet(index, className) {
            const realIndex = index % originalCount;
  
            /*
              Only the first originalCount bullets are intended to be visible.
              CSS hides duplicated pagination bullets if pagination is used.
            */
            return `
              <span
                class="${className}"
                data-real-bullet="${realIndex}"
              ></span>
            `;
          }
        };
      }
  
      const swiper = new Swiper(sliderElement, options);
  
      sliderElement.swiperInstance = swiper;
      sliderElement.dataset.originalSlideCount = String(originalCount);
    });
  }
  
  /* ==========================================================================
     BUILD THE CIRCULAR TRACK
  ========================================================================== */
  
  function buildCircularTrack(wrapper, originalSlides, groupCount) {
    const fragment = document.createDocumentFragment();
  
    for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
      originalSlides.forEach((sourceSlide, realIndex) => {
        const slide =
          groupIndex === 0
            ? sourceSlide
            : sourceSlide.cloneNode(true);
  
        cleanSlideState(slide);
  
        slide.dataset.realSlideIndex = String(realIndex);
        slide.dataset.slideGroup = String(groupIndex);
  
        if (groupIndex > 0) {
          slide.dataset.homeClone = "true";
        }
  
        fragment.appendChild(slide);
      });
    }
  
    wrapper.innerHTML = "";
    wrapper.appendChild(fragment);
  }
  
  function cleanSlideState(slide) {
    slide.removeAttribute("id");
    slide.removeAttribute("role");
    slide.removeAttribute("aria-label");
    slide.removeAttribute("aria-hidden");
    slide.removeAttribute("style");
  
    slide.classList.remove(
      "swiper-slide-active",
      "swiper-slide-prev",
      "swiper-slide-next",
      "swiper-slide-visible",
      "swiper-slide-fully-visible",
      "is--past",
      "is--active",
      "is--future"
    );
  }
  
  /* ==========================================================================
     SILENT RECENTERING
  
     The equivalent target always belongs to the middle group.
     Because the destination contains the same content and has the same width,
     the zero-duration jump is visually invisible.
  ========================================================================== */
  
  function recenterCircularTrack(swiper, originalCount) {
    const firstSafeIndex = originalCount;
    const lastSafeIndex = originalCount * 4 - 1;
  
    if (
      swiper.activeIndex >= firstSafeIndex &&
      swiper.activeIndex <= lastSafeIndex
    ) {
      return;
    }
  
    const realIndex =
      ((swiper.activeIndex % originalCount) + originalCount) %
      originalCount;
  
    const equivalentMiddleIndex = originalCount * 2 + realIndex;
  
    swiper.slideTo(equivalentMiddleIndex, 0, false);
    swiper.updateSlidesProgress();
  }
  
  /* ==========================================================================
     LEFT-SIDE OPACITY
  
     slide.progress is continuously updated while autoplaying and dragging:
     - progress < 0: slide is moving or already positioned to the left;
     - progress = 0: active slide;
     - progress > 0: slide is on the right.
  
     Left slides fade progressively:
     progress  0.00 → opacity 1
     progress -0.50 → opacity 0.5
     progress -1.00 → opacity 0
  ========================================================================== */
  
  function updateSlideOpacity(swiper) {
    swiper.slides.forEach((slide) => {
      const progress = Number.isFinite(slide.progress)
        ? slide.progress
        : 0;
  
      const opacity =
        progress < 0
          ? clamp(1 + progress, 0, 1)
          : 1;
  
      slide.style.opacity = String(opacity);
      slide.style.visibility = "visible";
      slide.style.pointerEvents =
        opacity <= 0.01 ? "none" : "auto";
  
      slide.classList.toggle("is--past", progress < -0.01);
      slide.classList.toggle(
        "is--active",
        Math.abs(progress) <= 0.01
      );
      slide.classList.toggle("is--future", progress > 0.01);
  
      slide.setAttribute(
        "aria-hidden",
        opacity <= 0.01 ? "true" : "false"
      );
    });
  }
  
  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }