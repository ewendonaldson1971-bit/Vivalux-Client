(function () {
  "use strict";

  var API_BASE = "https://vivad-pricing-configurator.vivad-gpt-0611.chatgpt.site";
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

  window.VivaluxPricing = {
    apiBase: API_BASE,
    merge: merge,
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
