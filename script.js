document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll(
    ".section, .hero, .hero-card, .hero-copy, .site-header, .footer"
  );

  targets.forEach((el) => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));

  setTimeout(() => {
    document.querySelectorAll(".reveal").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add("in-view");
      }
    });
  }, 120);

  const animateNavLink = (link) => {
    if (!link || prefersReducedMotion) return;
    link.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.08)" },
        { transform: "scale(1)" },
      ],
      { duration: 260, easing: "ease-out" }
    );
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const smoothScrollTo = (target) => {
    if (!target) return;
    const header = document.querySelector(".site-header");
    let headerOffset = 16;
    if (header) {
      const position = window.getComputedStyle(header).position;
      if (position === "sticky" || position === "fixed") {
        headerOffset = header.offsetHeight + 16;
      }
    }
    const start = window.pageYOffset;
    const targetY =
      target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    const distance = targetY - start;
    const duration = 750;

    if (prefersReducedMotion || Math.abs(distance) < 4) {
      window.scrollTo(0, targetY);
      return;
    }

    let startTime = null;
    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, start + distance * eased);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const target = href ? document.querySelector(href) : null;
      if (!target) return;
      event.preventDefault();
      animateNavLink(link);
      smoothScrollTo(target);
      history.pushState(null, "", href);
    });
  });

  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => {
        smoothScrollTo(target);
      }, 200);
    }
  }

  const compare = document.querySelector("[data-compare]");
  if (compare) {
    const before = compare.querySelector(".compare-before");
    const handle = compare.querySelector(".compare-handle");

    const setPosition = (clientX) => {
      const rect = compare.getBoundingClientRect();
      const clamped = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const percentage = (clamped / rect.width) * 100;
      compare.style.setProperty("--compare-x", `${percentage}%`);
      handle.setAttribute("aria-valuenow", Math.round(percentage));
    };

    const onPointerDown = (event) => {
      compare.setPointerCapture(event.pointerId);
      setPosition(event.clientX);
    };

    const onPointerMove = (event) => {
      if (!compare.hasPointerCapture(event.pointerId)) return;
      setPosition(event.clientX);
    };

    const onPointerUp = (event) => {
      if (compare.hasPointerCapture(event.pointerId)) {
        compare.releasePointerCapture(event.pointerId);
      }
    };

    compare.addEventListener("pointerdown", onPointerDown);
    compare.addEventListener("pointermove", onPointerMove);
    compare.addEventListener("pointerup", onPointerUp);
    compare.addEventListener("pointerleave", onPointerUp);

    handle.addEventListener("keydown", (event) => {
      const step = 5;
      const current = Number(handle.getAttribute("aria-valuenow")) || 50;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPosition(compare.getBoundingClientRect().left + ((current - step) / 100) * compare.offsetWidth);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPosition(compare.getBoundingClientRect().left + ((current + step) / 100) * compare.offsetWidth);
      }
    });
  }
});
