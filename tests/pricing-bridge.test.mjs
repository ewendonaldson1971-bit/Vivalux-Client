import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../pricing-bridge.html", import.meta.url), "utf8");

test("pricing bridge is restricted to the VivaFrame designer and product", () => {
  assert.match(source, /https:\/\/vivaframe-designer-vivad\.netlify\.app/);
  assert.match(source, /event\.origin !== DESIGNER_ORIGIN/);
  assert.match(source, /event\.source !== window\.parent && event\.source !== window\.opener/);
  assert.match(source, /var PRODUCT = "vivaframe"/);
  assert.doesNotMatch(source, /pricingToken\s*:/);
  assert.doesNotMatch(source, /src="auth\.js"/);
});

test("pricing bridge supports config and quote requests", () => {
  assert.match(source, /request\.action === "config"/);
  assert.match(source, /request\.action === "quote"/);
  assert.match(source, /window\.VivaluxPricing\.register/);
  assert.match(source, /window\.VivaluxPricing\.quote/);
});
