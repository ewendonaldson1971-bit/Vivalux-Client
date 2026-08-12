(function () {
  "use strict";

  var SESSION_KEY = "vivalux-auth-session";
  var AUTH_CHANGE_EVENT = "vivalux-auth-change";
  // Deployed Google Apps Script Web App URL for login, emails and cart notifications.
  var LOGIN_NOTIFICATION_URL = "https://script.google.com/macros/s/AKfycbzf1aPV_TjMYsUcGry51I9bErT9JL_waBIUDtvJPlePr6BOwg8gcYqEGy7f5wNuRtO6/exec";
  var PRICING_TOKEN_URL = "https://vivad-pricing-configurator.vivad-gpt-0611.chatgpt.site/api/auth/token";
  var currentScript = document.currentScript;
  var rootUrl = currentScript ? new URL("./", currentScript.src) : new URL("./", window.location.href);

  document.documentElement.classList.add("vivalux-auth-pending");

  function safeReadSession() {
    try {
      var sharedSession = localStorage.getItem(SESSION_KEY);
      if (sharedSession) return JSON.parse(sharedSession);

      // Migrate sessions created before login was shared across browser tabs.
      var tabSession = sessionStorage.getItem(SESSION_KEY);
      if (tabSession) {
        localStorage.setItem(SESSION_KEY, tabSession);
        return JSON.parse(tabSession);
      }
      return null;
    } catch {
      return null;
    }
  }

  function safeWriteSession(user) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* Browser storage can be blocked; the current page still gets the user. */
    }
  }

  function safeClearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* Ignore storage errors. */
    }
  }

  function parseDiscount(value) {
    var raw = String(value || "").trim();
    if (!raw) return 0;
    var hadPercent = raw.includes("%");
    var number = Number(raw.replace(/%/g, "").trim());
    if (!Number.isFinite(number)) return 0;
    if (!hadPercent && number > 0 && number <= 1) number *= 100;
    return Math.max(0, Math.min(100, number));
  }

  function getCurrentUser() {
    return safeReadSession() || window.__vivaluxCurrentUser || null;
  }

  function getDiscountPercentage() {
    var user = getCurrentUser();
    return user ? parseDiscount(user.discountPercentage) : 0;
  }

  function getDiscountMultiplier() {
    return Math.max(0, 1 - getDiscountPercentage() / 100);
  }

  function refreshPricing() {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: getCurrentUser() }));
    window.setTimeout(function () {
      if (typeof window.render === "function") window.render();
    }, 0);
  }

  function removeLogin() {
    var overlay = document.getElementById("vivaluxAuthOverlay");
    if (overlay) overlay.remove();
  }

  function renderUserBar() {
    var existing = document.getElementById("vivaluxUserBar");
    var user = getCurrentUser();
    if (!user) {
      if (existing) existing.remove();
      return;
    }
    if (!existing) {
      existing = document.createElement("div");
      existing.id = "vivaluxUserBar";
      existing.className = "vivalux-user-bar";
      existing.innerHTML = '<span data-auth-user></span><button type="button">Sign out</button>';
      existing.querySelector("button").addEventListener("click", function () {
        window.__vivaluxCurrentUser = null;
        safeClearSession();
        renderUserBar();
        showLogin();
        refreshPricing();
      });
      document.body.appendChild(existing);
    }
    existing.querySelector("[data-auth-user]").textContent = user.username;
  }

  function unlock(user) {
    if (user) {
      window.__vivaluxCurrentUser = user;
      safeWriteSession(user);
    }
    document.documentElement.classList.remove("vivalux-auth-pending", "vivalux-auth-locked");
    removeLogin();
    renderUserBar();
    refreshPricing();
  }

  function postNotification(payload, options) {
    if (!LOGIN_NOTIFICATION_URL || !payload) return Promise.reject(new Error("Missing mail endpoint."));
    var body = JSON.stringify(payload);
    try {
      if (options && options.beacon && navigator.sendBeacon) {
        var beaconPayload = new Blob([body], { type: "text/plain;charset=utf-8" });
        if (navigator.sendBeacon(LOGIN_NOTIFICATION_URL, beaconPayload)) return Promise.resolve();
      }
    } catch {
      /* Fall back to fetch below. */
    }
    if (typeof fetch !== "function") return Promise.reject(new Error("This browser cannot send mail requests."));
    return fetch(LOGIN_NOTIFICATION_URL, {
      method: "POST",
      mode: "no-cors",
      keepalive: !!(options && options.keepalive),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: body
    });
  }

  function postAuthJsonRequest(payload) {
    if (!LOGIN_NOTIFICATION_URL || !payload) return Promise.reject(new Error("Missing login endpoint."));
    if (typeof fetch !== "function") return Promise.reject(new Error("This browser cannot check login directly."));

    return new Promise(function (resolve, reject) {
      var settled = false;
      var controller = typeof AbortController === "function" ? new AbortController() : null;
      var timeout = window.setTimeout(function () {
        if (controller) controller.abort();
        finish(reject, new Error("The login service timed out."));
      }, 10000);

      function finish(done, value) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        done(value);
      }

      fetch(LOGIN_NOTIFICATION_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      }).then(function (response) {
        return response.text().then(function (text) {
          var data;
          try {
            data = JSON.parse(text);
          } catch (error) {
            throw new Error("The login service returned an unreadable response.");
          }
          if (!response.ok) throw new Error("The login service returned an error.");
          return data;
        });
      }).then(function (data) {
        finish(resolve, data);
      }).catch(function (error) {
        finish(reject, error);
      });
    });
  }

  function postAuthFrameRequest(payload) {
    if (!LOGIN_NOTIFICATION_URL || !payload) return Promise.reject(new Error("Missing login endpoint."));

    return new Promise(function (resolve, reject) {
      var requestId = "vivaluxAuth" + Date.now() + Math.floor(Math.random() * 1000000);
      var frameName = requestId + "Frame";
      var timeout = window.setTimeout(function () {
        cleanup();
        reject(new Error("The login service timed out."));
      }, 18000);
      var iframe = document.createElement("iframe");
      var form = document.createElement("form");
      var input = document.createElement("input");
      var requestPayload = Object.assign({}, payload, {
        requestId: requestId,
        parentOrigin: window.location.origin
      });

      function cleanup() {
        window.clearTimeout(timeout);
        window.removeEventListener("message", receiveMessage);
        if (form.parentNode) form.parentNode.removeChild(form);
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }

      function receiveMessage(event) {
        var data = event.data || {};
        if (!data || data.type !== "vivalux-auth-response" || data.requestId !== requestId) return;
        cleanup();
        resolve(data.result || {});
      }

      iframe.name = frameName;
      iframe.hidden = true;
      iframe.setAttribute("aria-hidden", "true");

      form.method = "POST";
      form.action = LOGIN_NOTIFICATION_URL;
      form.target = frameName;
      form.hidden = true;

      input.type = "hidden";
      input.name = "payload";
      input.value = JSON.stringify(requestPayload);
      form.appendChild(input);

      window.addEventListener("message", receiveMessage);
      document.body.appendChild(iframe);
      document.body.appendChild(form);
      form.submit();
    });
  }

  function postAuthRequest(payload) {
    return postAuthJsonRequest(payload).catch(function () {
      return postAuthFrameRequest(payload);
    });
  }

  function authenticateUser(username, password) {
    return postAuthRequest({
      type: "authenticate",
      username: username,
      password: password
    }).then(function (result) {
      if (!result || !result.ok || !result.user) {
        var error = new Error(result && result.error === "invalidCredentials"
          ? "User name or password is incorrect."
          : "Could not check login.");
        error.code = result && result.error;
        throw error;
      }
      var authenticatedUser = {
        username: result.user.username,
        discountPercentage: parseDiscount(result.user.discountPercentage),
        signedInAt: new Date().toISOString()
      };
      return fetch(PRICING_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ username: username, password: password })
      }).then(function (response) {
        if (!response.ok) throw new Error("Pricing token unavailable.");
        return response.json();
      }).then(function (pricing) {
        authenticatedUser.pricingToken = pricing.token;
        return authenticatedUser;
      }).catch(function () {
        return authenticatedUser;
      });
    });
  }

  function sendAccessRequest(request) {
    return postNotification({
      type: "accessRequest",
      firstName: request.firstName,
      lastName: request.lastName,
      companyName: request.companyName,
      email: request.email
    });
  }

  function trimText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function parsePossiblyEncodedJson(value) {
    if (!value) return null;
    var raw = String(value);
    for (var index = 0; index < 3; index += 1) {
      try {
        return JSON.parse(raw);
      } catch {
        /* Try a decoded value below. */
      }
      var decoded = decodePossiblyEncoded(raw);
      if (decoded === raw) return null;
      raw = decoded;
    }
    return null;
  }

  function decodePossiblyEncoded(value) {
    var raw = String(value || "");
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  function normalizeCartUrl(value) {
    var url = String(value || "");
    for (var index = 0; index < 3 && !/^https?:\/\//i.test(url); index += 1) {
      var decoded = decodePossiblyEncoded(url);
      if (decoded === url) break;
      url = decoded;
    }
    if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
      var parsed = parsePossiblyEncodedJson(url);
      if (parsed) return String(parsed);
    }
    return url;
  }

  function cartUrlsFromControl(control) {
    if (!control || control.disabled || control.getAttribute("aria-disabled") === "true") return [];

    if (control.dataset && control.dataset.bundle) {
      var bundle = parsePossiblyEncodedJson(control.dataset.bundle);
      return Array.isArray(bundle) ? bundle.filter(Boolean).map(normalizeCartUrl) : [];
    }

    if (control.dataset && control.dataset.url) {
      var dataUrl = control.dataset.url;
      var parsed = parsePossiblyEncodedJson(dataUrl);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(normalizeCartUrl);
      if (parsed) return [normalizeCartUrl(parsed)];
      return [normalizeCartUrl(dataUrl)].filter(Boolean);
    }

    if (control.href) return [normalizeCartUrl(control.href)];

    return [];
  }

  function paramsFromUrl(url) {
    var parsedUrl;
    try {
      parsedUrl = new URL(url, window.location.href);
    } catch {
      return {};
    }

    var params = {};
    parsedUrl.searchParams.forEach(function (value, key) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        if (!Array.isArray(params[key])) params[key] = [params[key]];
        params[key].push(value);
      } else {
        params[key] = value;
      }
    });
    return params;
  }

  function cartItemFromUrl(url, index) {
    var params = paramsFromUrl(url);
    var quantity = Number(params.quantity || 0);
    var price = Number(params.price || 0);
    var item = {
      itemNumber: index + 1,
      qcode: params.qcode || "",
      quantity: params.quantity || "",
      description: params.description || params.shortname || "",
      shortname: params.shortname || "",
      price: params.price || "",
      width: params.width || "",
      height: params.height || "",
      packingLengthCm: params.packinglengthcm || "",
      packingWidthCm: params.packingwidthcm || "",
      packingHeightCm: params.packingheightcm || "",
      weightKg: params.weightkg || "",
      url: url,
      params: params
    };
    if (Number.isFinite(quantity) && quantity > 0 && Number.isFinite(price)) {
      item.totalPrice = String(quantity * price);
    }
    return item;
  }

  function sendCartNotification(control, urls) {
    var user = getCurrentUser();
    if (!user || !user.username || !urls.length) return;

    postNotification({
      type: "cartClick",
      username: user.username,
      builder: document.title || trimText(document.querySelector("h1") && document.querySelector("h1").textContent),
      pageUrl: window.location.href,
      clickedLabel: trimText(control.textContent),
      clickedAt: new Date().toISOString(),
      urls: urls,
      items: urls.map(cartItemFromUrl)
    }, { beacon: true, keepalive: true }).catch(function () {
      /* Cart notifications must not block users from adding items to cart. */
    });
  }

  function bindCartNotifications() {
    document.addEventListener("click", function (event) {
      var control = event.target.closest(".cart-button");
      if (!control || !trimText(control.textContent).toLowerCase().includes("add")) return;
      var urls = cartUrlsFromControl(control);
      if (!urls.length) return;
      sendCartNotification(control, urls);
    }, true);
  }

  function showLogin() {
    document.documentElement.classList.remove("vivalux-auth-pending");
    document.documentElement.classList.add("vivalux-auth-locked");
    if (document.getElementById("vivaluxAuthOverlay")) return;

    var overlay = document.createElement("div");
    overlay.id = "vivaluxAuthOverlay";
    overlay.className = "vivalux-auth-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML =
      '<form class="vivalux-auth-panel">' +
        '<div class="vivalux-auth-brand">' +
          '<img class="vivalux-auth-logo" src="' + new URL("vivad-logo.png", rootUrl).href + '" alt="Vivad">' +
          '<h1 class="vivalux-auth-title">Vivtrack 4 Builder</h1>' +
        '</div>' +
        '<label class="vivalux-auth-field">User name<input name="username" type="text" autocomplete="username" required></label>' +
        '<label class="vivalux-auth-field">Password<input name="password" type="password" autocomplete="current-password" required></label>' +
        '<button class="vivalux-auth-button" type="submit">Sign in</button>' +
        '<button class="vivalux-auth-secondary" type="button" data-request-access>Request Access</button>' +
        '<p class="vivalux-auth-message" role="status" aria-live="polite"></p>' +
        '<p class="vivalux-auth-note">To Use the Vivtrack 4 Builder App, Click Request Access and we will supply you a temporary Password. <br>You will also need to be logged into your Vivtrack account to add to your shopping cart.</p>' +
      '</form>' +
      '<div class="vivalux-access-modal" hidden>' +
        '<form class="vivalux-access-panel" role="dialog" aria-modal="true" aria-labelledby="vivaluxAccessTitle">' +
          '<div class="vivalux-access-heading">' +
            '<h2 id="vivaluxAccessTitle">Request Access</h2>' +
            '<button class="vivalux-access-close" type="button" aria-label="Close request access" data-access-close>&times;</button>' +
          '</div>' +
          '<label class="vivalux-auth-field">First Name<input name="firstName" type="text" autocomplete="given-name" required></label>' +
          '<label class="vivalux-auth-field">Last Name<input name="lastName" type="text" autocomplete="family-name" required></label>' +
          '<label class="vivalux-auth-field">Company Name<input name="companyName" type="text" autocomplete="organization" required></label>' +
          '<label class="vivalux-auth-field">Email address<input name="email" type="email" autocomplete="email" required></label>' +
          '<div class="vivalux-access-actions">' +
            '<button class="vivalux-auth-secondary" type="button" data-access-cancel>Cancel</button>' +
            '<button class="vivalux-auth-button" type="submit">Submit Request</button>' +
          '</div>' +
          '<p class="vivalux-auth-message" role="status" aria-live="polite"></p>' +
        '</form>' +
      '</div>';

    var form = overlay.querySelector("form");
    var message = overlay.querySelector(".vivalux-auth-message");
    var button = overlay.querySelector("button");
    var requestAccessButton = overlay.querySelector("[data-request-access]");
    var accessModal = overlay.querySelector(".vivalux-access-modal");
    var accessForm = overlay.querySelector(".vivalux-access-panel");
    var accessMessage = accessForm.querySelector(".vivalux-auth-message");
    var accessSubmitButton = accessForm.querySelector('button[type="submit"]');

    function openAccessDialog() {
      accessForm.reset();
      accessMessage.textContent = "";
      accessSubmitButton.disabled = false;
      accessModal.hidden = false;
      accessForm.elements.firstName.focus();
    }

    function closeAccessDialog() {
      if (accessSubmitButton.disabled) return;
      accessModal.hidden = true;
      requestAccessButton.focus();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var username = form.elements.username.value.trim();
      var password = form.elements.password.value.trim();
      button.disabled = true;
      message.textContent = "Checking login.";
      authenticateUser(username, password).then(function (authenticatedUser) {
        unlock(authenticatedUser);
      }).catch(function (error) {
        message.textContent = error && error.code === "invalidCredentials"
          ? "User name or password is incorrect."
          : "Could not check login.";
        button.disabled = false;
        form.elements.password.select();
      });
    });

    requestAccessButton.addEventListener("click", openAccessDialog);
    accessForm.querySelector("[data-access-close]").addEventListener("click", closeAccessDialog);
    accessForm.querySelector("[data-access-cancel]").addEventListener("click", closeAccessDialog);
    accessModal.addEventListener("click", function (event) {
      if (event.target === accessModal) closeAccessDialog();
    });
    accessForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var request = {
        firstName: accessForm.elements.firstName.value.trim(),
        lastName: accessForm.elements.lastName.value.trim(),
        companyName: accessForm.elements.companyName.value.trim(),
        email: accessForm.elements.email.value.trim()
      };
      accessSubmitButton.disabled = true;
      accessMessage.textContent = "Sending request.";
      sendAccessRequest(request).then(function () {
        accessMessage.textContent = "Request sent.";
        accessForm.reset();
        accessSubmitButton.disabled = false;
        window.setTimeout(closeAccessDialog, 1200);
      }).catch(function () {
        accessMessage.textContent = "Could not send request. Please try again.";
        accessSubmitButton.disabled = false;
      });
    });

    document.body.appendChild(overlay);
    form.elements.username.focus();
  }

  window.VivaluxAuth = {
    getUser: getCurrentUser,
    getDiscountPercentage: getDiscountPercentage,
    getDiscountMultiplier: getDiscountMultiplier,
    signOut: function () {
      window.__vivaluxCurrentUser = null;
      safeClearSession();
      renderUserBar();
      showLogin();
      refreshPricing();
    },
    checkLogin: authenticateUser
  };

  window.addEventListener("storage", function (event) {
    if (event.key !== SESSION_KEY) return;

    var user = null;
    try {
      user = JSON.parse(event.newValue || "null");
    } catch {
      user = null;
    }

    if (user && user.pricingToken) {
      unlock(user);
      return;
    }

    window.__vivaluxCurrentUser = null;
    renderUserBar();
    showLogin();
    refreshPricing();
  });

  document.addEventListener("DOMContentLoaded", function () {
    bindCartNotifications();
    var user = getCurrentUser();
    if (user && !user.pricingToken) {
      safeClearSession();
      window.__vivaluxCurrentUser = null;
      user = null;
    }
    if (user) {
      unlock(user);
    } else {
      showLogin();
    }
  });
})();
