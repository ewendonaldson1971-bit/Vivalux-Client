(function () {
  "use strict";

  var API_BASE = "https://vivadpricing-app.calmtree-53cc02bb.australiasoutheast.azurecontainerapps.io";
  var CONFIG_CACHE_KEY = "vivalux-pricing-config-cache-v2";
  var QUOTE_CACHE_KEY = "vivalux-pricing-quote-cache-v1";
  var CONFIG_CACHE_TTL = 5 * 60 * 1000;
  var QUOTE_CACHE_TTL = 60 * 1000;
  var registrations = {};
  var appliedVersions = {};
  var configRequests = {};
  var quoteRequests = {};

  function readCache(key) {
    try {
      return JSON.parse(sessionStorage.getItem(key) || "{}") || {};
    } catch {
      return {};
    }
  }

  function writeCache(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Pricing still works when browser storage is unavailable. */
    }
  }

  function userScope(user) {
    return String(user.username || "") + "|" + String(user.signedInAt || "");
  }

  function applyConfig(product, payload) {
    var registration = registrations[product];
    if (!registration || !payload || !payload.config) return false;
    var version = String(payload.version || 0);
    if (appliedVersions[product] === version) return false;
    appliedVersions[product] = version;
    registration(payload.config, merge);
    document.documentElement.dataset.pricingConfig = "connected";
    return true;
  }

  function merge(target, source) {
    if (Array.isArray(source)) {
      target.splice(0, target.length);
      source.forEach(function (item) { target.push(item); });
      return target;
    }
    Object.keys(source || {}).forEach(function (key) {
      var value = source[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) target[key] = {};
        merge(target[key], value);
      } else if (Array.isArray(value) && Array.isArray(target[key])) {
        merge(target[key], value);
      } else {
        target[key] = value;
      }
    });
    return target;
  }

  function load(product) {
    var registration = registrations[product];
    var user = window.VivaluxAuth && window.VivaluxAuth.getUser();
    if (!registration || !user || !user.pricingToken) return Promise.resolve(false);
    var apiBase = user.pricingApiBase || API_BASE;
    var scope = userScope(user);
    var cacheKey = scope + "|" + product;
    var configCache = readCache(CONFIG_CACHE_KEY);
    var cached = configCache[cacheKey];
    if (cached && Date.now() - cached.savedAt < CONFIG_CACHE_TTL) {
      applyConfig(product, cached.payload);
      return Promise.resolve(true);
    }
    if (configRequests[cacheKey]) return configRequests[cacheKey];
    configRequests[cacheKey] = fetch(apiBase + "/api/v1/config/vivalux?product=" + encodeURIComponent(product), {
      headers: { Authorization: "Bearer " + user.pricingToken, Accept: "application/json" }
    }).then(function (response) {
      if (response.status === 401 && window.VivaluxAuth) window.VivaluxAuth.clearPricingToken();
      if (!response.ok) throw new Error("Pricing configuration is unavailable.");
      return response.json();
    }).then(function (payload) {
      configCache[cacheKey] = { savedAt: Date.now(), payload: payload };
      writeCache(CONFIG_CACHE_KEY, configCache);
      applyConfig(product, payload);
      return true;
    }).catch(function () {
      document.documentElement.dataset.pricingConfig = "fallback";
      return false;
    }).finally(function () {
      delete configRequests[cacheKey];
    });
    return configRequests[cacheKey];
  }

  function quote(product, takeoff) {
    var user = window.VivaluxAuth && window.VivaluxAuth.getUser();
    if (!user || !user.pricingToken) return Promise.reject(new Error("Sign in to load pricing."));
    var apiBase = user.pricingApiBase || API_BASE;
    var scope = userScope(user);
    var takeoffJson = JSON.stringify(takeoff || {});
    var quoteCache = readCache(QUOTE_CACHE_KEY);
    var cached = quoteCache[product];
    if (cached && cached.scope === scope && cached.takeoff === takeoffJson && Date.now() - cached.savedAt < QUOTE_CACHE_TTL) {
      return Promise.resolve(cached.payload);
    }
    var requestKey = scope + "|" + product + "|" + takeoffJson;
    if (quoteRequests[requestKey]) return quoteRequests[requestKey];
    quoteRequests[requestKey] = fetch(apiBase + "/api/v1/pricing/vivalux/quote", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + user.pricingToken,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ product: product, takeoff: takeoff })
    }).then(function (response) {
      if (response.status === 401 && window.VivaluxAuth) window.VivaluxAuth.clearPricingToken();
      return response.json().then(function (payload) {
        if (!response.ok) throw new Error(payload.error || "Pricing is unavailable.");
        return payload;
      });
    }).then(function (payload) {
      quoteCache[product] = { savedAt: Date.now(), scope: scope, takeoff: takeoffJson, payload: payload };
      writeCache(QUOTE_CACHE_KEY, quoteCache);
      return payload;
    }).finally(function () {
      delete quoteRequests[requestKey];
    });
    return quoteRequests[requestKey];
  }

  window.VivaluxPricing = {
    apiBase: API_BASE,
    merge: merge,
    quote: quote,
    register: function (product, apply) {
      registrations[product] = apply;
      return load(product);
    },
    reload: load
  };

  window.addEventListener("vivalux-auth-change", function () {
    Object.keys(registrations).forEach(load);
  });
}());
