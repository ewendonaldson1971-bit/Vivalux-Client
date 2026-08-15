(function () {
  "use strict";

  var API_BASE = "https://vivadpricing-app.calmtree-53cc02bb.australiasoutheast.azurecontainerapps.io";
  var registrations = {};

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
    return fetch(API_BASE + "/api/v1/config/vivalux?product=" + encodeURIComponent(product), {
      headers: { Authorization: "Bearer " + user.pricingToken, Accept: "application/json" }
    }).then(function (response) {
      if (response.status === 401 && window.VivaluxAuth) window.VivaluxAuth.clearPricingToken();
      if (!response.ok) throw new Error("Pricing configuration is unavailable.");
      return response.json();
    }).then(function (payload) {
      registration(payload.config, merge);
      document.documentElement.dataset.pricingConfig = "connected";
      return true;
    }).catch(function () {
      document.documentElement.dataset.pricingConfig = "fallback";
      return false;
    });
  }

  function quote(product, takeoff) {
    var user = window.VivaluxAuth && window.VivaluxAuth.getUser();
    if (!user || !user.pricingToken) return Promise.reject(new Error("Sign in to load pricing."));
    return fetch(API_BASE + "/api/v1/pricing/vivalux/quote", {
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
    });
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
