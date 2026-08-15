import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("shares only sessions with a valid pricing token", async () => {
  const [auth, pricing] = await Promise.all([
    readFile(new URL("auth.js", root), "utf8"),
    readFile(new URL("pricing-config.js", root), "utf8"),
  ]);

  assert.match(auth, /localStorage\.setItem\(SESSION_KEY/);
  assert.match(auth, /if \(user && user\.pricingToken\)/);
  assert.match(auth, /if \(user && user\.username && user\.pricingToken\)/);
  assert.match(auth, /clearPricingToken: safeClearPricingToken/);
  assert.match(auth, /PRICING_API_BASE = "https:\/\/vivadpricing-app/);
  assert.doesNotMatch(auth, /vivad-pricing-configurator\.vivad-gpt/);
  assert.match(auth, /authenticatedUser\.pricingApiBase = pricing\.apiBase/);
  assert.doesNotMatch(auth, /requestPricingToken\(username, password\)[\s\S]*?catch\(function \(\) \{\s*return authenticatedUser/);
  assert.match(auth, /Could not connect to the Pricing Engine\. Please try again\./);
  assert.equal((pricing.match(/user\.pricingApiBase \|\| API_BASE/g) ?? []).length, 2);
  assert.doesNotMatch(pricing, /response\.status === 401[^\n]+signOut/);
  assert.equal((pricing.match(/response\.status === 401[^\n]+clearPricingToken/g) ?? []).length, 2);
  assert.match(auth, /showLogin\("Your Pricing Engine session expired\. Please sign in again\."\)/);
  assert.match(pricing, /CONFIG_CACHE_TTL = 5 \* 60 \* 1000/);
  assert.match(pricing, /QUOTE_CACHE_TTL = 60 \* 1000/);
  assert.match(pricing, /if \(configRequests\[cacheKey\]\) return configRequests\[cacheKey\]/);
  assert.match(pricing, /if \(quoteRequests\[requestKey\]\) return quoteRequests\[requestKey\]/);
  assert.match(pricing, /sessionStorage\.setItem\(key, JSON\.stringify\(value\)\)/);
});
