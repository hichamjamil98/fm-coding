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
  
      if (!wrapper || slides.length < 2) return;
  
      sliderElement.dataset.swiperInitialized = "true";
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
  
      const pagination =
        section?.querySelector("[data-swiper-pagination]") ||
        sliderElement.querySelector(".swiper-pagination");
  
      const swiperOptions = {
        slidesPerView: 1,
        spaceBetween: 16,
  
        loop: true,
        loopAdditionalSlides: 2,
  
        speed: 900,
  
        grabCursor: true,
        watchSlidesProgress: true,
  
        observer: true,
        observeParents: true,
        resizeObserver: true,
  
        resistance: true,
        resistanceRatio: 0.7,
  
        threshold: 5,
        touchStartPreventDefault: false,
  
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
          beforeInit(swiper) {
            swiper.el.classList.add("is--swiper-ready");
          },
  
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
  
          loopFix(swiper) {
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
     SLIDE STATES — LOOP SAFE
  ========================================================================== */
  
  function updateHomeSlideStates(swiper) {
    swiper.slides.forEach((slide) => {
      const isPrevious = slide.classList.contains("swiper-slide-prev");
      const isActive = slide.classList.contains("swiper-slide-active");
      const isNext = slide.classList.contains("swiper-slide-next");
  
      slide.classList.toggle("is--past", isPrevious);
      slide.classList.toggle("is--active", isActive);
      slide.classList.toggle("is--next", isNext);
  
      if (!isPrevious && !isActive && !isNext) {
        slide.classList.remove("is--past", "is--active", "is--next");
      }
  
      slide.setAttribute("aria-hidden", isPrevious ? "true" : "false");
    });
  }