document.addEventListener("DOMContentLoaded", function () {
  // 1. Dynamic Header & Footer Loading
  const pathSegments = window.location.pathname.split("/");
  const isInPagesDir = pathSegments[pathSegments.length - 2] === "pages";
  const headerPath = isInPagesDir
    ? "components/header.html"
    : "pages/components/header.html";
  const footerPath = isInPagesDir
    ? "components/footer.html"
    : "pages/components/footer.html";

  // Helper to adjust relative assets paths
  function adjustPaths(htmlContent, isInPages) {
    if (isInPages) {
      // Fix logo path
      htmlContent = htmlContent.replace(
        /src="assets\/images\/logoStackly\.webp"/g,
        'src="../assets/images/logoStackly.webp"',
      );
      // Fix page links (strip 'pages/' since subpages are in pages/)
      htmlContent = htmlContent.replace(/href="pages\//g, 'href="');
      // Fix home page link
      htmlContent = htmlContent.replace(
        /href="index\.html"/g,
        'href="../index.html"',
      );
    }
    return htmlContent;
  }

  // Load Header
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (headerPlaceholder) {
    fetch(headerPath)
      .then((res) => {
        if (!res.ok) throw new Error("Header load failed");
        return res.text();
      })
      .then((html) => {
        headerPlaceholder.innerHTML = adjustPaths(html, isInPagesDir);
        // Initialize header interactive functions
        initStickyHeader();
        initMobileMenu();
        highlightActiveMenu();
      })
      .catch((err) => {
        console.error("Error loading header:", err);
        // Fallback basic header markup if local file protocol blocks fetch (CORS)
        setupFallbackHeader(headerPlaceholder, isInPagesDir);
      });
  }

  // Load Footer
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (footerPlaceholder) {
    fetch(footerPath)
      .then((res) => {
        if (!res.ok) throw new Error("Footer load failed");
        return res.text();
      })
      .then((html) => {
        footerPlaceholder.innerHTML = adjustPaths(html, isInPagesDir);
        // Initialize footer interactive functions
        initScrollToTop();
      })
      .catch((err) => {
        console.error("Error loading footer:", err);
        setupFallbackFooter(footerPlaceholder, isInPagesDir);
      });
  }

  // 2. Extra Platform Interactivities (Homepage Live Ticker, counters, etc.)
  initMetricsCounters();
  initLiveRfqSimulator();
  initContactFormHandler();
  initEmptyLinks404Redirect();
});

/* ==========================================================================
   0. Global Empty / # Link Interceptor -> 404 Redirection
   ========================================================================== */
function initEmptyLinks404Redirect() {
  document.addEventListener("click", function (e) {
    const anchor = e.target.closest("a");
    if (!anchor) return;

    // If already on 404 page, do not intercept
    const currentPage = window.location.pathname.split("/").pop() || "";
    if (currentPage === "404.html") return;

    const rawHref = anchor.getAttribute("href");

    // Allow bootstrap toggles / tabs / accordion triggers to function
    if (
      anchor.hasAttribute("data-bs-toggle") ||
      anchor.hasAttribute("data-bs-target") ||
      anchor.hasAttribute("data-toggle") ||
      anchor.getAttribute("role") === "tab" ||
      (anchor.getAttribute("role") === "button" &&
        anchor.classList.contains("dropdown-toggle"))
    ) {
      return;
    }

    // Check if href is empty or standard placeholder
    const isEmptyOrHash =
      rawHref === null ||
      rawHref === undefined ||
      rawHref.trim() === "" ||
      rawHref === "#" ||
      rawHref === "#!" ||
      rawHref === "javascript:void(0)" ||
      rawHref === "javascript:void(0);" ||
      rawHref === "javascript:;";

    // Check if it's an in-page anchor pointing to a non-existent element
    let isDeadAnchor = false;
    if (rawHref && rawHref.startsWith("#") && rawHref.length > 1) {
      try {
        const targetEl = document.querySelector(rawHref);
        if (!targetEl) {
          isDeadAnchor = true;
        }
      } catch (err) {
        isDeadAnchor = true;
      }
    }

    if (isEmptyOrHash || isDeadAnchor) {
      e.preventDefault();
      const pathSegments = window.location.pathname.split("/");
      const isInPagesDir =
        pathSegments[pathSegments.length - 2] === "pages" ||
        window.location.pathname.includes("/pages/");
      const target404 = isInPagesDir ? "../404.html" : "404.html";
      window.location.href = target404;
    }
  });
}

/* ==========================================================================
   Header Functions
   ========================================================================== */

function initStickyHeader() {
  const navbar = document.getElementById("mainNavbar");
  if (!navbar) return;

  function checkScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", checkScroll);
  checkScroll(); // Initial check in case page starts scrolled
}

function initMobileMenu() {
  const openBtn = document.getElementById("mobileMenuBtn");
  const closeBtn = document.getElementById("closeMobileMenuBtn");
  const overlay = document.getElementById("mobileMenuOverlay");

  if (openBtn && overlay) {
    openBtn.addEventListener("click", function () {
      overlay.classList.add("active");
      document.body.style.overflow = "hidden"; // Disable scroll
    });
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", function () {
      overlay.classList.remove("active");
      document.body.style.overflow = ""; // Enable scroll
    });
  }

  // Close on link click
  if (overlay) {
    const links = overlay.querySelectorAll(".mobile-nav-link");
    links.forEach((link) => {
      link.addEventListener("click", function () {
        overlay.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  }
}

function highlightActiveMenu() {
  const path = window.location.pathname;
  const pageName = path.split("/").pop() || "index.html";
  let activeId = "nav-home";
  let mobActiveId = "mob-nav-home";

  if (pageName === "about.html") {
    activeId = "nav-about";
    mobActiveId = "mob-nav-about";
  } else if (pageName === "services.html") {
    activeId = "nav-services";
    mobActiveId = "mob-nav-services";
  } else if (pageName === "blog.html") {
    activeId = "nav-blog";
    mobActiveId = "mob-nav-blog";
  } else if (pageName === "events.html") {
    activeId = "nav-events";
    mobActiveId = "mob-nav-events";
  } else if (pageName === "gallery.html") {
    activeId = "nav-gallery";
    mobActiveId = "mob-nav-gallery";
  } else if (pageName === "contact.html") {
    activeId = "nav-contact";
    mobActiveId = "mob-nav-contact";
  }

  const desktopEl = document.getElementById(activeId);
  if (desktopEl) {
    desktopEl.classList.add("active");
  }
  const mobileEl = document.getElementById(mobActiveId);
  if (mobileEl) {
    mobileEl.classList.add("active");
  }
}

/* ==========================================================================
   Footer & Scroll to Top Functions
   ========================================================================== */

function initScrollToTop() {
  const scrollBtn = document.getElementById("scrollToTopBtn");
  if (!scrollBtn) return;

  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      scrollBtn.classList.add("visible");
    } else {
      scrollBtn.classList.remove("visible");
    }
  });

  scrollBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/* ==========================================================================
   Interactive UI Animations & Simulations
   ========================================================================== */

// Animate numbers for platform metrics
function initMetricsCounters() {
  const counters = document.querySelectorAll(".counter-value");
  if (counters.length === 0) return;

  const countOptions = {
    threshold: 0.5,
    rootMargin: "0px",
  };

  const counterObserver = new IntersectionObserver(function (
    entries,
    observer,
  ) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target;
      const targetCount = parseInt(target.getAttribute("data-count"));
      let currentCount = 0;
      const speed = targetCount > 100 ? 20 : 50; // increment velocity
      const increment = Math.ceil(targetCount / 40);

      const timer = setInterval(() => {
        currentCount += increment;
        if (currentCount >= targetCount) {
          target.textContent = targetCount;
          clearInterval(timer);
        } else {
          target.textContent = currentCount;
        }
      }, speed);

      observer.unobserve(target);
    });
  }, countOptions);

  counters.forEach((counter) => {
    counterObserver.observe(counter);
  });
}

// Simulated real-time RFQ dashboard tick for B2B Procure platform
function initLiveRfqSimulator() {
  const tickerContainer = document.getElementById("liveRfqTicker");
  if (!tickerContainer) return;

  const categories = [
    "Raw Materials",
    "Electronics",
    "Logistics",
    "Office Supplies",
    "MRO Parts",
    "IT Hardware",
    "Packaging",
    "Safety Gear",
  ];
  const locations = [
    "London, UK",
    "Manchester, UK",
    "Birmingham, UK",
    "Leeds, UK",
    "Glasgow, UK",
    "Bristol, UK",
    "Belfast, UK",
  ];
  const statusTypes = ["Open for Bids", "Under Review", "Awaiting Quotes"];

  function generateRandomRfq() {
    const id = "RFQ-" + Math.floor(100000 + Math.random() * 900000);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const value =
      "£" + (Math.floor(5 + Math.random() * 245) * 1000).toLocaleString();
    const location = locations[Math.floor(Math.random() * locations.length)];
    const bids = Math.floor(1 + Math.random() * 12);
    const status = statusTypes[Math.floor(Math.random() * statusTypes.length)];

    return { id, category, value, location, bids, status };
  }

  // Initialize with 4 items
  for (let i = 0; i < 4; i++) {
    const item = generateRandomRfq();
    appendRfqRow(item);
  }

  // Keep updating every 4 seconds
  setInterval(() => {
    const newItem = generateRandomRfq();
    const rows = tickerContainer.querySelectorAll("tr");
    if (rows.length >= 6) {
      rows[rows.length - 1].remove(); // remove oldest
    }
    prependRfqRow(newItem);
  }, 4000);

  function appendRfqRow(rfq) {
    const tr = document.createElement("tr");
    tr.innerHTML = getRowHtml(rfq);
    tickerContainer.appendChild(tr);
  }

  function prependRfqRow(rfq) {
    const tr = document.createElement("tr");
    tr.className = "table-row-new";
    tr.innerHTML = getRowHtml(rfq);
    tickerContainer.insertBefore(tr, tickerContainer.firstChild);
    setTimeout(() => {
      tr.classList.remove("table-row-new");
    }, 1000);
  }

  function getRowHtml(rfq) {
    let badgeColor = "bg-success";
    if (rfq.status === "Under Review") badgeColor = "bg-warning text-dark";
    if (rfq.status === "Awaiting Quotes") badgeColor = "bg-info text-white";

    return `
            <td><strong class="text-primary">${rfq.id}</strong></td>
            <td>${rfq.category}</td>
            <td>${rfq.location}</td>
            <td><span class="fw-semibold text-white">${rfq.value}</span></td>
            <td><span class="badge ${badgeColor}">${rfq.status}</span></td>
            <td><span class="badge bg-secondary rounded-pill">${rfq.bids} Bids</span></td>
        `;
  }
}

// Quick AJAX validation feedback simulator for forms
function initContactFormHandler() {
  const forms = document.querySelectorAll(".b2b-form");
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const btn = form.querySelector("button[type='submit']");
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...`;
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = `<i class="fa-solid fa-check me-2"></i>Submitted Successfully!`;
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-success");

        // Show Alert Success
        const alertBox = form.querySelector(".form-success-alert");
        if (alertBox) {
          alertBox.classList.remove("d-none");
        }

        form.reset();

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
          btn.classList.remove("btn-success");
          btn.classList.add("btn-primary");
          if (alertBox) {
            alertBox.classList.add("d-none");
          }
        }, 4000);
      }, 1500);
    });
  });
}

/* ==========================================================================
   CORS Fallbacks for Direct file:/// Access (Double-clicking HTML files)
   ========================================================================== */

function setupFallbackHeader(container, isInPages) {
  const rootRel = isInPages ? "../" : "";
  const pagesRel = isInPages ? "" : "pages/";
  const imgPath = `${rootRel}assets/images/logoStackly.webp`;

  container.innerHTML = `
        <div class="top-bar d-none d-lg-block bg-dark text-white-50 py-2">
            <div class="container d-flex justify-content-between align-items-center">
                <div class="top-info d-flex gap-4 small">
                    <span><i class="fa-solid fa-phone text-primary me-2"></i>+91 9876543210</span>
                    <span><i class="fa-solid fa-envelope text-primary me-2"></i>support@Stackly.co.in</span>
                    <span><i class="fa-solid fa-location-dot text-primary me-2"></i>100 Wood Street, London, EC2V 7AN, United Kingdom</span>
                </div>
                <div class="top-social d-flex gap-3 small">
                    <a href="#" class="text-white-50"><i class="fa-brands fa-x-twitter"></i></a>
                    <a href="#" class="text-white-50"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="#" class="text-white-50"><i class="fa-brands fa-linkedin-in"></i></a>
                    <a href="#" class="text-white-50"><i class="fa-brands fa-youtube"></i></a>
                </div>
            </div>
        </div>
        <nav class="navbar navbar-expand-lg navbar-light bg-white py-3 shadow-sm" id="mainNavbar">
            <div class="container">
                <a class="navbar-brand d-flex align-items-center" href="${rootRel}index.html">
                    <img src="${imgPath}" alt="B2B Procurement Platform" height="40" class="me-2 logo-img">
                    <span class="fw-bold tracking-tight text-dark h4 mb-0 brand-name">B2B<span class="text-primary">Procure</span></span>
                </a>
                <button class="navbar-toggler border-0 p-2" type="button" aria-label="Toggle navigation" id="mobileMenuBtn">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="d-none d-lg-flex flex-grow-1 align-items-center" id="navbarNav">
                    <ul class="navbar-nav mx-auto mb-2 mb-lg-0 align-items-lg-center">
                        <li class="nav-item"><a class="nav-link px-3 py-2 fw-semibold" href="${rootRel}index.html" id="nav-home">Home</a></li>
                        <li class="nav-item"><a class="nav-link px-3 py-2 fw-semibold" href="${pagesRel}about.html" id="nav-about">About Us</a></li>
                        <li class="nav-item"><a class="nav-link px-3 py-2 fw-semibold" href="${pagesRel}services.html" id="nav-services">Services</a></li>
                        <li class="nav-item"><a class="nav-link px-3 py-2 fw-semibold" href="${pagesRel}blog.html" id="nav-blog">Blog</a></li>
                        <li class="nav-item"><a class="nav-link px-3 py-2 fw-semibold" href="${pagesRel}events.html" id="nav-events">Events</a></li>
                        <li class="nav-item"><a class="nav-link px-3 py-2 fw-semibold" href="${pagesRel}gallery.html" id="nav-gallery">Gallery</a></li>
                        <li class="nav-item"><a class="nav-link px-3 py-2 fw-semibold" href="${pagesRel}contact.html" id="nav-contact">Contact Us</a></li>
                    </ul>
                    <div class="ms-lg-3 d-flex align-items-center gap-2">
                        <a href="${pagesRel}login.html" class="btn btn-outline-primary px-3 py-2 fw-semibold rounded-pill" id="nav-login"><i class="fa-regular fa-user me-1"></i>Login</a>
                        <a href="${pagesRel}contact.html" class="btn btn-primary px-4 py-2 fw-semibold rounded-pill shadow-sm">Request Demo</a>
                    </div>
                </div>
            </div>
        </nav>
        <div class="mobile-menu-overlay" id="mobileMenuOverlay">
            <div class="mobile-menu-header d-flex justify-content-between align-items-center p-3">
                <a class="navbar-brand d-flex align-items-center text-white" href="${rootRel}index.html">
                    <img src="${imgPath}" alt="B2B Procurement Platform" height="40" class="me-2 logo-img">
                    <span class="fw-bold tracking-tight text-white h4 mb-0">B2B<span class="text-primary-light">Procure</span></span>
                </a>
                <button class="btn-close btn-close-white" type="button" id="closeMobileMenuBtn" aria-label="Close"></button>
            </div>
            <div class="mobile-menu-body p-4 text-center">
                <ul class="mobile-nav-list list-unstyled mb-5">
                    <li class="my-3"><a class="mobile-nav-link text-white fs-2 fw-bold d-block py-2" href="${rootRel}index.html" id="mob-nav-home">Home</a></li>
                    <li class="my-3"><a class="mobile-nav-link text-white fs-2 fw-bold d-block py-2" href="${pagesRel}about.html" id="mob-nav-about">About Us</a></li>
                    <li class="my-3"><a class="mobile-nav-link text-white fs-2 fw-bold d-block py-2" href="${pagesRel}services.html" id="mob-nav-services">Services</a></li>
                    <li class="my-3"><a class="mobile-nav-link text-white fs-2 fw-bold d-block py-2" href="${pagesRel}blog.html" id="mob-nav-blog">Blog</a></li>
                    <li class="my-3"><a class="mobile-nav-link text-white fs-2 fw-bold d-block py-2" href="${pagesRel}events.html" id="mob-nav-events">Events</a></li>
                    <li class="my-3"><a class="mobile-nav-link text-white fs-2 fw-bold d-block py-2" href="${pagesRel}gallery.html" id="mob-nav-gallery">Gallery</a></li>
                    <li class="my-3"><a class="mobile-nav-link text-white fs-2 fw-bold d-block py-2" href="${pagesRel}contact.html" id="mob-nav-contact">Contact Us</a></li>
                </ul>
                <div class="mobile-contact text-white-50 border-top border-secondary pt-4">
                    <p class="mb-2"><i class="fa-solid fa-phone text-primary me-2"></i>+91 9876543210</p>
                    <p class="mb-4"><i class="fa-solid fa-envelope text-primary me-2"></i>support@Stackly.co.in</p>
                    <div class="d-flex gap-2">
                        <a href="${pagesRel}login.html" class="btn btn-primary px-4 py-3 rounded-pill fw-semibold shadow-sm w-50">Login</a>
                        <a href="${pagesRel}register.html" class="btn btn-outline-light px-4 py-3 rounded-pill fw-semibold shadow-sm w-50">Register</a>
                    </div>
                </div>
            </div>
        </div>
    `;

  // Initialize functions for fallback markup
  initStickyHeader();
  initMobileMenu();
  highlightActiveMenu();
}

function setupFallbackFooter(container, isInPages) {
  const rootRel = isInPages ? "../" : "";
  const pagesRel = isInPages ? "" : "pages/";
  const imgPath = `${rootRel}assets/images/logoStackly.webp`;

  container.innerHTML = `
        <footer class="bg-dark text-white pt-5 pb-3">
            <div class="container">
                <div class="row g-4">
                    <div class="col-lg-4 col-md-6">
                        <div class="d-flex align-items-center mb-3">
                            <img src="${imgPath}" alt="B2B Procurement Platform Logo" height="35" class="me-2 logo-img">
                            <span class="fw-bold tracking-tight text-white h5 mb-0">B2B<span class="text-primary">Procure</span></span>
                        </div>
                        <p class="text-white-50 small mb-4">
                            Empowering global enterprise chains with automated e-sourcing, smart supplier audits, intelligent analytics, and seamless contract lifecycle workflows.
                        </p>
                        <div class="social-links d-flex gap-2">
                            <a href="#" class="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;"><i class="fa-brands fa-x-twitter"></i></a>
                            <a href="#" class="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;"><i class="fa-brands fa-facebook-f"></i></a>
                            <a href="#" class="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;"><i class="fa-brands fa-linkedin-in"></i></a>
                            <a href="#" class="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;"><i class="fa-brands fa-youtube"></i></a>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-6">
                        <h5 class="fw-bold text-white mb-3 position-relative pb-2 footer-heading">Solutions</h5>
                        <ul class="list-unstyled small">
                            <li class="mb-2"><a href="${pagesRel}services.html" class="text-white-50 text-decoration-none hover-white">E-Sourcing & RFQs</a></li>
                            <li class="mb-2"><a href="${pagesRel}services.html" class="text-white-50 text-decoration-none hover-white">Supplier Portal (SRM)</a></li>
                            <li class="mb-2"><a href="${pagesRel}services.html" class="text-white-50 text-decoration-none hover-white">Purchase Orders</a></li>
                            <li class="mb-2"><a href="${pagesRel}services.html" class="text-white-50 text-decoration-none hover-white">Spend Analytics</a></li>
                            <li class="mb-2"><a href="${pagesRel}services.html" class="text-white-50 text-decoration-none hover-white">Contract Compliance</a></li>
                        </ul>
                    </div>
                    <div class="col-lg-2 col-md-6">
                        <h5 class="fw-bold text-white mb-3 position-relative pb-2 footer-heading">Quick Links</h5>
                        <ul class="list-unstyled small">
                            <li class="mb-2"><a href="${pagesRel}about.html" class="text-white-50 text-decoration-none hover-white">About Company</a></li>
                            <li class="mb-2"><a href="${pagesRel}blog.html" class="text-white-50 text-decoration-none hover-white">Insights & News</a></li>
                            <li class="mb-2"><a href="${pagesRel}events.html" class="text-white-50 text-decoration-none hover-white">Upcoming Events</a></li>
                            <li class="mb-2"><a href="${pagesRel}gallery.html" class="text-white-50 text-decoration-none hover-white">Media Gallery</a></li>
                            <li class="mb-2"><a href="${pagesRel}contact.html" class="text-white-50 text-decoration-none hover-white">Contact & Support</a></li>
                        </ul>
                    </div>
                    <div class="col-lg-4 col-md-6">
                        <h5 class="fw-bold text-white mb-3 position-relative pb-2 footer-heading">Headquarters</h5>
                        <ul class="list-unstyled text-white-50 small">
                            <li class="mb-3 d-flex align-items-start">
                                <i class="fa-solid fa-location-dot text-primary mt-1 me-3"></i>
                                <span>100 Wood Street, London, EC2V 7AN, United Kingdom</span>
                            </li>
                            <li class="mb-2 d-flex align-items-center">
                                <i class="fa-solid fa-phone text-primary me-3"></i>
                                <span>+91 9876543210</span>
                            </li>
                            <li class="mb-2 d-flex align-items-center">
                                <i class="fa-solid fa-envelope text-primary me-3"></i>
                                <span>support@Stackly.co.in</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <hr class="my-4 border-secondary opacity-25">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-center small text-white-50">
                    <p class="mb-md-0 mb-2">&copy; 2026 Stackly Ltd. All rights reserved.</p>
                    <div class="footer-bottom-links d-flex gap-3">
                        <a href="#" class="text-white-50 text-decoration-none hover-white">Privacy Policy</a>
                        <span>|</span>
                        <a href="#" class="text-white-50 text-decoration-none hover-white">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
        <button type="button" class="btn btn-primary btn-scroll-to-top shadow" id="scrollToTopBtn">
            <i class="fa-solid fa-arrow-up"></i>
        </button>
    `;

  initScrollToTop();
}
