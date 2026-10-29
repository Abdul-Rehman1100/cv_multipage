(() => {
  const themeToggles = document.querySelectorAll("[data-theme-toggle]");
  if (themeToggles.length) {
    let theme = "light";
    try {
      theme = localStorage.getItem("portfolio-theme") === "dark" ? "dark" : "light";
    } catch (error) {
      console.error("Unable to read the saved theme preference.", error);
    }

    const applyTheme = (nextTheme) => {
      theme = nextTheme;
      document.documentElement.dataset.theme = theme;
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute("content", theme === "dark" ? "#590D22" : "#fffaf9");
      themeToggles.forEach((toggle) => {
        toggle.setAttribute("aria-pressed", String(theme === "dark"));
        toggle.innerHTML = theme === "dark"
          ? '<span aria-hidden="true">☀</span> Light'
          : '<span aria-hidden="true">☾</span> Dark';
      });
    };

    applyTheme(theme);
    themeToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        applyTheme(theme === "dark" ? "light" : "dark");
        try {
          localStorage.setItem("portfolio-theme", theme);
        } catch (error) {
          console.error("Unable to save the theme preference.", error);
        }
      });
    });
  }

  const profileSidebar = document.querySelector("#profile-sidebar");
  const closeProfileButton = document.querySelector("[data-profile-close]");
  const openProfileButton = document.querySelector("[data-profile-open]");

  if (profileSidebar && closeProfileButton && openProfileButton) {
    let profileIsClosed = false;
    try {
      profileIsClosed = localStorage.getItem("portfolio-profile-closed") === "true";
    } catch (error) {
      console.error("Unable to read the saved profile panel preference.", error);
    }

    const setProfileClosed = (isClosed) => {
      profileIsClosed = isClosed;
      document.documentElement.classList.toggle("profile-is-closed", isClosed);
      profileSidebar.setAttribute("aria-hidden", String(isClosed));
      closeProfileButton.hidden = isClosed;
      openProfileButton.hidden = !isClosed;
    };

    const saveProfilePreference = () => {
      try {
        localStorage.setItem("portfolio-profile-closed", String(profileIsClosed));
      } catch (error) {
        console.error("Unable to save the profile panel preference.", error);
      }
    };

    setProfileClosed(profileIsClosed);
    closeProfileButton.addEventListener("click", () => {
      setProfileClosed(true);
      saveProfilePreference();
      openProfileButton.focus();
    });
    openProfileButton.addEventListener("click", () => {
      setProfileClosed(false);
      saveProfilePreference();
      closeProfileButton.focus();
    });
  }

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-nav");

  if (menuButton && navigation) {
    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation menu");
      navigation.classList.remove("is-open");
    };

    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
      navigation.classList.toggle("is-open", !isOpen);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menuButton.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  const year = document.querySelector("[data-current-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress span");
  const backToTopButton = document.querySelector(".back-to-top");
  if (backToTopButton) {
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (header || progress) {
    let ticking = false;
    const updateScrollEffects = () => {
      if (header && !header.classList.contains("site-header--home")) {
        header.classList.toggle("is-scrolled", window.scrollY > 24);
      }
      if (progress) {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
      }
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    }, { passive: true });
    updateScrollEffects();
  }

  const revealItems = document.querySelectorAll([
    "[data-reveal]",
    ".hero-home .hero-copy > *",
    ".hero-home .hero-visual",
    ".page-hero-inner > *",
    ".inner-section > .section-kicker",
    ".inner-section > h2",
    ".inner-section > .inner-copy",
    ".inner-section .info-card",
    ".inner-section .education-card",
    ".inner-section .content-accordion",
    ".inner-section .studied-subject-group",
    ".live-site-card",
    ".contact-end-inner > *"
  ].join(", "));
  if (revealItems.length && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("motion-ready");
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item, index) => {
      item.dataset.reveal = "";
      item.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
      observer.observe(item);
    });
  }

  const copyButton = document.querySelector("[data-copy-email]");
  const copyFeedback = document.querySelector("[data-copy-feedback]");
  if (copyButton && copyFeedback) {
    copyButton.addEventListener("click", async () => {
      const email = copyButton.getAttribute("data-copy-email");
      if (!email) return;
      try {
        await navigator.clipboard.writeText(email);
        copyFeedback.textContent = "Email address copied.";
      } catch {
        copyFeedback.textContent = "Copy unavailable. Please use the email link.";
      }
    });
  }

  const conversationForm = document.querySelector("[data-conversation-form]");
  const requestEmailLink = document.querySelector("[data-request-email]");
  const requestStatus = document.querySelector("[data-request-status]");
  if (conversationForm instanceof HTMLFormElement && requestEmailLink instanceof HTMLAnchorElement && requestStatus) {
    const dateInput = conversationForm.elements.namedItem("date");
    if (dateInput instanceof HTMLInputElement) {
      const today = new Date();
      const localDate = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
      dateInput.min = localDate;
    }

    conversationForm.addEventListener("input", () => {
      requestEmailLink.hidden = true;
      requestEmailLink.removeAttribute("href");
      requestStatus.textContent = "";
    });

    conversationForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(conversationForm);
      const name = String(formData.get("name") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const date = String(formData.get("date") ?? "");
      const time = String(formData.get("time") ?? "");
      const message = String(formData.get("message") ?? "").trim();
      const body = [
        "Hello Abdul-Rehman,",
        "",
        "I would like to ask about arranging a conversation.",
        `Name: ${name}`,
        `Email: ${email}`,
        `Preferred date: ${date}`,
        `Preferred time: ${time}`,
        message ? `What I would like to discuss: ${message}` : ""
      ].filter(Boolean).join("\n");
      const subject = `Conversation request from ${name}`;
      requestEmailLink.href = `mailto:abdulrehmanmujahid1100@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      requestEmailLink.hidden = false;
      requestStatus.textContent = "Your request is ready. Open the email draft to send it; no appointment has been booked.";
    });
  }
})();
