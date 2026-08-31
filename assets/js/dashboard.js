/**
 * Stackly B2B Procurement Platform - Dedicated Role-Based Dashboard Engine
 * Handles Dynamic Role Views, Sidebar Switching, Interactive Procurement Tables,
 * Auth Session Sync, and Empty Link / Button 404 Interception.
 */

document.addEventListener("DOMContentLoaded", function () {
  initDashboardApp();
  initEmptyLinks404Redirect();
});

/* ==========================================================================
   0. Global Empty Link & Unhandled Action Button -> 404 Redirection
   ========================================================================== */
function initEmptyLinks404Redirect() {
  document.addEventListener("click", function (e) {
    // 1. Check if clicked element or parent is an anchor
    const anchor = e.target.closest("a");
    if (anchor) {
      const rawHref = anchor.getAttribute("href");

      // Ignore standard UI triggers
      if (
        anchor.hasAttribute("data-bs-toggle") ||
        anchor.hasAttribute("data-bs-target") ||
        anchor.hasAttribute("data-toggle") ||
        anchor.hasAttribute("data-role-switch") ||
        anchor.hasAttribute("data-view") ||
        anchor.classList.contains("sidebar-nav-link") ||
        anchor.classList.contains("dropdown-item-role") ||
        anchor.getAttribute("role") === "tab" ||
        (anchor.getAttribute("role") === "button" &&
          anchor.classList.contains("dropdown-toggle"))
      ) {
        return;
      }

      const isEmptyOrHash =
        rawHref === null ||
        rawHref === undefined ||
        rawHref.trim() === "" ||
        rawHref === "#" ||
        rawHref === "#!" ||
        rawHref === "javascript:void(0)" ||
        rawHref === "javascript:void(0);" ||
        rawHref === "javascript:;";

      let isDeadAnchor = false;
      if (rawHref && rawHref.startsWith("#") && rawHref.length > 1) {
        try {
          const targetEl = document.querySelector(rawHref);
          if (!targetEl) isDeadAnchor = true;
        } catch (err) {
          isDeadAnchor = true;
        }
      }

      if (isEmptyOrHash || isDeadAnchor) {
        e.preventDefault();
        redirectTo404();
      }
      return;
    }

    // 2. Check if clicked element is a button marked as unconfigured / dummy
    const btn = e.target.closest("button");
    if (btn) {
      if (
        btn.classList.contains("btn-unconfigured") ||
        btn.getAttribute("data-action") === "dummy-404"
      ) {
        e.preventDefault();
        redirectTo404();
      }
    }
  });

  function redirectTo404() {
    const pathSegments = window.location.pathname.split("/");
    const isInPagesDir =
      pathSegments[pathSegments.length - 2] === "pages" ||
      window.location.pathname.includes("/pages/");
    const target404 = isInPagesDir ? "../404.html" : "404.html";
    window.location.href = target404;
  }
}

/* ==========================================================================
   1. Dashboard Application State & Datasets
   ========================================================================== */
const DASHBOARD_ROLES = {
  buyer: {
    key: "buyer",
    title: "Procurement Officer",
    org: "Global Enterprise Sourcing Ltd.",
    badgeClass: "buyer",
    badgeLabel: "Procurement Officer / Enterprise Buyer",
    defaultEmail: "procurement.officer@stackly-enterprise.com",
    bannerGreeting: "Procurement Operations Center",
    bannerDesc:
      "Monitor enterprise requisitions, evaluate multi-tier supplier quotes, approve high-volume purchase orders, and track contract SLAs in real-time.",
    navItems: [
      {
        id: "overview",
        label: "Spend & Sourcing Overview",
        icon: "fa-solid fa-chart-pie",
        badge: "Live",
        badgeClass: "badge-accent",
      },
      {
        id: "rfqs",
        label: "Requisitions & RFQs",
        icon: "fa-solid fa-file-invoice-dollar",
        badge: "6 Active",
        badgeClass: "badge-info",
      },
      {
        id: "purchase-orders",
        label: "Purchase Orders (PO)",
        icon: "fa-solid fa-boxes-packing",
        badge: "12 Orders",
        badgeClass: "",
      },
      {
        id: "vendors",
        label: "Certified Vendor Directory",
        icon: "fa-solid fa-building-shield",
        badge: "482 Vetted",
        badgeClass: "",
      },
      {
        id: "contracts",
        label: "Enterprise Contracts & SLAs",
        icon: "fa-solid fa-file-signature",
        badge: "3 Expiring",
        badgeClass: "badge-warning",
      },
      {
        id: "goods-receipt",
        label: "Goods Receiving (GRN)",
        icon: "fa-solid fa-truck-ramp-box",
        badge: "",
        badgeClass: "",
      },
    ],
    stats: [
      {
        label: "Active RFQs & Tenders",
        value: "24",
        icon: "fa-solid fa-file-contract",
        color: "blue",
        trend: "+4 this week",
        trendClass: "trend-up",
        subtext: "Across 6 business units",
      },
      {
        label: "Total PO Spend YTD",
        value: "£4.85M",
        icon: "fa-solid fa-sterling-sign",
        color: "green",
        trend: "92.4% on budget",
        trendClass: "trend-up",
        subtext: "Negotiated savings: £410k",
      },
      {
        label: "Pending Approvals",
        value: "8",
        icon: "fa-solid fa-clock",
        color: "yellow",
        trend: "3 urgent (< 24h)",
        trendClass: "trend-down",
        subtext: "Requires VP sign-off",
      },
      {
        label: "On-Time Delivery Rate",
        value: "98.2%",
        icon: "fa-solid fa-truck-fast",
        color: "purple",
        trend: "+1.6% QoQ",
        trendClass: "trend-up",
        subtext: "Tier-1 Vendor Benchmark",
      },
    ],
  },
  supplier: {
    key: "supplier",
    title: "Supplier Partner",
    org: "Apex Industrial Supplies Co.",
    badgeClass: "supplier",
    badgeLabel: "Certified Vendor / Supplier Partner",
    defaultEmail: "partner@apex-industrials.com",
    bannerGreeting: "Supplier Commercial Gateway",
    bannerDesc:
      "Review incoming enterprise RFQs, submit competitive quotations, track fulfillment milestones, and expedite automated milestone invoice payments.",
    navItems: [
      {
        id: "vendor-hub",
        label: "Vendor Command Hub",
        icon: "fa-solid fa-store",
        badge: "Verified",
        badgeClass: "badge-accent",
      },
      {
        id: "live-tenders",
        label: "Open Enterprise Tenders",
        icon: "fa-solid fa-bullhorn",
        badge: "14 New",
        badgeClass: "badge-info",
      },
      {
        id: "submitted-bids",
        label: "Submitted Quotes & Bids",
        icon: "fa-solid fa-handshake",
        badge: "5 Pending",
        badgeClass: "badge-warning",
      },
      {
        id: "fulfillment",
        label: "Orders in Fulfillment",
        icon: "fa-solid fa-dolly",
        badge: "9 Active",
        badgeClass: "",
      },
      {
        id: "invoices",
        label: "Invoices & Cashflow",
        icon: "fa-solid fa-receipt",
        badge: "£840k Due",
        badgeClass: "badge-accent",
      },
      {
        id: "catalog",
        label: "Product Catalog & Stock",
        icon: "fa-solid fa-layer-group",
        badge: "1,240 SKUs",
        badgeClass: "",
      },
    ],
    stats: [
      {
        label: "Active Bids Under Review",
        value: "14",
        icon: "fa-solid fa-gavel",
        color: "blue",
        trend: "£1.82M Bid Value",
        trendClass: "trend-up",
        subtext: "Average win-rate: 38.5%",
      },
      {
        label: "Confirmed Orders (PO)",
        value: "28",
        icon: "fa-solid fa-clipboard-check",
        color: "green",
        trend: "100% SLA Adherence",
        trendClass: "trend-up",
        subtext: "Current batch in transit",
      },
      {
        label: "Pending Invoices Value",
        value: "£342,800",
        icon: "fa-solid fa-wallet",
        color: "yellow",
        trend: "Net-30 cycle",
        trendClass: "trend-neutral",
        subtext: "3 invoices in 3-way match",
      },
      {
        label: "Quality Audit Rating",
        value: "4.95 / 5",
        icon: "fa-solid fa-star",
        color: "purple",
        trend: "ISO 9001 Certified",
        trendClass: "trend-up",
        subtext: "0.02% defect rate",
      },
    ],
  },
  admin: {
    key: "admin",
    title: "Supply Chain Director",
    org: "Enterprise Global HQ - Platform Admin",
    badgeClass: "admin",
    badgeLabel: "Supply Chain Director / Platform Admin",
    defaultEmail: "director.supplychain@stackly-enterprise.com",
    bannerGreeting: "Global Supply Chain Command Center",
    bannerDesc:
      "Enterprise governance oversight: multi-entity budget ceilings, ERP data feeds, automated threshold approvals, supplier tiering, and logistics risk heatmaps.",
    navItems: [
      {
        id: "command-center",
        label: "Executive Control Center",
        icon: "fa-solid fa-gauge-high",
        badge: "All Systems 100%",
        badgeClass: "badge-accent",
      },
      {
        id: "user-access",
        label: "User Governance & RBAC",
        icon: "fa-solid fa-users-gear",
        badge: "148 Users",
        badgeClass: "",
      },
      {
        id: "spend-control",
        label: "Spend Control & Budgets",
        icon: "fa-solid fa-chart-column",
        badge: "£18.2M Cap",
        badgeClass: "badge-info",
      },
      {
        id: "supplier-network",
        label: "Supplier Network & KYC",
        icon: "fa-solid fa-network-wired",
        badge: "6 New KYC",
        badgeClass: "badge-warning",
      },
      {
        id: "logistics",
        label: "Multi-Hub Freight & ESG",
        icon: "fa-solid fa-earth-americas",
        badge: "4 Hubs",
        badgeClass: "",
      },
      {
        id: "system-integrations",
        label: "ERP Integrations & APIs",
        icon: "fa-solid fa-sliders",
        badge: "SAP Synced",
        badgeClass: "badge-accent",
      },
    ],
    stats: [
      {
        label: "Annual Platform Spend",
        value: "£14.82M",
        icon: "fa-solid fa-vault",
        color: "blue",
        trend: "+14.2% YoY Throughput",
        trendClass: "trend-up",
        subtext: "Consolidated multi-entity",
      },
      {
        label: "Total Vetted Suppliers",
        value: "482",
        icon: "fa-solid fa-shield-halved",
        color: "green",
        trend: "99.8% Compliant",
        trendClass: "trend-up",
        subtext: "Tier-1 to Tier-3 Verified",
      },
      {
        label: "Maverick Spend Prevented",
        value: "£940,500",
        icon: "fa-solid fa-arrow-trend-down",
        color: "purple",
        trend: "Strict PO Policy",
        trendClass: "trend-up",
        subtext: "Automated AI matching",
      },
      {
        label: "System Uptime & Latency",
        value: "99.99%",
        icon: "fa-solid fa-server",
        color: "yellow",
        trend: "18ms ERP Sync",
        trendClass: "trend-neutral",
        subtext: "ISO 27001 Encrypted",
      },
    ],
  },
  auditor: {
    key: "auditor",
    title: "Financial Auditor",
    org: "Regulatory & Compliance Bureau",
    badgeClass: "auditor",
    badgeLabel: "Compliance Officer / Financial Auditor",
    defaultEmail: "compliance.officer@stackly-audit.gov",
    bannerGreeting: "Statutory Audit & Compliance Hub",
    bannerDesc:
      "Enforce Sarbanes-Oxley (SOX) Sec. 404 governance, verify automated 3-way invoice matching tolerances, monitor anti-bribery KYC, and export tamper-evident blockchain logs.",
    navItems: [
      {
        id: "compliance-hub",
        label: "Compliance & SOX Center",
        icon: "fa-solid fa-shield-virus",
        badge: "99.4% Score",
        badgeClass: "badge-accent",
      },
      {
        id: "three-way-match",
        label: "3-Way Invoice Verification",
        icon: "fa-solid fa-code-compare",
        badge: "4 Flags",
        badgeClass: "badge-warning",
      },
      {
        id: "certifications",
        label: "Vendor ESG & Due Diligence",
        icon: "fa-solid fa-certificate",
        badge: "ISO / FCPA",
        badgeClass: "",
      },
      {
        id: "audit-trail",
        label: "Immutable Audit Trail",
        icon: "fa-solid fa-link",
        badge: "256-bit Hash",
        badgeClass: "badge-info",
      },
      {
        id: "tax-reports",
        label: "Statutory Tax & Customs",
        icon: "fa-solid fa-landmark",
        badge: "Reconciled",
        badgeClass: "",
      },
      {
        id: "fraud-detection",
        label: "Fraud & Anomaly Exceptions",
        icon: "fa-solid fa-triangle-exclamation",
        badge: "0 Critical",
        badgeClass: "badge-accent",
      },
    ],
    stats: [
      {
        label: "Compliance Health Score",
        value: "99.4%",
        icon: "fa-solid fa-award",
        color: "green",
        trend: "+0.6% vs Q2",
        trendClass: "trend-up",
        subtext: "SOX 404 & GDPR Adherence",
      },
      {
        label: "3-Way Matched Volume",
        value: "£3.94M",
        icon: "fa-solid fa-stamp",
        color: "blue",
        trend: "1,420 Invoices Auto-Cleared",
        trendClass: "trend-up",
        subtext: "Variance tolerance <= 0.05%",
      },
      {
        label: "Open Discrepancy Flags",
        value: "4",
        icon: "fa-solid fa-flag",
        color: "yellow",
        trend: "Low Risk Tolerance",
        trendClass: "trend-down",
        subtext: "Quantity variance flagged",
      },
      {
        label: "Blockchain Block Height",
        value: "#894,120",
        icon: "fa-solid fa-cubes",
        color: "purple",
        trend: "SHA-256 Verified",
        trendClass: "trend-neutral",
        subtext: "Zero ledger tampering",
      },
    ],
  },
};

let currentRoleKey = "buyer";
let currentViewId = "";
let currentUserData = null;

/* ==========================================================================
   2. Main Initialization Function
   ========================================================================== */
function initDashboardApp() {
  loadAuthUserData();
  setupRoleSwitcher();
  setupMobileDrawer();
  setupGlobalSearch();
  setupToastContainer();
}

/* ==========================================================================
   3. User Session & Role Loading
   ========================================================================== */
function loadAuthUserData() {
  try {
    const rawUser =
      localStorage.getItem("b2b_procurement_user") ||
      sessionStorage.getItem("b2b_procurement_user");

    if (rawUser) {
      currentUserData = JSON.parse(rawUser);
    }
  } catch (err) {
    console.warn("Unable to parse session:", err);
  }

  // Determine initial role
  if (
    currentUserData &&
    currentUserData.role &&
    DASHBOARD_ROLES[currentUserData.role]
  ) {
    currentRoleKey = currentUserData.role;
  } else {
    currentRoleKey = "buyer"; // default fallback
    currentUserData = {
      role: "buyer",
      email: DASHBOARD_ROLES.buyer.defaultEmail,
      name: "Marcus Vance",
      loggedInAt: new Date().toISOString(),
    };
  }

  renderRoleView(currentRoleKey);
}

/* ==========================================================================
   4. Render Full Role Experience (Sidebar + Topbar + Viewport)
   ========================================================================== */
function renderRoleView(roleKey, targetViewId = null) {
  const roleConfig = DASHBOARD_ROLES[roleKey] || DASHBOARD_ROLES.buyer;
  currentRoleKey = roleKey;

  // 1. Update Topbar & Sidebar User Meta
  updateUserHeaders(roleConfig);

  // 2. Render Dynamic Sidebar Navigation Links
  renderSidebarNav(roleConfig, targetViewId);

  // 3. Render Viewport Content for Selected Tab
  const activeView = targetViewId || roleConfig.navItems[0].id;
  currentViewId = activeView;
  renderActiveContentView(roleConfig, activeView);
}

function updateUserHeaders(roleConfig) {
  // Topbar Profile
  const topbarName = document.getElementById("topbarUserName");
  const topbarRole = document.getElementById("topbarUserRole");
  const topbarAvatar = document.getElementById("topbarAvatar");
  const roleDropdownLabel = document.getElementById("roleDropdownLabel");

  const displayName = currentUserData
    ? currentUserData.name || roleConfig.title
    : roleConfig.title;
  const displayEmail = currentUserData
    ? currentUserData.email || roleConfig.defaultEmail
    : roleConfig.defaultEmail;

  if (topbarName) topbarName.textContent = displayName;
  if (topbarRole) topbarRole.textContent = roleConfig.title;
  if (roleDropdownLabel) roleDropdownLabel.textContent = roleConfig.title;
  if (topbarAvatar) {
    const initials = displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    topbarAvatar.textContent = initials || "PO";
  }

  // Sidebar Role Badge & Org
  const sidebarRoleBox = document.getElementById("sidebarRoleBox");
  if (sidebarRoleBox) {
    sidebarRoleBox.innerHTML = `
      <div class="role-badge-pill ${roleConfig.badgeClass}">
        <i class="fa-solid fa-circle-check"></i>
        <span>${roleConfig.title}</span>
      </div>
      <div class="sidebar-user-org" title="${roleConfig.org}">
        ${roleConfig.org}
      </div>
      <div class="sidebar-user-email" title="${displayEmail}">
        ${displayEmail}
      </div>
    `;
  }
}

function renderSidebarNav(roleConfig, targetViewId) {
  const navContainer = document.getElementById("sidebarNavList");
  if (!navContainer) return;

  const defaultActive = targetViewId || roleConfig.navItems[0].id;

  let html = "";
  roleConfig.navItems.forEach((item) => {
    const isActive = item.id === defaultActive ? "active" : "";
    const badgeMarkup = item.badge
      ? `<span class="sidebar-nav-badge ${item.badgeClass || ""}">${item.badge}</span>`
      : "";

    html += `
      <li class="sidebar-nav-item">
        <a class="sidebar-nav-link ${isActive}" data-view="${item.id}" href="javascript:void(0);">
          <i class="${item.icon} nav-icon"></i>
          <span>${item.label}</span>
          ${badgeMarkup}
        </a>
      </li>
    `;
  });

  navContainer.innerHTML = html;

  // Bind click listeners on sidebar items
  navContainer.querySelectorAll(".sidebar-nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const viewId = this.getAttribute("data-view");
      navContainer
        .querySelectorAll(".sidebar-nav-link")
        .forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
      currentViewId = viewId;
      renderActiveContentView(roleConfig, viewId);

      // Close mobile drawer if open
      const sidebar = document.getElementById("dashboardSidebar");
      const overlay = document.getElementById("sidebarOverlay");
      if (sidebar && sidebar.classList.contains("show")) {
        sidebar.classList.remove("show");
        if (overlay) overlay.classList.remove("show");
      }
    });
  });
}

/* ==========================================================================
   5. Dynamic Content Views Generator
   ========================================================================== */
function renderActiveContentView(roleConfig, viewId) {
  const stage = document.getElementById("dashboardStage");
  if (!stage) return;

  // Find active nav item definition
  const navItem =
    roleConfig.navItems.find((i) => i.id === viewId) || roleConfig.navItems[0];

  // 1. Build Header Banner
  const bannerHtml = `
    <div class="role-welcome-banner">
      <div class="banner-content">
        <div class="banner-pill">
          <i class="fa-solid fa-shield-halved"></i>
          <span>${roleConfig.badgeLabel}</span>
        </div>
        <h1 class="banner-title">${navItem.label}</h1>
        <p class="banner-desc">${roleConfig.bannerDesc}</p>
        
        <div class="banner-meta-row">
          <div class="banner-meta-item">
            <i class="fa-solid fa-building"></i>
            <span>Org: <strong>${roleConfig.org}</strong></span>
          </div>
          <div class="banner-meta-item">
            <i class="fa-solid fa-envelope"></i>
            <span>Signed In: <strong>${currentUserData ? currentUserData.email : roleConfig.defaultEmail}</strong></span>
          </div>
          <div class="banner-meta-item">
            <i class="fa-solid fa-clock"></i>
            <span>Session: <strong>Active (TLS 1.3 Verified)</strong></span>
          </div>
        </div>

        <div class="banner-actions">
          ${getQuickActionButtons(roleConfig.key, viewId)}
        </div>
      </div>
    </div>
  `;

  // 2. Build Stat KPI Cards
  const statsHtml = `
    <div class="stats-grid">
      ${roleConfig.stats
        .map(
          (stat) => `
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-label">${stat.label}</span>
            <div class="stat-card-icon-box icon-${stat.color}">
              <i class="${stat.icon}"></i>
            </div>
          </div>
          <div class="stat-card-value">${stat.value}</div>
          <div class="stat-card-footer">
            <span class="stat-trend-badge ${stat.trendClass}">
              <i class="fa-solid fa-arrow-trend-up"></i>
              <span>${stat.trend}</span>
            </span>
            <span class="stat-footer-text">${stat.subtext}</span>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;

  // 3. Build Role & View Specific Tables and Data Panels
  const contentSectionHtml = getViewSpecificContent(roleConfig.key, viewId);

  // Set Stage HTML with smooth fade-in
  stage.innerHTML = bannerHtml + statsHtml + contentSectionHtml;

  // Initialize view interactions (search, filter, mock action triggers)
  initViewInteractions();
}

/* ==========================================================================
   6. Role & View Specific Content Definitions (100% Original B2B Data)
   ========================================================================== */
function getQuickActionButtons(roleKey, viewId) {
  if (roleKey === "buyer") {
    return `
      <button class="banner-btn-primary" onclick="triggerMockAction('Create New Enterprise RFQ modal launched.')">
        <i class="fa-solid fa-plus"></i>
        <span>Create Requisition / RFQ</span>
      </button>
      <button class="banner-btn-outline" onclick="triggerMockAction('Spend Analytics Report generated.')">
        <i class="fa-solid fa-file-arrow-down"></i>
        <span>Export Spend Report</span>
      </button>
    `;
  } else if (roleKey === "supplier") {
    return `
      <button class="banner-btn-primary" onclick="triggerMockAction('Open RFQ Marketplace loaded.')">
        <i class="fa-solid fa-paper-plane"></i>
        <span>Submit Bid Proposal</span>
      </button>
      <button class="banner-btn-outline" onclick="triggerMockAction('Catalog Sync triggered.')">
        <i class="fa-solid fa-arrows-rotate"></i>
        <span>Sync Product Catalog</span>
      </button>
    `;
  } else if (roleKey === "admin") {
    return `
      <button class="banner-btn-primary" onclick="triggerMockAction('Supplier KYC Verification panel opened.')">
        <i class="fa-solid fa-user-plus"></i>
        <span>Onboard New Supplier</span>
      </button>
      <button class="banner-btn-outline" onclick="triggerMockAction('System Diagnostics completed: 100% Operational.')">
        <i class="fa-solid fa-gauge"></i>
        <span>Platform Diagnostics</span>
      </button>
    `;
  } else {
    return `
      <button class="banner-btn-primary" onclick="triggerMockAction('Automated SOX Compliance Audit completed: 0 critical flags.')">
        <i class="fa-solid fa-clipboard-check"></i>
        <span>Run SOX 404 Audit</span>
      </button>
      <button class="banner-btn-outline" onclick="triggerMockAction('Cryptographic Audit Ledger downloaded.')">
        <i class="fa-solid fa-download"></i>
        <span>Download Blockchain Log</span>
      </button>
    `;
  }
}

function getViewSpecificContent(roleKey, viewId) {
  const roleData = DASHBOARD_ROLES[roleKey] || DASHBOARD_ROLES.buyer;
  const currentNav =
    roleData.navItems.find((i) => i.id === viewId) || roleData.navItems[0];

  // ----------------------------------------------------
  // ROLE 1: BUYER VIEWS
  // ----------------------------------------------------
  if (roleKey === "buyer") {
    if (viewId === "overview") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-chart-pie"></i>
              <div>
                <h3 class="dash-card-title">Spend & Sourcing Portfolio Overview</h3>
                <p class="dash-card-subtitle">Real-time breakdown of multi-category enterprise procurement commitments</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search portfolio..." onkeyup="filterTable(this, 'overviewTable')">
              </div>
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Exporting Consolidated Spend Dossier...')">
                <i class="fa-solid fa-file-export"></i>
                <span>Export Dossier</span>
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="overviewTable">
              <thead>
                <tr>
                  <th>Category Code</th>
                  <th>Procurement Category</th>
                  <th>Allocated Budget</th>
                  <th>YTD Committed</th>
                  <th>Open RFQs</th>
                  <th>Contract Adherence</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">CAT-SEMI-01</span></td>
                  <td><strong>Semiconductors & Microelectronics</strong></td>
                  <td>£1,800,000</td>
                  <td><strong>£1,480,000 (82.2%)</strong></td>
                  <td><span class="badge bg-primary">3 Active</span></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> 99.4% SLA</span></td>
                  <td><button class="btn-table-action" title="View Category" onclick="triggerMockAction('Viewing Semiconductors Sourcing Analytics')"><i class="fa-solid fa-chart-line"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">CAT-AERO-04</span></td>
                  <td><strong>Aerospace Raw Metals & Titanium</strong></td>
                  <td>£1,250,000</td>
                  <td><strong>£895,000 (71.6%)</strong></td>
                  <td><span class="badge bg-primary">2 Active</span></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> 98.1% SLA</span></td>
                  <td><button class="btn-table-action" title="View Category" onclick="triggerMockAction('Viewing Aerospace Materials Analytics')"><i class="fa-solid fa-chart-line"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">CAT-LOG-02</span></td>
                  <td><strong>Global Freight & Cold-Chain Logistics</strong></td>
                  <td>£950,000</td>
                  <td><strong>£720,500 (75.8%)</strong></td>
                  <td><span class="badge bg-info">1 Active</span></td>
                  <td><span class="status-pill status-review"><i class="fa-solid fa-hourglass-half"></i> 95.2% SLA</span></td>
                  <td><button class="btn-table-action" title="View Category" onclick="triggerMockAction('Viewing Freight Category Analytics')"><i class="fa-solid fa-chart-line"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">CAT-IT-09</span></td>
                  <td><strong>Enterprise IT & Cloud Infrastructure</strong></td>
                  <td>£850,000</td>
                  <td><strong>£640,000 (75.3%)</strong></td>
                  <td><span class="badge bg-primary">2 Active</span></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> 100% SLA</span></td>
                  <td><button class="btn-table-action" title="View Category" onclick="triggerMockAction('Viewing Cloud Infra Spend')"><i class="fa-solid fa-chart-line"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "rfqs") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-file-invoice-dollar"></i>
              <div>
                <h3 class="dash-card-title">Enterprise RFQs & Requisition Pipeline</h3>
                <p class="dash-card-subtitle">Active multi-department quotation requests and live supplier bids</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search RFQ, category, or ID..." onkeyup="filterTable(this, 'rfqTable')">
              </div>
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Creating RFQ draft...')">
                <i class="fa-solid fa-plus"></i>
                <span>New RFQ</span>
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="rfqTable">
              <thead>
                <tr>
                  <th>RFQ ID</th>
                  <th>Requisition Item / Material</th>
                  <th>Category</th>
                  <th>Estimated Budget</th>
                  <th>Bids In</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">RFQ-2026-8942</span></td>
                  <td><strong>High-Purity Silicon Wafers (300mm)</strong></td>
                  <td>Semiconductors</td>
                  <td><strong>£480,000</strong></td>
                  <td><span class="badge bg-primary px-2 py-1">6 Quotes</span></td>
                  <td>2 days left</td>
                  <td><span class="status-pill status-bidding">Open Bidding</span></td>
                  <td>
                    <button class="btn-table-action" title="View Quotes" onclick="triggerMockAction('Viewing Quotes for RFQ-2026-8942')"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn-table-action" title="Award Vendor" onclick="triggerMockAction('Awarded RFQ-2026-8942 to lowest qualified bidder!')"><i class="fa-solid fa-award"></i></button>
                  </td>
                </tr>
                <tr>
                  <td><span class="code-badge">RFQ-2026-8943</span></td>
                  <td><strong>Industrial Titanium Grade 5 Billets (15 Tons)</strong></td>
                  <td>Aerospace Raw Materials</td>
                  <td><strong>£295,000</strong></td>
                  <td><span class="badge bg-primary px-2 py-1">4 Quotes</span></td>
                  <td>5 days left</td>
                  <td><span class="status-pill status-review">Evaluation</span></td>
                  <td>
                    <button class="btn-table-action" title="View Quotes" onclick="triggerMockAction('Viewing Quotes for RFQ-2026-8943')"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn-table-action" title="Award Vendor" onclick="triggerMockAction('Awarded RFQ-2026-8943!')"><i class="fa-solid fa-award"></i></button>
                  </td>
                </tr>
                <tr>
                  <td><span class="code-badge">RFQ-2026-8944</span></td>
                  <td><strong>Automated Conveyor Robotic Sensors</strong></td>
                  <td>Logistics Automation</td>
                  <td><strong>£142,500</strong></td>
                  <td><span class="badge bg-primary px-2 py-1">8 Quotes</span></td>
                  <td>Closed</td>
                  <td><span class="status-pill status-approved">Awarded</span></td>
                  <td>
                    <button class="btn-table-action" title="Generate PO" onclick="triggerMockAction('PO created for RFQ-2026-8944')"><i class="fa-solid fa-file-invoice"></i></button>
                  </td>
                </tr>
                <tr>
                  <td><span class="code-badge">RFQ-2026-8945</span></td>
                  <td><strong>Commercial Lithium Cathode Active Material</strong></td>
                  <td>Battery Production</td>
                  <td><strong>£620,000</strong></td>
                  <td><span class="badge bg-primary px-2 py-1">3 Quotes</span></td>
                  <td>12 hours left</td>
                  <td><span class="status-pill status-bidding">Urgent Bid</span></td>
                  <td>
                    <button class="btn-table-action" title="View Quotes" onclick="triggerMockAction('Viewing Quotes for RFQ-2026-8945')"><i class="fa-solid fa-eye"></i></button>
                  </td>
                </tr>
                <tr>
                  <td><span class="code-badge">RFQ-2026-8946</span></td>
                  <td><strong>Enterprise Cloud Storage & Tier-3 Servers</strong></td>
                  <td>IT Infrastructure</td>
                  <td><strong>£185,000</strong></td>
                  <td><span class="badge bg-primary px-2 py-1">5 Quotes</span></td>
                  <td>6 days left</td>
                  <td><span class="status-pill status-draft">Drafting</span></td>
                  <td>
                    <button class="btn-table-action" title="Publish RFQ" onclick="triggerMockAction('Published RFQ-2026-8946 to verified vendor network')"><i class="fa-solid fa-paper-plane"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "purchase-orders") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-boxes-packing"></i>
              <div>
                <h3 class="dash-card-title">Enterprise Purchase Order Tracking (PO)</h3>
                <p class="dash-card-subtitle">Active supplier fulfillment contracts, delivery status, and 3-way match validation</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Filter POs..." onkeyup="filterTable(this, 'poTable')">
              </div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="poTable">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Contracted Supplier</th>
                  <th>Order Description</th>
                  <th>PO Value</th>
                  <th>Est. Delivery</th>
                  <th>3-Way Match</th>
                  <th>Fulfillment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">PO-2026-4401</span></td>
                  <td><strong>Apex Precision Metals Ltd</strong></td>
                  <td>Titanium Alloy Grade 5 (2,500 kg)</td>
                  <td><strong>£187,500</strong></td>
                  <td>04 Sep 2026</td>
                  <td><span class="status-pill status-matched"><i class="fa-solid fa-check"></i> Matched</span></td>
                  <td><span class="status-pill status-delivered">Delivered</span></td>
                  <td>
                    <button class="btn-table-action" onclick="triggerMockAction('PO-2026-4401 Released for payment.')"><i class="fa-solid fa-money-bill-transfer"></i></button>
                  </td>
                </tr>
                <tr>
                  <td><span class="code-badge">PO-2026-4402</span></td>
                  <td><strong>Global Semiconductor Corp</strong></td>
                  <td>Silicon Microcontrollers (50,000 units)</td>
                  <td><strong>£340,000</strong></td>
                  <td>11 Sep 2026</td>
                  <td><span class="status-pill status-review"><i class="fa-solid fa-hourglass-half"></i> Pending GRN</span></td>
                  <td><span class="status-pill status-dispatched">In Transit</span></td>
                  <td>
                    <button class="btn-table-action" onclick="triggerMockAction('Tracking live freight container...')"><i class="fa-solid fa-location-crosshairs"></i></button>
                  </td>
                </tr>
                <tr>
                  <td><span class="code-badge">PO-2026-4403</span></td>
                  <td><strong>Nordic Logistics Solutions</strong></td>
                  <td>Refrigerated Cold-Chain Fleet Service</td>
                  <td><strong>£92,400</strong></td>
                  <td>01 Sep 2026</td>
                  <td><span class="status-pill status-matched"><i class="fa-solid fa-check"></i> Matched</span></td>
                  <td><span class="status-pill status-completed">Completed</span></td>
                  <td>
                    <button class="btn-table-action" onclick="triggerMockAction('Archived PO-2026-4403.')"><i class="fa-solid fa-box-archive"></i></button>
                  </td>
                </tr>
                <tr>
                  <td><span class="code-badge">PO-2026-4404</span></td>
                  <td><strong>Vanguard Industrial Chemical</strong></td>
                  <td>High-Density Polymer Resin (40 Tons)</td>
                  <td><strong>£215,000</strong></td>
                  <td>18 Sep 2026</td>
                  <td><span class="status-pill status-review"><i class="fa-solid fa-hourglass-half"></i> Pending QA</span></td>
                  <td><span class="status-pill status-in-progress">Manufacturing</span></td>
                  <td>
                    <button class="btn-table-action" onclick="triggerMockAction('Contacting supplier dispatch officer...')"><i class="fa-solid fa-message"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "vendors") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-building-shield"></i>
              <div>
                <h3 class="dash-card-title">Certified Vendor Network Directory</h3>
                <p class="dash-card-subtitle">ISO-audited tier-1 enterprise suppliers and SLA performance metrics</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search vendors..." onkeyup="filterTable(this, 'vendorTable')">
              </div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="vendorTable">
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Category</th>
                  <th>ISO Certification</th>
                  <th>D&B Rating</th>
                  <th>On-Time Rate</th>
                  <th>Active Contracts</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Apex Precision Metals Ltd</strong></td>
                  <td>Industrial Metals</td>
                  <td><span class="code-badge">ISO 9001 / AS9100</span></td>
                  <td><span class="badge bg-success">AAA (5A1)</span></td>
                  <td><strong>99.1%</strong></td>
                  <td>4 Active</td>
                  <td><span class="status-pill status-approved">Certified Tier-1</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Requesting quote from Apex Metals')"><i class="fa-solid fa-envelope"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Global Semiconductor Corp</strong></td>
                  <td>Electronic Components</td>
                  <td><span class="code-badge">ISO 14001 / IATF 16949</span></td>
                  <td><span class="badge bg-success">AAA (5A1)</span></td>
                  <td><strong>98.4%</strong></td>
                  <td>6 Active</td>
                  <td><span class="status-pill status-approved">Certified Tier-1</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Requesting quote from Global Semi')"><i class="fa-solid fa-envelope"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Nordic Logistics Solutions</strong></td>
                  <td>Global Freight & Warehousing</td>
                  <td><span class="code-badge">ISO 28000 (Supply Chain)</span></td>
                  <td><span class="badge bg-primary">AA (4A2)</span></td>
                  <td><strong>97.8%</strong></td>
                  <td>2 Active</td>
                  <td><span class="status-pill status-approved">Certified Tier-2</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Requesting logistics audit')"><i class="fa-solid fa-envelope"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Vanguard Industrial Chemical</strong></td>
                  <td>Specialty Polymers</td>
                  <td><span class="code-badge">ISO 9001 / REACH Compliant</span></td>
                  <td><span class="badge bg-success">AAA (5A1)</span></td>
                  <td><strong>98.9%</strong></td>
                  <td>3 Active</td>
                  <td><span class="status-pill status-approved">Certified Tier-1</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Requesting chemical audit dossier')"><i class="fa-solid fa-envelope"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "contracts") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-file-signature"></i>
              <div>
                <h3 class="dash-card-title">Enterprise Contracts & Master Service Agreements</h3>
                <p class="dash-card-subtitle">Legally binding multi-year supply frameworks, price locks, and SLA compliance</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search contracts..." onkeyup="filterTable(this, 'contractsTable')">
              </div>
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Drafting New Vendor MSA Framework...')">
                <i class="fa-solid fa-plus"></i>
                <span>Draft MSA</span>
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="contractsTable">
              <thead>
                <tr>
                  <th>Contract ID</th>
                  <th>Contracted Partner</th>
                  <th>Framework Scope</th>
                  <th>Contract Value Cap</th>
                  <th>Expiry Date</th>
                  <th>SLA Adherence</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">MSA-2025-081</span></td>
                  <td><strong>Apex Precision Metals Ltd</strong></td>
                  <td>Aerospace Raw Titanium Supply</td>
                  <td><strong>£2,500,000</strong></td>
                  <td>31 Dec 2027</td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> 99.4%</span></td>
                  <td><span class="status-pill status-approved">Active MSA</span></td>
                  <td>
                    <button class="btn-table-action" title="View Agreement" onclick="triggerMockAction('Viewing MSA-2025-081 Legal Terms PDF')"><i class="fa-solid fa-file-pdf"></i></button>
                    <button class="btn-table-action" title="Renew Contract" onclick="triggerMockAction('Contract Renewal Addendum launched.')"><i class="fa-solid fa-arrows-rotate"></i></button>
                  </td>
                </tr>
                <tr>
                  <td><span class="code-badge">MSA-2024-119</span></td>
                  <td><strong>Global Semiconductor Corp</strong></td>
                  <td>Fixed-Rate Microcontroller Allocation</td>
                  <td><strong>£4,200,000</strong></td>
                  <td>15 Nov 2026</td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> 98.6%</span></td>
                  <td><span class="status-pill status-review"><i class="fa-solid fa-clock"></i> Expiring Soon</span></td>
                  <td>
                    <button class="btn-table-action" title="View Agreement" onclick="triggerMockAction('Viewing MSA-2024-119 Legal Terms PDF')"><i class="fa-solid fa-file-pdf"></i></button>
                    <button class="btn-table-action" title="Renew Contract" onclick="triggerMockAction('Contract Extension Notice Sent')"><i class="fa-solid fa-file-pen"></i></button>
                  </td>
                </tr>
                <tr>
                  <td><span class="code-badge">MSA-2025-044</span></td>
                  <td><strong>Nordic Logistics Solutions</strong></td>
                  <td>EU & UK Consolidated Freight Carrier</td>
                  <td><strong>£1,100,000</strong></td>
                  <td>30 Jun 2028</td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> 97.9%</span></td>
                  <td><span class="status-pill status-approved">Active MSA</span></td>
                  <td>
                    <button class="btn-table-action" title="View Agreement" onclick="triggerMockAction('Viewing MSA-2025-044 Legal Terms PDF')"><i class="fa-solid fa-file-pdf"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "goods-receipt") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-truck-ramp-box"></i>
              <div>
                <h3 class="dash-card-title">Goods Receiving & Inbound Warehouse Intake (GRN)</h3>
                <p class="dash-card-subtitle">Dock receiving logs, physical barcode scans, and quality assurance inspections</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search GRN, PO, or bay..." onkeyup="filterTable(this, 'grnTable')">
              </div>
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Registering new Inbound Intake Batch...')">
                <i class="fa-solid fa-barcode"></i>
                <span>Scan Inbound Batch</span>
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="grnTable">
              <thead>
                <tr>
                  <th>GRN Reference</th>
                  <th>Linked PO</th>
                  <th>Supplier Entity</th>
                  <th>Received Materials</th>
                  <th>Intake Dock</th>
                  <th>QA Batch Result</th>
                  <th>GRN Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">GRN-2026-9801</span></td>
                  <td>PO-2026-4401</td>
                  <td><strong>Apex Precision Metals Ltd</strong></td>
                  <td>Titanium Alloy Billets (2,500 kg)</td>
                  <td>Southampton Dock 4</td>
                  <td><span class="badge bg-success"><i class="fa-solid fa-check"></i> 100% Passed</span></td>
                  <td><span class="status-pill status-approved">Approved Intake</span></td>
                  <td><button class="btn-table-action" title="View Inspection Report" onclick="triggerMockAction('Viewing QA Inspection Dossier for GRN-9801')"><i class="fa-solid fa-clipboard-check"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">GRN-2026-9802</span></td>
                  <td>PO-2026-4402</td>
                  <td><strong>Global Semiconductor Corp</strong></td>
                  <td>Silicon Wafers (50,000 units)</td>
                  <td>London Heathrow Cleanbay 2</td>
                  <td><span class="badge bg-warning text-dark"><i class="fa-solid fa-microscope"></i> In QA Testing</span></td>
                  <td><span class="status-pill status-review">Pending Sign-off</span></td>
                  <td><button class="btn-table-action" title="Log QA Result" onclick="triggerMockAction('QA Batch Inspection Passed for GRN-9802!')"><i class="fa-solid fa-circle-check"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">GRN-2026-9799</span></td>
                  <td>PO-2026-4395</td>
                  <td><strong>Vanguard Industrial Chemical</strong></td>
                  <td>Polymer Pellets (880 pcs)</td>
                  <td>Liverpool Hub Dock 1</td>
                  <td><span class="badge bg-danger"><i class="fa-solid fa-triangle-exclamation"></i> -120 pcs short</span></td>
                  <td><span class="status-pill status-rejected">Discrepancy Flagged</span></td>
                  <td><button class="btn-table-action btn-table-danger" title="Issue Discrepancy Notice" onclick="triggerMockAction('Discrepancy Note Dispatched to Supplier')"><i class="fa-solid fa-file-circle-xmark"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  // ----------------------------------------------------
  // ROLE 2: SUPPLIER VIEWS
  // ----------------------------------------------------
  if (roleKey === "supplier") {
    if (viewId === "vendor-hub") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-store"></i>
              <div>
                <h3 class="dash-card-title">Supplier Commercial Command Hub</h3>
                <p class="dash-card-subtitle">Direct commercial gateway with enterprise procurement officers across Fortune 500 accounts</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search opportunities..." onkeyup="filterTable(this, 'vendorHubTable')">
              </div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="vendorHubTable">
              <thead>
                <tr>
                  <th>Client Account</th>
                  <th>Engagement Stage</th>
                  <th>Active Bids Value</th>
                  <th>Confirmed Orders</th>
                  <th>On-Time Score</th>
                  <th>Compliance Tier</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Rolls-Royce Aerospace Unit</strong></td>
                  <td><span class="status-pill status-bidding">Tender Proposal</span></td>
                  <td><strong>£520,000</strong></td>
                  <td>3 Active POs</td>
                  <td><strong>99.8%</strong></td>
                  <td><span class="badge bg-success">Tier-1 Qualified</span></td>
                  <td><button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Opening Enterprise Portal for Rolls-Royce')"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open Portal</button></td>
                </tr>
                <tr>
                  <td><strong>Siemens Energy Infrastructure</strong></td>
                  <td><span class="status-pill status-approved">Framework Supplier</span></td>
                  <td><strong>£310,000</strong></td>
                  <td>5 Active POs</td>
                  <td><strong>99.1%</strong></td>
                  <td><span class="badge bg-success">Tier-1 Qualified</span></td>
                  <td><button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Opening Enterprise Portal for Siemens')"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open Portal</button></td>
                </tr>
                <tr>
                  <td><strong>GlaxoSmithKline Bio-Mfg</strong></td>
                  <td><span class="status-pill status-review">Audit Evaluation</span></td>
                  <td><strong>£175,000</strong></td>
                  <td>2 Active POs</td>
                  <td><strong>98.7%</strong></td>
                  <td><span class="badge bg-primary">Tier-2 Certified</span></td>
                  <td><button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Opening Enterprise Portal for GSK')"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open Portal</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "live-tenders") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-bullhorn"></i>
              <div>
                <h3 class="dash-card-title">Open Enterprise Tenders & RFQ Marketplace</h3>
                <p class="dash-card-subtitle">Direct requests from verified enterprise buyers matching your industrial classification</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search tenders..." onkeyup="filterTable(this, 'tenderTable')">
              </div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="tenderTable">
              <thead>
                <tr>
                  <th>Tender ID</th>
                  <th>Enterprise Buyer</th>
                  <th>Product / Material Scope</th>
                  <th>Target Volume</th>
                  <th>Target Budget</th>
                  <th>Submission Closes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">TND-2026-5510</span></td>
                  <td><strong>Rolls-Royce Aerospace Unit</strong></td>
                  <td>High-Temp Nickel Superalloys</td>
                  <td>5,000 kg</td>
                  <td><strong>£520,000</strong></td>
                  <td><span class="badge bg-danger">Closes in 18h</span></td>
                  <td><button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Quotation submitted for TND-2026-5510!')"><i class="fa-solid fa-paper-plane"></i> Submit Quote</button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">TND-2026-5511</span></td>
                  <td><strong>Siemens Energy Infrastructure</strong></td>
                  <td>Substation High-Voltage Insulators</td>
                  <td>1,200 units</td>
                  <td><strong>£310,000</strong></td>
                  <td>3 days left</td>
                  <td><button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Quotation submitted for TND-2026-5511!')"><i class="fa-solid fa-paper-plane"></i> Submit Quote</button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">TND-2026-5512</span></td>
                  <td><strong>GlaxoSmithKline Bio-Mfg</strong></td>
                  <td>Sterile Pharmaceutical Bioreactor Valves</td>
                  <td>800 pcs</td>
                  <td><strong>£175,000</strong></td>
                  <td>5 days left</td>
                  <td><button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Quotation submitted for TND-2026-5512!')"><i class="fa-solid fa-paper-plane"></i> Submit Quote</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "submitted-bids") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-handshake"></i>
              <div>
                <h3 class="dash-card-title">Submitted Quotes & Commercial Bids</h3>
                <p class="dash-card-subtitle">Active supplier quotation proposals under buyer review and negotiation</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search bids..." onkeyup="filterTable(this, 'bidsTable')">
              </div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="bidsTable">
              <thead>
                <tr>
                  <th>Bid Token</th>
                  <th>RFQ / Tender Reference</th>
                  <th>Target Buyer</th>
                  <th>Submitted Quote Value</th>
                  <th>Lead Time Quoted</th>
                  <th>Buyer Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">BID-2026-9041</span></td>
                  <td>RFQ-2026-8942</td>
                  <td><strong>Global Enterprise Sourcing Ltd</strong></td>
                  <td><strong>£465,000</strong></td>
                  <td>14 Business Days</td>
                  <td><span class="status-pill status-review"><i class="fa-solid fa-clock"></i> Shortlisted (Rank #1)</span></td>
                  <td><button class="btn-table-action" title="Revise Proposal" onclick="triggerMockAction('Opening Bid Revision Modal for BID-9041')"><i class="fa-solid fa-pen-to-square"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">BID-2026-9042</span></td>
                  <td>RFQ-2026-8943</td>
                  <td><strong>Airbus Procurement Group</strong></td>
                  <td><strong>£288,000</strong></td>
                  <td>21 Business Days</td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> Award Confirmed</span></td>
                  <td><button class="btn-table-action" title="View Award Letter" onclick="triggerMockAction('Downloading Formal Award Acceptance Letter')"><i class="fa-solid fa-award"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">BID-2026-9043</span></td>
                  <td>TND-2026-5510</td>
                  <td><strong>Rolls-Royce Aerospace Unit</strong></td>
                  <td><strong>£512,000</strong></td>
                  <td>10 Business Days</td>
                  <td><span class="status-pill status-bidding">Under Technical Review</span></td>
                  <td><button class="btn-table-action" title="Contact Buyer" onclick="triggerMockAction('Message sent to Rolls-Royce Lead Buyer')"><i class="fa-solid fa-envelope"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "fulfillment") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-dolly"></i>
              <div>
                <h3 class="dash-card-title">Orders in Fulfillment & Dispatch Logistics</h3>
                <p class="dash-card-subtitle">Real-time production milestones, freight container tracking, and delivery ETAs</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search orders..." onkeyup="filterTable(this, 'fulfillmentTable')">
              </div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="fulfillmentTable">
              <thead>
                <tr>
                  <th>PO Reference</th>
                  <th>Buyer Account</th>
                  <th>Material / Batch</th>
                  <th>Carrier & Tracking</th>
                  <th>Est. Arrival</th>
                  <th>Milestone Stage</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">PO-2026-4402</span></td>
                  <td><strong>Global Enterprise Sourcing Ltd</strong></td>
                  <td>Silicon Wafers (Batch #SF-90)</td>
                  <td>DHL Express Freight #883910</td>
                  <td>11 Sep 2026</td>
                  <td><span class="status-pill status-dispatched"><i class="fa-solid fa-truck-fast"></i> In Transit</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Live GPS Freight Tracking Launched')"><i class="fa-solid fa-location-dot"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">PO-2026-4409</span></td>
                  <td><strong>British Telecom Infrastructure</strong></td>
                  <td>Fiber Optic Modulators (Batch #BT-44)</td>
                  <td>FedEx Global Trade #551982</td>
                  <td>18 Sep 2026</td>
                  <td><span class="status-pill status-in-progress"><i class="fa-solid fa-gear"></i> QA Testing</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('QA Batch Milestone Marked as Complete')"><i class="fa-solid fa-check"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "invoices") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-receipt"></i>
              <div>
                <h3 class="dash-card-title">Commercial Invoices & Payment Ledger</h3>
                <p class="dash-card-subtitle">Automated ERP payment matching, Net-30 remittance advice, and cashflow status</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search invoices..." onkeyup="filterTable(this, 'invoiceTable')">
              </div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="invoiceTable">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>PO Reference</th>
                  <th>Billed Client</th>
                  <th>Invoice Amount</th>
                  <th>Due Date</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">INV-2026-8801</span></td>
                  <td>PO-2026-4401</td>
                  <td>Global Enterprise Sourcing Ltd</td>
                  <td><strong>£187,500.00</strong></td>
                  <td>15 Sep 2026</td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> Cleared & Paid</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Downloading Tax Invoice PDF...')"><i class="fa-solid fa-file-pdf"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">INV-2026-8802</span></td>
                  <td>PO-2026-4390</td>
                  <td>Airbus Procurement Unit</td>
                  <td><strong>£94,200.00</strong></td>
                  <td>28 Sep 2026</td>
                  <td><span class="status-pill status-pending"><i class="fa-solid fa-clock"></i> In 3-Way Match</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Viewing 3-way match reconciliation...')"><i class="fa-solid fa-eye"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">INV-2026-8803</span></td>
                  <td>PO-2026-4382</td>
                  <td>British Telecom Infrastructure</td>
                  <td><strong>£61,100.00</strong></td>
                  <td>05 Oct 2026</td>
                  <td><span class="status-pill status-review">Processing</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Downloading Tax Invoice PDF...')"><i class="fa-solid fa-file-pdf"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "catalog") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-layer-group"></i>
              <div>
                <h3 class="dash-card-title">Master Product Catalog & Warehouse Inventory</h3>
                <p class="dash-card-subtitle">Published catalog SKUs, enterprise contract pricing, and real-time inventory reserves</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search catalog SKUs..." onkeyup="filterTable(this, 'catalogTable')">
              </div>
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Adding New SKU to Enterprise Catalog...')">
                <i class="fa-solid fa-plus"></i>
                <span>Add SKU</span>
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="catalogTable">
              <thead>
                <tr>
                  <th>SKU Code</th>
                  <th>Product / Specification</th>
                  <th>Classification</th>
                  <th>Contract Unit Price</th>
                  <th>Available Stock</th>
                  <th>Lead Time</th>
                  <th>Stock Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">SKU-TI-GR5-01</span></td>
                  <td><strong>Titanium Grade 5 Round Bar (50mm Dia)</strong></td>
                  <td>Raw Metals</td>
                  <td><strong>£75.00 / kg</strong></td>
                  <td>18,400 kg</td>
                  <td>3-5 Days</td>
                  <td><span class="status-pill status-approved">In Stock</span></td>
                  <td><button class="btn-table-action" title="Update Price" onclick="triggerMockAction('Updated Price for SKU-TI-GR5-01')"><i class="fa-solid fa-pen-to-square"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">SKU-SI-WF3-09</span></td>
                  <td><strong>300mm Prime Silicon Wafer Ultra-Pure</strong></td>
                  <td>Semiconductors</td>
                  <td><strong>£120.00 / unit</strong></td>
                  <td>5,200 units</td>
                  <td>7 Days</td>
                  <td><span class="status-pill status-approved">In Stock</span></td>
                  <td><button class="btn-table-action" title="Update Price" onclick="triggerMockAction('Updated Price for SKU-SI-WF3-09')"><i class="fa-solid fa-pen-to-square"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">SKU-NC-SP7-12</span></td>
                  <td><strong>Nickel Inconel 718 High-Temp Billets</strong></td>
                  <td>Aerospace Alloys</td>
                  <td><strong>£104.00 / kg</strong></td>
                  <td>1,100 kg</td>
                  <td>14 Days</td>
                  <td><span class="status-pill status-review">Low Stock</span></td>
                  <td><button class="btn-table-action" title="Replenish Stock" onclick="triggerMockAction('Stock Restock Triggered for Inconel 718')"><i class="fa-solid fa-boxes-stacked"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  // ----------------------------------------------------
  // ROLE 3: ADMIN VIEWS
  // ----------------------------------------------------
  if (roleKey === "admin") {
    if (viewId === "command-center") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-gauge-high"></i>
              <div>
                <h3 class="dash-card-title">Global Supply Chain Command Center</h3>
                <p class="dash-card-subtitle">Real-time enterprise platform throughput, active regional nodes, and governance health</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Global Platform Diagnostics Ran: All 6 clusters nominal.')">
                <i class="fa-solid fa-server"></i>
                <span>Run Diagnostics</span>
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="commandCenterTable">
              <thead>
                <tr>
                  <th>Operating Region</th>
                  <th>Active Hub</th>
                  <th>Throughput YTD</th>
                  <th>ERP Synchronization</th>
                  <th>Latency</th>
                  <th>Governance Health</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>EMEA (Europe, Middle East)</strong></td>
                  <td>London Regional HQ</td>
                  <td><strong>£8.42M</strong></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> SAP Synced</span></td>
                  <td>12ms</td>
                  <td><span class="badge bg-success">100% Compliant</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Viewing EMEA Cluster Metrics')"><i class="fa-solid fa-gauge"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Americas (NA / LATAM)</strong></td>
                  <td>New York Procurement Node</td>
                  <td><strong>£4.15M</strong></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> Oracle ERP</span></td>
                  <td>16ms</td>
                  <td><span class="badge bg-success">100% Compliant</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Viewing Americas Cluster Metrics')"><i class="fa-solid fa-gauge"></i></button></td>
                </tr>
                <tr>
                  <td><strong>APAC (Asia-Pacific)</strong></td>
                  <td>Singapore Logistics Node</td>
                  <td><strong>£2.25M</strong></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> Dynamics 365</span></td>
                  <td>22ms</td>
                  <td><span class="badge bg-success">99.8% Compliant</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Viewing APAC Cluster Metrics')"><i class="fa-solid fa-gauge"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "user-access") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-users-gear"></i>
              <div>
                <h3 class="dash-card-title">Enterprise User Governance & RBAC Directory</h3>
                <p class="dash-card-subtitle">Manage multi-entity authorization tiers, spend approval thresholds, and security MFA</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search users..." onkeyup="filterTable(this, 'userAccessTable')">
              </div>
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Add User modal launched.')">
                <i class="fa-solid fa-user-plus"></i>
                <span>Add Enterprise User</span>
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="userAccessTable">
              <thead>
                <tr>
                  <th>User / Officer</th>
                  <th>Corporate Email</th>
                  <th>Role Scope</th>
                  <th>Spending Approval Limit</th>
                  <th>Security (2FA)</th>
                  <th>Status</th>
                  <th>Governance Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Marcus Vance</strong></td>
                  <td>marcus.vance@stackly-enterprise.com</td>
                  <td><span class="status-pill status-approved">Procurement Officer</span></td>
                  <td><strong>£500,000 / PO</strong></td>
                  <td><span class="badge bg-success"><i class="fa-solid fa-fingerprint"></i> MFA Active</span></td>
                  <td><span class="status-pill status-approved">Active</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Editing permissions for Marcus Vance')"><i class="fa-solid fa-pen-to-square"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Elena Rostova</strong></td>
                  <td>elena.rostova@stackly-enterprise.com</td>
                  <td><span class="status-pill status-info">Supply Chain Analyst</span></td>
                  <td><strong>£100,000 / PO</strong></td>
                  <td><span class="badge bg-success"><i class="fa-solid fa-fingerprint"></i> MFA Active</span></td>
                  <td><span class="status-pill status-approved">Active</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Editing permissions for Elena Rostova')"><i class="fa-solid fa-pen-to-square"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Sir Arthur Pendelton</strong></td>
                  <td>director.supplychain@stackly-enterprise.com</td>
                  <td><span class="status-pill status-approved">Supply Chain Director</span></td>
                  <td><strong>Unlimited (£10M+)</strong></td>
                  <td><span class="badge bg-success"><i class="fa-solid fa-fingerprint"></i> Hardware Key</span></td>
                  <td><span class="status-pill status-approved">Active</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Superadmin permissions locked.')"><i class="fa-solid fa-lock"></i></button></td>
                </tr>
                <tr>
                  <td><strong>David K. Chen</strong></td>
                  <td>audit.chen@stackly-audit.gov</td>
                  <td><span class="status-pill status-review">Compliance Auditor</span></td>
                  <td><strong>Read-Only Statutory</strong></td>
                  <td><span class="badge bg-success"><i class="fa-solid fa-fingerprint"></i> MFA Active</span></td>
                  <td><span class="status-pill status-approved">Active</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Audit privileges confirmed.')"><i class="fa-solid fa-pen-to-square"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "spend-control") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-chart-column"></i>
              <div>
                <h3 class="dash-card-title">Multi-Entity Budget Caps & Spend Control Policies</h3>
                <p class="dash-card-subtitle">Automated cost center threshold enforcement and rogue spend prevention rules</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search budgets..." onkeyup="filterTable(this, 'budgetTable')">
              </div>
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Adjusting Fiscal Spending Caps...')">
                <i class="fa-solid fa-sliders"></i>
                <span>Adjust Limits</span>
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="budgetTable">
              <thead>
                <tr>
                  <th>Cost Center</th>
                  <th>Business Unit</th>
                  <th>Annual Budget Cap</th>
                  <th>YTD Spend</th>
                  <th>Utilization</th>
                  <th>Hard-Stop Policy</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">CC-MFG-01</span></td>
                  <td><strong>Advanced Semiconductor Manufacturing</strong></td>
                  <td>£6,500,000</td>
                  <td><strong>£4,850,000</strong></td>
                  <td><span class="badge bg-primary">74.6% Utilized</span></td>
                  <td><span class="status-pill status-approved">Strict PO Required</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Viewing CC-MFG-01 spend policy')"><i class="fa-solid fa-pen-to-square"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">CC-AERO-09</span></td>
                  <td><strong>Aerospace Propulsion & Dynamics</strong></td>
                  <td>£4,800,000</td>
                  <td><strong>£3,620,000</strong></td>
                  <td><span class="badge bg-primary">75.4% Utilized</span></td>
                  <td><span class="status-pill status-approved">Director Dual Sign-off</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Viewing CC-AERO-09 spend policy')"><i class="fa-solid fa-pen-to-square"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">CC-LOG-04</span></td>
                  <td><strong>Global Fleet & Warehouse Logistics</strong></td>
                  <td>£2,500,000</td>
                  <td><strong>£2,100,000</strong></td>
                  <td><span class="badge bg-warning text-dark">84.0% Utilized</span></td>
                  <td><span class="status-pill status-review">Auto-Alert at 85%</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Adjusting CC-LOG-04 budget ceiling')"><i class="fa-solid fa-pen-to-square"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "supplier-network") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-network-wired"></i>
              <div>
                <h3 class="dash-card-title">Supplier Network KYC & Onboarding Due Diligence</h3>
                <p class="dash-card-subtitle">Sanctions screening, beneficial ownership vetting, and compliance verification</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search KYC records..." onkeyup="filterTable(this, 'kycTable')">
              </div>
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Onboard New Supplier KYC Wizard launched')">
                <i class="fa-solid fa-user-check"></i>
                <span>Approve KYC Batch</span>
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="kycTable">
              <thead>
                <tr>
                  <th>Vendor Legal Name</th>
                  <th>Jurisdiction</th>
                  <th>Company Reg No.</th>
                  <th>KYC Level</th>
                  <th>Sanctions Check</th>
                  <th>ESG Score</th>
                  <th>KYC Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Apex Precision Metals Ltd</strong></td>
                  <td>United Kingdom (GB)</td>
                  <td><span class="code-badge">UK-08819201</span></td>
                  <td><span class="badge bg-success">Tier-1 Full KYC</span></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> Clear</span></td>
                  <td>94 / 100</td>
                  <td><span class="status-pill status-approved">Verified</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Viewing KYC Dossier for Apex Metals')"><i class="fa-solid fa-folder-open"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Global Semiconductor Corp</strong></td>
                  <td>Germany (DE) / EU</td>
                  <td><span class="code-badge">DE-HRB99410</span></td>
                  <td><span class="badge bg-success">Tier-1 Full KYC</span></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> Clear</span></td>
                  <td>91 / 100</td>
                  <td><span class="status-pill status-approved">Verified</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Viewing KYC Dossier for Global Semi')"><i class="fa-solid fa-folder-open"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Shenzhen Quantum Optics Co.</strong></td>
                  <td>China (CN) / APAC</td>
                  <td><span class="code-badge">CN-91440300</span></td>
                  <td><span class="badge bg-warning text-dark">Tier-2 Enhanced KYC</span></td>
                  <td><span class="status-pill status-review"><i class="fa-solid fa-clock"></i> In Screening</span></td>
                  <td>88 / 100</td>
                  <td><span class="status-pill status-review">Under Review</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Approved Enhanced KYC for Shenzhen Quantum')"><i class="fa-solid fa-user-check"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "logistics") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-earth-americas"></i>
              <div>
                <h3 class="dash-card-title">Multi-Hub Freight, Warehousing & ESG Carbon Tracking</h3>
                <p class="dash-card-subtitle">Real-time intermodal logistics, container fill rates, and Scope 3 carbon metrics</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search logistics hubs..." onkeyup="filterTable(this, 'logisticsTable')">
              </div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="logisticsTable">
              <thead>
                <tr>
                  <th>Hub / Transit Corridor</th>
                  <th>Primary Logistics Carrier</th>
                  <th>Active Freight Shipments</th>
                  <th>On-Time Transit Rate</th>
                  <th>Container Capacity Load</th>
                  <th>Carbon Footprint (Scope 3)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Southampton Port -> London Central</strong></td>
                  <td>Nordic Logistics Solutions</td>
                  <td><strong>14 Shipments</strong></td>
                  <td>98.4%</td>
                  <td><span class="badge bg-success">94% Optimal</span></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-leaf"></i> 14.2g CO2/ton-km</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Viewing Corridor Routing Analytics')"><i class="fa-solid fa-route"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Rotterdam -> Frankfurt Cleanbay Hub</strong></td>
                  <td>DHL Global Forwarding</td>
                  <td><strong>22 Shipments</strong></td>
                  <td>99.1%</td>
                  <td><span class="badge bg-success">96% Optimal</span></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-leaf"></i> 11.8g CO2/ton-km</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Viewing Rotterdam Route ESG Dossier')"><i class="fa-solid fa-leaf"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Singapore -> Liverpool Seaport</strong></td>
                  <td>Maersk Intermodal Line</td>
                  <td><strong>8 Shipments</strong></td>
                  <td>97.6%</td>
                  <td><span class="badge bg-primary">89% Optimal</span></td>
                  <td><span class="status-pill status-review"><i class="fa-solid fa-ship"></i> 18.5g CO2/ton-km</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Viewing Ocean Freight Satellite Tracking')"><i class="fa-solid fa-location-crosshairs"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "system-integrations") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-sliders"></i>
              <div>
                <h3 class="dash-card-title">Enterprise ERP Connectors & Real-Time API Sync</h3>
                <p class="dash-card-subtitle">Automated bi-directional data pipelines with SAP S/4HANA, Oracle NetSuite & Dynamics</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Full Bi-directional ERP Sync Executed across all 4 connectors!')">
                <i class="fa-solid fa-arrows-rotate"></i>
                <span>Sync All ERPs</span>
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="integrationTable">
              <thead>
                <tr>
                  <th>Enterprise System</th>
                  <th>Sync Endpoint</th>
                  <th>Data Scope</th>
                  <th>Last Sync Time</th>
                  <th>Sync Latency</th>
                  <th>Pipeline Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>SAP S/4HANA Enterprise Cloud</strong></td>
                  <td><code>/api/v3/sap/purchase-orders</code></td>
                  <td>PO, GRN, GL Accounts</td>
                  <td>2 mins ago</td>
                  <td>18ms</td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-circle-check"></i> Connected & Synced</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('SAP S/4HANA Sync Triggered')"><i class="fa-solid fa-rotate"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Oracle NetSuite Financials</strong></td>
                  <td><code>/api/v2/netsuite/invoices</code></td>
                  <td>Invoices, Tax, 3-Way Match</td>
                  <td>4 mins ago</td>
                  <td>24ms</td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-circle-check"></i> Connected & Synced</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Oracle NetSuite Sync Triggered')"><i class="fa-solid fa-rotate"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Microsoft Dynamics 365 Supply Chain</strong></td>
                  <td><code>/api/v1/d365/inventory</code></td>
                  <td>SKU Inventory, Warehousing</td>
                  <td>1 min ago</td>
                  <td>14ms</td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-circle-check"></i> Connected & Synced</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Dynamics 365 Sync Triggered')"><i class="fa-solid fa-rotate"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  // ----------------------------------------------------
  // ROLE 4: AUDITOR VIEWS
  // ----------------------------------------------------
  if (roleKey === "auditor") {
    if (viewId === "compliance-hub") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-shield-virus"></i>
              <div>
                <h3 class="dash-card-title">Statutory Compliance & SOX Section 404 Control Framework</h3>
                <p class="dash-card-subtitle">Internal controls over financial reporting, anti-bribery governance, and audit sign-offs</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search SOX controls..." onkeyup="filterTable(this, 'soxTable')">
              </div>
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Generating Formal SOX 404 Audit Certificate...')">
                <i class="fa-solid fa-stamp"></i>
                <span>Sign-Off SOX Audit</span>
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="soxTable">
              <thead>
                <tr>
                  <th>Control ID</th>
                  <th>Governance Domain</th>
                  <th>Testing Frequency</th>
                  <th>Last Tested</th>
                  <th>Pass Rate</th>
                  <th>Control Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">SOX-404-PO-01</span></td>
                  <td><strong>Purchase Order Authorization Limits</strong></td>
                  <td>Continuous Automated</td>
                  <td>Today, 14:00 UTC</td>
                  <td><strong>100%</strong></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> Passed</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Viewing SOX-404-PO-01 test log')"><i class="fa-solid fa-eye"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">SOX-404-3WM-04</span></td>
                  <td><strong>3-Way Invoice Price & Quantity Variance</strong></td>
                  <td>Continuous Automated</td>
                  <td>Today, 15:30 UTC</td>
                  <td><strong>99.7%</strong></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> Passed</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Viewing SOX-404-3WM-04 test log')"><i class="fa-solid fa-eye"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">SOX-404-KYC-08</span></td>
                  <td><strong>Anti-Bribery & FCPA Vendor Sanctions</strong></td>
                  <td>Daily Screening</td>
                  <td>Today, 06:00 UTC</td>
                  <td><strong>100%</strong></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> Passed</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Viewing SOX-404-KYC-08 test log')"><i class="fa-solid fa-eye"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "three-way-match") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-code-compare"></i>
              <div>
                <h3 class="dash-card-title">Automated 3-Way Matching & Discrepancy Reconciliation</h3>
                <p class="dash-card-subtitle">Algorithmic comparison: Purchase Order (PO) vs Goods Receipt (GRN) vs Vendor Invoice (INV)</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search match tokens..." onkeyup="filterTable(this, 'threeWayMatchTable')">
              </div>
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Batch 3-way match reconciliation executed: 1,420 records processed.')">
                <i class="fa-solid fa-bolt"></i>
                <span>Run Auto-Match Batch</span>
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="threeWayMatchTable">
              <thead>
                <tr>
                  <th>Match Token</th>
                  <th>PO Reference</th>
                  <th>GRN Reference</th>
                  <th>Vendor Invoice</th>
                  <th>Price Variance</th>
                  <th>Quantity Variance</th>
                  <th>Audit Resolution</th>
                  <th>Release Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">3WM-88301</span></td>
                  <td>PO-2026-4401 (£187,500)</td>
                  <td>GRN-9801 (2,500 kg)</td>
                  <td>INV-8801 (£187,500)</td>
                  <td><span class="badge bg-success">0.00%</span></td>
                  <td><span class="badge bg-success">0.00% (Exact)</span></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> 100% Matched</span></td>
                  <td><button class="btn-table-action" title="Approve Payment" onclick="triggerMockAction('Payment Released for 3WM-88301')"><i class="fa-solid fa-check-double text-success"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">3WM-88302</span></td>
                  <td>PO-2026-4402 (£340,000)</td>
                  <td>GRN-9804 (50,000 pcs)</td>
                  <td>INV-8809 (£340,000)</td>
                  <td><span class="badge bg-success">0.00%</span></td>
                  <td><span class="badge bg-success">0.00% (Exact)</span></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> 100% Matched</span></td>
                  <td><button class="btn-table-action" title="Approve Payment" onclick="triggerMockAction('Payment Released for 3WM-88302')"><i class="fa-solid fa-check-double text-success"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">3WM-88303</span></td>
                  <td>PO-2026-4395 (£45,000)</td>
                  <td>GRN-9799 (880 pcs)</td>
                  <td>INV-8790 (£46,200)</td>
                  <td><span class="badge bg-danger">+2.66% (+£1,200)</span></td>
                  <td><span class="badge bg-warning text-dark">-120 pcs short</span></td>
                  <td><span class="status-pill status-rejected"><i class="fa-solid fa-triangle-exclamation"></i> Price & Qty Variance Flag</span></td>
                  <td><button class="btn-table-action btn-table-danger" title="Request Credit Note" onclick="triggerMockAction('Credit Note Requested from Supplier for £1,200 discrepancy')"><i class="fa-solid fa-file-circle-exclamation"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "certifications") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-certificate"></i>
              <div>
                <h3 class="dash-card-title">Vendor ESG, Anti-Bribery & Due Diligence Dossiers</h3>
                <p class="dash-card-subtitle">ISO 9001/14001/27001 certifications, FCPA affidavits, and labor standards</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search certificates..." onkeyup="filterTable(this, 'certificationsTable')">
              </div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="certificationsTable">
              <thead>
                <tr>
                  <th>Supplier Legal Entity</th>
                  <th>Certification Scope</th>
                  <th>Accredited Registrar</th>
                  <th>Audit Expiration</th>
                  <th>Anti-Bribery Status</th>
                  <th>Compliance Tier</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Apex Precision Metals Ltd</strong></td>
                  <td><span class="code-badge">ISO 9001:2015 & AS9100D</span></td>
                  <td>BSI Assurance UK</td>
                  <td>14 May 2028</td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> FCPA Verified</span></td>
                  <td><span class="badge bg-success">Tier-1 Unconditional</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Downloading ISO Accreditation Certificate')"><i class="fa-solid fa-file-arrow-down"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Global Semiconductor Corp</strong></td>
                  <td><span class="code-badge">ISO 14001 & IATF 16949</span></td>
                  <td>TÜV SÜD Germany</td>
                  <td>22 Oct 2027</td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> FCPA Verified</span></td>
                  <td><span class="badge bg-success">Tier-1 Unconditional</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Downloading ISO Accreditation Certificate')"><i class="fa-solid fa-file-arrow-down"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Nordic Logistics Solutions</strong></td>
                  <td><span class="code-badge">ISO 28000 & ISO 27001</span></td>
                  <td>DNV GL Norway</td>
                  <td>08 Mar 2027</td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> FCPA Verified</span></td>
                  <td><span class="badge bg-success">Tier-1 Unconditional</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Downloading ISO Accreditation Certificate')"><i class="fa-solid fa-file-arrow-down"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "audit-trail") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-link"></i>
              <div>
                <h3 class="dash-card-title">Cryptographic SHA-256 Immutable Audit Log</h3>
                <p class="dash-card-subtitle">Tamper-evident chronological activity log for statutory SOX Section 404 inspections</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Downloading cryptographically hashed log archive...')">
                <i class="fa-solid fa-download"></i>
                <span>Download Ledger</span>
              </button>
            </div>
          </div>
          <div class="p-4">
            <ul class="activity-feed-list">
              <li class="activity-feed-item">
                <div class="activity-feed-icon icon-green"><i class="fa-solid fa-signature"></i></div>
                <div class="activity-feed-content">
                  <div class="activity-feed-title">PO-2026-4401 Approved & Signed</div>
                  <div class="activity-feed-text">Approved by Dir. Marcus Vance. Hash: <code>0x7a8f9c2d1b4e883a9920cf6b34</code></div>
                  <div class="activity-feed-time">Today, 15:42:01 UTC | IP: 194.80.231.10 (London HQ)</div>
                </div>
              </li>
              <li class="activity-feed-item">
                <div class="activity-feed-icon icon-blue"><i class="fa-solid fa-barcode"></i></div>
                <div class="activity-feed-content">
                  <div class="activity-feed-title">Goods Receipt Note (GRN-9801) Registered</div>
                  <div class="activity-feed-text">Warehouse Dock 4 intake. Batch QA Passed (100% tolerance).</div>
                  <div class="activity-feed-time">Today, 14:18:22 UTC | IP: 194.80.231.14 (Southampton Hub)</div>
                </div>
              </li>
              <li class="activity-feed-item">
                <div class="activity-feed-icon icon-yellow"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div class="activity-feed-content">
                  <div class="activity-feed-title">Variance Flagged on 3WM-88303</div>
                  <div class="activity-feed-text">Invoice INV-8790 exceeded purchase order threshold by +2.66%. Auto-hold applied.</div>
                  <div class="activity-feed-time">Yesterday, 18:04:11 UTC | System Automated Rule Engine</div>
                </div>
              </li>
              <li class="activity-feed-item">
                <div class="activity-feed-icon icon-purple"><i class="fa-solid fa-key"></i></div>
                <div class="activity-feed-content">
                  <div class="activity-feed-title">Enterprise RBAC Policy Updated for Analyst Tier</div>
                  <div class="activity-feed-text">Updated by Arthur Pendelton. 2FA Security Enforcement Level 3 enabled.</div>
                  <div class="activity-feed-time">28 Aug 2026, 09:12:44 UTC | IP: 194.80.231.02</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      `;
    } else if (viewId === "tax-reports") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-landmark"></i>
              <div>
                <h3 class="dash-card-title">Statutory Customs, Cross-Border VAT & Tax Reconciliation</h3>
                <p class="dash-card-subtitle">HMRC / EU customs tariff codes, reverse-charge VAT reconciliation, and duty drawdowns</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search tax filings..." onkeyup="filterTable(this, 'taxReportsTable')">
              </div>
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Exporting Statutory Customs Filing Dossier...')">
                <i class="fa-solid fa-file-csv"></i>
                <span>Export Tax Ledger</span>
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="taxReportsTable">
              <thead>
                <tr>
                  <th>Filing Reference</th>
                  <th>Customs Port / Authority</th>
                  <th>HS Tariff Code</th>
                  <th>Declared Value</th>
                  <th>VAT / Duty Reclaim</th>
                  <th>Statutory Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">TAX-2026-UK-881</span></td>
                  <td>HMRC Customs (Southampton)</td>
                  <td><code>HS 8108.90</code> (Titanium)</td>
                  <td>£187,500</td>
                  <td><strong>£37,500 (20% VAT Reclaimed)</strong></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> Reconciled</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Downloading HMRC Tax Filing Form')"><i class="fa-solid fa-file-invoice"></i></button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">TAX-2026-EU-412</span></td>
                  <td>German Zoll (Frankfurt Cargo)</td>
                  <td><code>HS 8542.31</code> (Integrated Chips)</td>
                  <td>£340,000</td>
                  <td><strong>£64,600 (19% MwSt Reclaimed)</strong></td>
                  <td><span class="status-pill status-approved"><i class="fa-solid fa-check"></i> Reconciled</span></td>
                  <td><button class="btn-table-action" onclick="triggerMockAction('Downloading Zoll Reclaim Form')"><i class="fa-solid fa-file-invoice"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (viewId === "fraud-detection") {
      return `
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title-group">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <div>
                <h3 class="dash-card-title">Automated AI Fraud & Procurement Anomaly Exceptions</h3>
                <p class="dash-card-subtitle">Real-time heuristics: split-PO evasion detection, circular supplier bidding, and IBAN shifts</p>
              </div>
            </div>
            <div class="dash-card-controls">
              <div class="table-filter-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="table-filter-input" placeholder="Search anomaly alerts..." onkeyup="filterTable(this, 'fraudTable')">
              </div>
              <button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Deep Heuristic Fraud Scan Complete: 0 critical breaches.')">
                <i class="fa-solid fa-shield-halved"></i>
                <span>Run Heuristic Scan</span>
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-b2b-table" id="fraudTable">
              <thead>
                <tr>
                  <th>Alert Token</th>
                  <th>Anomaly Detection Rule</th>
                  <th>Flagged Entity / PO</th>
                  <th>Calculated Risk</th>
                  <th>Investigative Status</th>
                  <th>Remediation Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code-badge">ALT-2026-0041</span></td>
                  <td><strong>3-Way Quantity Variance Spike</strong></td>
                  <td>PO-2026-4395 (Vanguard Chemical)</td>
                  <td><span class="badge bg-warning text-dark">Medium (12% short)</span></td>
                  <td><span class="status-pill status-review">Hold Applied</span></td>
                  <td><button class="table-action-btn btn-primary-action" onclick="triggerMockAction('Discrepancy Investigation Cleared with Supplier Credit Note')"><i class="fa-solid fa-check"></i> Clear Alert</button></td>
                </tr>
                <tr>
                  <td><span class="code-badge">ALT-2026-0039</span></td>
                  <td><strong>Rapid IBAN Remittance Change</strong></td>
                  <td>Apex Precision Metals Ltd</td>
                  <td><span class="badge bg-success">Low (Verified Dual Auth)</span></td>
                  <td><span class="status-pill status-approved">Verified & Closed</span></td>
                  <td><button class="table-action-btn" onclick="triggerMockAction('Viewing Audit Verification Note for IBAN Update')"><i class="fa-solid fa-file-lines"></i> View Log</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  // Fallback view if any unknown viewId is requested
  return `
    <div class="dash-card">
      <div class="dash-card-header">
        <h3 class="dash-card-title">${currentNav ? currentNav.label : "Enterprise Module"}</h3>
      </div>
      <div class="p-4 text-center">
        <i class="fa-solid fa-cubes text-primary fs-1 mb-3"></i>
        <h4>Enterprise Module Active</h4>
        <p class="text-muted">Viewing live records synchronized with Oracle & SAP ERP procurement database.</p>
        <button class="btn btn-primary btn-sm" onclick="triggerMockAction('Refreshed real-time data cache.')"><i class="fa-solid fa-arrows-rotate me-1"></i> Refresh Data</button>
      </div>
    </div>
  `;
}

/* ==========================================================================
   7. Interactive Role Switcher
   ========================================================================== */
function setupRoleSwitcher() {
  document.querySelectorAll("[data-role-switch]").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const targetRole = this.getAttribute("data-role-switch");
      if (DASHBOARD_ROLES[targetRole]) {
        currentRoleKey = targetRole;

        // Update local session role
        if (!currentUserData) {
          currentUserData = {
            role: targetRole,
            name: DASHBOARD_ROLES[targetRole].title,
          };
        } else {
          currentUserData.role = targetRole;
        }

        try {
          localStorage.setItem(
            "b2b_procurement_user",
            JSON.stringify(currentUserData),
          );
          sessionStorage.setItem(
            "b2b_procurement_user",
            JSON.stringify(currentUserData),
          );
        } catch (err) {}

        renderRoleView(targetRole);
        showToastNotification(
          `Switched to <strong>${DASHBOARD_ROLES[targetRole].title}</strong> workspace.`,
          "success",
        );
      }
    });
  });
}

/* ==========================================================================
   8. Mobile Drawer & Offcanvas Controls
   ========================================================================== */
function setupMobileDrawer() {
  const toggleBtn = document.getElementById("mobileSidebarToggle");
  const closeBtn = document.getElementById("sidebarCloseBtn");
  const sidebar = document.getElementById("dashboardSidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (toggleBtn && sidebar && overlay) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.add("show");
      overlay.classList.add("show");
    });
  }

  if (closeBtn && sidebar && overlay) {
    closeBtn.addEventListener("click", () => {
      sidebar.classList.remove("show");
      overlay.classList.remove("show");
    });
  }

  if (overlay && sidebar) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("show");
      overlay.classList.remove("show");
    });
  }
}

/* ==========================================================================
   9. Global Search & Table Filter
   ========================================================================== */
function setupGlobalSearch() {
  const globalSearchInput = document.getElementById("topbarGlobalSearch");
  if (globalSearchInput) {
    globalSearchInput.addEventListener("keyup", function (e) {
      const q = this.value.toLowerCase().trim();
      const activeTable = document.querySelector(".custom-b2b-table");
      if (!activeTable) return;

      const rows = activeTable.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        if (text.includes(q)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  }
}

function filterTable(input, tableId) {
  const q = input.value.toLowerCase().trim();
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = table.querySelectorAll("tbody tr");
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    if (text.includes(q)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

/* ==========================================================================
   10. Toast Notifications & Interactive Action Feedback
   ========================================================================== */
function setupToastContainer() {
  if (!document.getElementById("toastContainer")) {
    const toastBox = document.createElement("div");
    toastBox.id = "toastContainer";
    toastBox.className = "dashboard-toast-container";
    document.body.appendChild(toastBox);
  }
}

function showToastNotification(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "dashboard-toast";
  toast.innerHTML = `
    <i class="fa-solid fa-circle-check text-success fs-5"></i>
    <div>${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

function triggerMockAction(actionText) {
  showToastNotification(
    `<strong>Action Executed:</strong> ${actionText}`,
    "success",
  );
}

function initViewInteractions() {
  // Re-bind tooltips or buttons inside the dynamically rendered content if any
}
