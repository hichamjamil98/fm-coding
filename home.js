/* ==========================================================================
   HOME — SWIPER SLIDER
   Requires Swiper to be loaded before this file.
========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initHomeSwiper();
  });
  
  /* ==========================================================================
     HOME SWIPER
  ========================================================================== */
  
  function initHomeSwiper() {
    if (typeof Swiper === "undefined") {
      console.warn("[Home Swiper] Swiper is missing.");
      return;
    }
  
    const sliders = document.querySelectorAll(".swiper");
  
    sliders.forEach((sliderElement, sliderIndex) => {
      if (sliderElement.dataset.swiperInitialized === "true") return;
  
      const wrapper = sliderElement.querySelector(".swiper-wrapper");
      const slides = sliderElement.querySelectorAll(".swiper-slide");
  
      if (!wrapper || !slides.length) return;
  
      sliderElement.dataset.swiperInitialized = "true";
      sliderElement.setAttribute("data-home-swiper", "");
  
      const section = sliderElement.closest(".section") || sliderElement.parentElement;
  
      const previousButton =
        section?.querySelector("[data-swiper-prev]") ||
        sliderElement.querySelector(".swiper-button-prev");
  
      const nextButton =
        section?.querySelector("[data-swiper-next]") ||
        sliderElement.querySelector(".swiper-button-next");
  
      const pagination =
        section?.querySelector("[data-swiper-pagination]") ||
        sliderElement.querySelector(".swiper-pagination");
  
      const swiperOptions = {
        slidesPerView: 1,
        spaceBetween: 16,
        speed: 850,
  
        grabCursor: true,
        watchSlidesProgress: true,
        observer: true,
        observeParents: true,
        resizeObserver: true,
  
        resistance: true,
        resistanceRatio: 0.7,
  
        threshold: 5,
        touchStartPreventDefault: false,
  
        loop: false,
        rewind: false,
  
        keyboard: {
          enabled: true,
          onlyInViewport: true
        },
  
        a11y: {
          enabled: true,
          prevSlideMessage: "Slide précédente",
          nextSlideMessage: "Slide suivante",
          firstSlideMessage: "Première slide",
          lastSlideMessage: "Dernière slide"
        },
  
        breakpoints: {
          480: {
            slidesPerView: 1.05,
            spaceBetween: 16
          },
  
          768: {
            slidesPerView: 1.08,
            spaceBetween: 20
          },
  
          992: {
            slidesPerView: 1.12,
            spaceBetween: 24
          }
        },
  
        on: {
          init(swiper) {
            updateHomeSlideStates(swiper);
          },
  
          slideChange(swiper) {
            updateHomeSlideStates(swiper);
          },
  
          transitionStart(swiper) {
            updateHomeSlideStates(swiper);
          },
  
          transitionEnd(swiper) {
            updateHomeSlideStates(swiper);
          },
  
          resize(swiper) {
            updateHomeSlideStates(swiper);
          }
        }
      };
  
      if (previousButton && nextButton) {
        swiperOptions.navigation = {
          prevEl: previousButton,
          nextEl: nextButton
        };
      }
  
      if (pagination) {
        swiperOptions.pagination = {
          el: pagination,
          clickable: true
        };
      }
  
      const swiper = new Swiper(sliderElement, swiperOptions);
  
      sliderElement.swiperInstance = swiper;
      sliderElement.dataset.swiperIndex = String(sliderIndex);
    });
  }
  
  /* ==========================================================================
     SLIDE STATES
  
     - Slides already passed to the left receive .is--past.
     - The active slide receives .is--active.
     - Upcoming slides receive .is--next.
  ========================================================================== */
  
  function updateHomeSlideStates(swiper) {
    swiper.slides.forEach((slide, index) => {
      const isPast = index < swiper.activeIndex;
      const isActive = index === swiper.activeIndex;
      const isNext = index > swiper.activeIndex;
  
      slide.classList.toggle("is--past", isPast);
      slide.classList.toggle("is--active", isActive);
      slide.classList.toggle("is--next", isNext);
  
      slide.setAttribute("aria-hidden", isPast ? "true" : "false");
    });
  }