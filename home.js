/* ==========================================================================
   HOME — SWIPER INFINITE LOOP
   Requires Swiper to be loaded before this file.
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
  
      if (originalSlides.length < 2) return;
  
      /*
        Swiper loop needs enough physical slides to prevent empty space.
  
        With only two CMS/static slides and slidesPerView greater than 1,
        Swiper may not have enough slides around the active slide.
  
        We duplicate the original slides before initialization until there
        are at least six physical slides.
      */
      ensureEnoughSlides(wrapper, originalSlides, 6);
  
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
  
      const options = {
        slidesPerView: 1,
        spaceBetween: 16,
  
        loop: true,
        loopAdditionalSlides: 4,
        loopPreventsSliding: false,
  
        speed: 950,
  
        grabCursor: true,
        watchSlidesProgress: true,
        observer: true,
        observeParents: true,
        observeSlideChildren: true,
        resizeObserver: true,
  
        resistance: true,
        resistanceRatio: 0.65,
  
        threshold: 5,
        touchStartPreventDefault: false,
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
            updateSlideVisibility(swiper);
          },
  
          setTranslate(swiper) {
            updateSlideVisibility(swiper);
          },
  
          slideChange(swiper) {
            updateSlideVisibility(swiper);
          },
  
          transitionStart(swiper) {
            updateSlideVisibility(swiper);
          },
  
          transitionEnd(swiper) {
            updateSlideVisibility(swiper);
          },
  
          loopFix(swiper) {
            updateSlideVisibility(swiper);
          },
  
          resize(swiper) {
            updateSlideVisibility(swiper);
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
          clickable: true
        };
      }
  
      const swiper = new Swiper(sliderElement, options);
  
      sliderElement.swiperInstance = swiper;
    });
  }
  
  /* ==========================================================================
     CREATE ENOUGH PHYSICAL SLIDES FOR A SEAMLESS LOOP
  ========================================================================== */
  
  function ensureEnoughSlides(wrapper, originalSlides, minimumSlides) {
    let physicalCount = wrapper.children.length;
    let cloneIndex = 0;
  
    while (physicalCount < minimumSlides) {
      const sourceSlide =
        originalSlides[cloneIndex % originalSlides.length];
  
      const clone = sourceSlide.cloneNode(true);
  
      clone.removeAttribute("id");
      clone.removeAttribute("aria-label");
      clone.removeAttribute("aria-hidden");
      clone.removeAttribute("role");
  
      clone.classList.remove(
        "swiper-slide-active",
        "swiper-slide-prev",
        "swiper-slide-next",
        "swiper-slide-visible",
        "is--past",
        "is--active",
        "is--next"
      );
  
      clone.dataset.homeClone = "true";
  
      wrapper.appendChild(clone);
  
      cloneIndex += 1;
      physicalCount += 1;
    }
  }
  
  /* ==========================================================================
     SLIDE VISIBILITY
  
     Swiper calculates slide.progress:
     - negative value: slide is to the left of the active position;
     - zero: active slide;
     - positive value: slide is active or to the right.
  
     Slides moving to the left fade out.
     All slides on the active/right side remain visible, including clones.
  ========================================================================== */
  
  function updateSlideVisibility(swiper) {
    swiper.slides.forEach((slide) => {
      const progress = Number.isFinite(slide.progress)
        ? slide.progress
        : 0;
  
      const isPast = progress < -0.05;
      const isActive = Math.abs(progress) <= 0.05;
      const isFuture = progress > 0.05;
  
      slide.classList.toggle("is--past", isPast);
      slide.classList.toggle("is--active", isActive);
      slide.classList.toggle("is--future", isFuture);
  
      /*
        Keep every slide in the layout.
        We only animate opacity, never display or visibility.
      */
      const opacity = isPast
        ? Math.max(0, 1 + progress)
        : 1;
  
      slide.style.opacity = String(opacity);
      slide.style.pointerEvents = isPast ? "none" : "auto";
  
      slide.setAttribute(
        "aria-hidden",
        opacity <= 0.01 ? "true" : "false"
      );
    });
  }