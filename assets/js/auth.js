document.addEventListener("DOMContentLoaded", function () {
  initPasswordToggles();
  initPasswordStrengthValidation();
  initUsernameRestrictions();
  initConfirmPasswordMatch();
  initLoginForm();
  initRegisterForm();
  initEmptyLinks404Redirect();
});

/* ==========================================================================
   0. Global Empty / # Link Interceptor -> 404 Redirection
   ========================================================================== */
function initEmptyLinks404Redirect() {
  document.addEventListener("click", function (e) {
    const anchor = e.target.closest("a");
    if (!anchor) return;

    const currentPage = window.location.pathname.split("/").pop() || "";
    if (currentPage === "404.html") return;

    const rawHref = anchor.getAttribute("href");

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
   1. Show / Hide Password Toggles
   ========================================================================== */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".password-toggle-btn");
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;

      const icon = this.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        if (icon) {
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        }
      } else {
        input.type = "password";
        if (icon) {
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
      }
    });
  });
}

/* ==========================================================================
   2. Password Strength Evaluation & Weak Password Validation
   ========================================================================== */
function evaluatePasswordStrength(password) {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  if (checks.length) score += 1;
  if (checks.hasLower && checks.hasUpper) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSpecial) score += 1;

  let strength = "weak";
  if (password.length === 0) {
    strength = "none";
  } else if (score <= 1 || password.length < 6) {
    strength = "weak";
  } else if (score === 2) {
    strength = "fair";
  } else if (score === 3) {
    strength = "good";
  } else if (score >= 4) {
    strength = "strong";
  }

  return { score, strength, checks };
}

function initPasswordStrengthValidation() {
  const passwordInputs = document.querySelectorAll(
    ".validate-strength-password",
  );

  passwordInputs.forEach((input) => {
    const container = input.closest(".form-group");
    if (!container) return;

    const fillBar = container.querySelector(".strength-meter-fill");
    const statusText = container.querySelector(".strength-value");
    const criteriaLength = container.querySelector(".criteria-length");
    const criteriaUpper = container.querySelector(".criteria-upper");
    const criteriaLower = container.querySelector(".criteria-lower");
    const criteriaNumberSymbol = container.querySelector(
      ".criteria-number-symbol",
    );

    input.addEventListener("input", function () {
      const val = this.value;
      const result = evaluatePasswordStrength(val);

      if (fillBar && statusText) {
        fillBar.className = "strength-meter-fill";
        statusText.className = "strength-value";

        if (result.strength === "none") {
          statusText.textContent = "Enter Password";
        } else if (result.strength === "weak") {
          fillBar.classList.add("strength-weak");
          statusText.classList.add("text-weak");
          statusText.textContent = "Weak (Insecure)";
        } else if (result.strength === "fair") {
          fillBar.classList.add("strength-fair");
          statusText.classList.add("text-fair");
          statusText.textContent = "Fair (Moderate)";
        } else if (result.strength === "good") {
          fillBar.classList.add("strength-good");
          statusText.classList.add("text-good");
          statusText.textContent = "Good";
        } else if (result.strength === "strong") {
          fillBar.classList.add("strength-strong");
          statusText.classList.add("text-strong");
          statusText.textContent = "Strong (Enterprise Grade)";
        }
      }

      // Update individual checklist criteria if present
      if (criteriaLength) {
        updateCriteriaItem(criteriaLength, result.checks.length);
      }
      if (criteriaUpper) {
        updateCriteriaItem(criteriaUpper, result.checks.hasUpper);
      }
      if (criteriaLower) {
        updateCriteriaItem(criteriaLower, result.checks.hasLower);
      }
      if (criteriaNumberSymbol) {
        updateCriteriaItem(
          criteriaNumberSymbol,
          result.checks.hasNumber || result.checks.hasSpecial,
        );
      }

      // Clear general invalid feedback on typing if length > 0
      if (val.length > 0) {
        clearFieldError(input);
      }
    });
  });

  function updateCriteriaItem(element, isMet) {
    const icon = element.querySelector("i");
    if (isMet) {
      element.classList.add("met");
      element.classList.remove("unmet");
      if (icon) {
        icon.className = "fa-solid fa-circle-check";
      }
    } else {
      element.classList.remove("met");
      element.classList.add("unmet");
      if (icon) {
        icon.className = "fa-regular fa-circle";
      }
    }
  }
}

/* ==========================================================================
   3. Username: Strictly Prevent Numbers & Special Characters in the Field
   ========================================================================== */
function initUsernameRestrictions() {
  const usernameInput = document.getElementById("regUsername");
  if (!usernameInput) return;

  const restrictedNotice = document.getElementById("usernameCharNotice");
  let noticeTimeout = null;

  function showRestrictedWarning() {
    if (!restrictedNotice) return;
    restrictedNotice.classList.add("show");
    if (noticeTimeout) clearTimeout(noticeTimeout);
    noticeTimeout = setTimeout(() => {
      restrictedNotice.classList.remove("show");
    }, 2500);
  }

  // Intercept KeyDown to physically prevent typing numbers & symbols
  usernameInput.addEventListener("keydown", function (e) {
    // Allow navigation, control, deletion keys
    const allowedControlKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
      "Home",
      "End",
      "Enter",
    ];

    if (
      allowedControlKeys.includes(e.key) ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey
    ) {
      return;
    }

    // Only allow alphabetic characters (A-Z, a-z) and space
    const isLetterOrSpace = /^[a-zA-Z\s]$/.test(e.key);

    if (!isLetterOrSpace) {
      e.preventDefault();
      showRestrictedWarning();
    }
  });

  // Intercept Paste / Input events to strip any numbers or special characters immediately
  usernameInput.addEventListener("input", function () {
    const rawVal = this.value;
    const sanitizedVal = rawVal.replace(/[^a-zA-Z\s]/g, "");

    if (rawVal !== sanitizedVal) {
      this.value = sanitizedVal;
      showRestrictedWarning();
    }

    if (this.value.trim().length > 0) {
      clearFieldError(this);
    }
  });
}

/* ==========================================================================
   4. Password & Confirm Password Real-Time Match Checking
   ========================================================================== */
function initConfirmPasswordMatch() {
  const passwordInput = document.getElementById("regPassword");
  const confirmPasswordInput = document.getElementById("regConfirmPassword");
  const matchIcon = document.getElementById("confirmPasswordMatchIcon");

  if (!passwordInput || !confirmPasswordInput) return;

  function checkMatch() {
    const pwd = passwordInput.value;
    const confirmPwd = confirmPasswordInput.value;

    if (!confirmPwd) {
      if (matchIcon) matchIcon.className = "field-status-icon";
      return;
    }

    if (pwd === confirmPwd && pwd.length > 0) {
      if (matchIcon) {
        matchIcon.className = "field-status-icon status-valid";
        matchIcon.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
      }
      clearFieldError(confirmPasswordInput);
    } else {
      if (matchIcon) {
        matchIcon.className = "field-status-icon status-invalid";
        matchIcon.innerHTML = `<i class="fa-solid fa-circle-xmark"></i>`;
      }
    }
  }

  confirmPasswordInput.addEventListener("input", checkMatch);
  passwordInput.addEventListener("input", function () {
    if (confirmPasswordInput.value.length > 0) {
      checkMatch();
    }
  });
}

/* ==========================================================================
   5. Helper Utilities for Validation & UI State
   ========================================================================== */
function setFieldError(input, message) {
  input.classList.add("is-invalid");
  input.classList.remove("is-valid");

  const container = input.closest(".form-group");
  if (!container) return;

  const errorEl = container.querySelector(".field-error-msg");
  if (errorEl) {
    errorEl.innerHTML = `<i class="fa-solid fa-circle-exclamation me-1"></i>${message}`;
    errorEl.classList.add("visible");
  }
}

function clearFieldError(input) {
  input.classList.remove("is-invalid");
  const container = input.closest(".form-group");
  if (!container) return;

  const errorEl = container.querySelector(".field-error-msg");
  if (errorEl) {
    errorEl.classList.remove("visible");
    errorEl.textContent = "";
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/* ==========================================================================
   6. Login Form Validation & Submission
   ========================================================================== */
function initLoginForm() {
  const form = document.getElementById("loginAuthForm");
  if (!form) return;

  const roleSelect = document.getElementById("loginRole");
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const rememberCheckbox = document.getElementById("loginRemember");
  const submitBtn = document.getElementById("loginSubmitBtn");
  const alertContainer = document.getElementById("loginAlertContainer");

  // Pre-fill from saved session if available
  try {
    const savedUser = JSON.parse(
      localStorage.getItem("b2b_procurement_user") || "null",
    );
    if (savedUser) {
      if (savedUser.role && roleSelect && !roleSelect.value) {
        roleSelect.value = savedUser.role;
      }
      if (savedUser.email && emailInput && !emailInput.value) {
        emailInput.value = savedUser.email;
      }
    }
  } catch (e) {}

  // Real-time error clearing on change
  if (roleSelect) {
    roleSelect.addEventListener("change", () => clearFieldError(roleSelect));
  }
  if (emailInput) {
    emailInput.addEventListener("input", () => clearFieldError(emailInput));
  }
  if (rememberCheckbox) {
    rememberCheckbox.addEventListener("change", () => {
      const container = rememberCheckbox.closest(".custom-checkbox-container");
      if (container) container.classList.remove("is-invalid");
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let hasError = false;

    // 1. Role required validation
    if (!roleSelect.value || roleSelect.value === "") {
      setFieldError(roleSelect, "Please select your enterprise role.");
      hasError = true;
    } else {
      clearFieldError(roleSelect);
    }

    // 2. Email required and format validation
    if (!emailInput.value.trim()) {
      setFieldError(emailInput, "Email address is required.");
      hasError = true;
    } else if (!isValidEmail(emailInput.value.trim())) {
      setFieldError(
        emailInput,
        "Please enter a valid corporate email address.",
      );
      hasError = true;
    } else {
      clearFieldError(emailInput);
    }

    // 3. Password required and weak password check
    if (!passwordInput.value) {
      setFieldError(passwordInput, "Password is required.");
      hasError = true;
    } else {
      const strength = evaluatePasswordStrength(passwordInput.value);
      if (strength.strength === "weak") {
        setFieldError(
          passwordInput,
          "Weak password! Enterprise policy requires at least 8 characters with numbers or symbols.",
        );
        hasError = true;
      } else {
        clearFieldError(passwordInput);
      }
    }

    // 4. Remember Me required check
    if (!rememberCheckbox.checked) {
      const container = rememberCheckbox.closest(".custom-checkbox-container");
      if (container) container.classList.add("is-invalid");
      hasError = true;
      if (alertContainer) {
        alertContainer.style.display = "block";
        alertContainer.innerHTML = `
          <div class="auth-alert alert-danger">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>Please accept 'Remember me on this trusted device' to proceed.</span>
          </div>`;
      }
    } else {
      const container = rememberCheckbox.closest(".custom-checkbox-container");
      if (container) container.classList.remove("is-invalid");
      if (alertContainer) alertContainer.style.display = "none";
    }

    if (hasError) {
      return;
    }

    // Save authenticated user session data
    const roleValue = roleSelect.value;
    const emailValue = emailInput.value.trim();
    const rememberValue = rememberCheckbox.checked;

    let derivedName = emailValue.split("@")[0].replace(/[._-]/g, " ");
    derivedName = derivedName
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const authUserData = {
      role: roleValue,
      email: emailValue,
      name: derivedName || "Enterprise Officer",
      remember: rememberValue,
      loggedInAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        "b2b_procurement_user",
        JSON.stringify(authUserData),
      );
      sessionStorage.setItem(
        "b2b_procurement_user",
        JSON.stringify(authUserData),
      );
    } catch (err) {
      console.warn("Storage quota or error:", err);
    }

    // Process Login Submission
    const btnText = submitBtn.querySelector(".btn-text");
    const btnSpinner = submitBtn.querySelector(".btn-spinner");

    submitBtn.disabled = true;
    if (btnText) btnText.textContent = "Authenticating & Loading Dashboard...";
    if (btnSpinner) btnSpinner.style.display = "inline-block";

    setTimeout(() => {
      // Show Success State
      const successOverlay = document.getElementById("loginSuccessOverlay");
      if (successOverlay) {
        successOverlay.classList.add("active");
        const progressBar = successOverlay.querySelector(
          ".redirect-progress-fill",
        );
        if (progressBar) {
          setTimeout(() => {
            progressBar.style.width = "100%";
          }, 100);
        }

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1800);
      } else {
        window.location.href = "dashboard.html";
      }
    }, 1200);
  });
}

/* ==========================================================================
   7. Register Form Validation & Submission (with Redirection to Login)
   ========================================================================== */
function initRegisterForm() {
  const form = document.getElementById("registerAuthForm");
  if (!form) return;

  const usernameInput = document.getElementById("regUsername");
  const roleSelect = document.getElementById("regRole");
  const emailInput = document.getElementById("regEmail");
  const passwordInput = document.getElementById("regPassword");
  const confirmPasswordInput = document.getElementById("regConfirmPassword");
  const termsCheckbox = document.getElementById("regTerms");
  const submitBtn = document.getElementById("registerSubmitBtn");
  const alertContainer = document.getElementById("registerAlertContainer");

  // Real-time clearing
  if (roleSelect) {
    roleSelect.addEventListener("change", () => clearFieldError(roleSelect));
  }
  if (emailInput) {
    emailInput.addEventListener("input", () => clearFieldError(emailInput));
  }
  if (termsCheckbox) {
    termsCheckbox.addEventListener("change", () => {
      const container = termsCheckbox.closest(".custom-checkbox-container");
      if (container) container.classList.remove("is-invalid");
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let hasError = false;

    // 1. Username required & letter validation
    const usernameVal = usernameInput.value.trim();
    if (!usernameVal) {
      setFieldError(usernameInput, "Full name / username is required.");
      hasError = true;
    } else if (usernameVal.length < 3) {
      setFieldError(
        usernameInput,
        "Username must contain at least 3 characters.",
      );
      hasError = true;
    } else if (!/^[a-zA-Z\s]+$/.test(usernameVal)) {
      setFieldError(
        usernameInput,
        "Username can only contain alphabetic letters and spaces.",
      );
      hasError = true;
    } else {
      clearFieldError(usernameInput);
    }

    // 2. Role selection required
    if (!roleSelect.value || roleSelect.value === "") {
      setFieldError(
        roleSelect,
        "Please select an enterprise organization role.",
      );
      hasError = true;
    } else {
      clearFieldError(roleSelect);
    }

    // 3. Email required and valid format
    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      setFieldError(emailInput, "Corporate email address is required.");
      hasError = true;
    } else if (!isValidEmail(emailVal)) {
      setFieldError(emailInput, "Please enter a valid corporate email format.");
      hasError = true;
    } else {
      clearFieldError(emailInput);
    }

    // 4. Password required and weak password validation
    const pwdVal = passwordInput.value;
    if (!pwdVal) {
      setFieldError(passwordInput, "Password is required.");
      hasError = true;
    } else {
      const strength = evaluatePasswordStrength(pwdVal);
      if (strength.strength === "weak") {
        setFieldError(
          passwordInput,
          "Weak password! Must be at least 8 characters and include a number or special character.",
        );
        hasError = true;
      } else {
        clearFieldError(passwordInput);
      }
    }

    // 5. Confirm Password required & matching check
    const confirmPwdVal = confirmPasswordInput.value;
    if (!confirmPwdVal) {
      setFieldError(confirmPasswordInput, "Please confirm your password.");
      hasError = true;
    } else if (pwdVal !== confirmPwdVal) {
      setFieldError(
        confirmPasswordInput,
        "Passwords do not match. Please verify.",
      );
      hasError = true;
    } else {
      clearFieldError(confirmPasswordInput);
    }

    // 6. Terms & Conditions checkbox required
    if (!termsCheckbox.checked) {
      const container = termsCheckbox.closest(".custom-checkbox-container");
      if (container) container.classList.add("is-invalid");
      hasError = true;
      if (alertContainer) {
        alertContainer.style.display = "block";
        alertContainer.innerHTML = `
          <div class="auth-alert alert-danger">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>You must agree to the Enterprise Terms & Conditions to create an account.</span>
          </div>`;
      }
    } else {
      const container = termsCheckbox.closest(".custom-checkbox-container");
      if (container) container.classList.remove("is-invalid");
      if (alertContainer) alertContainer.style.display = "none";
    }

    if (hasError) {
      return;
    }

    // Process Register Submission & Redirection
    const btnText = submitBtn.querySelector(".btn-text");
    const btnSpinner = submitBtn.querySelector(".btn-spinner");

    submitBtn.disabled = true;
    if (btnText) btnText.textContent = "Creating Enterprise Account...";
    if (btnSpinner) btnSpinner.style.display = "inline-block";

    setTimeout(() => {
      // Show Success Modal / Overlay with Redirection Countdown
      const successOverlay = document.getElementById("registerSuccessOverlay");
      if (successOverlay) {
        successOverlay.classList.add("active");
        const progressBar = successOverlay.querySelector(
          ".redirect-progress-fill",
        );
        if (progressBar) {
          setTimeout(() => {
            progressBar.style.width = "100%";
          }, 100);
        }

        // Redirect to Login Page after brief success preview
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        window.location.href = "login.html";
      }
    }, 1400);
  });
}
