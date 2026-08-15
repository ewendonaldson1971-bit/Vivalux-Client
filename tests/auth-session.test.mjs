import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("shares builder login independently of the pricing token", async () => {
  const [auth, pricing] = await Promise.all([
    readFile(new URL("auth.js", root), "utf8"),
    readFile(new URL("pricing-config.js", root), "utf8"),
  ]);

  assert.match(auth, /localStorage\.setItem\(SESSION_KEY/);
  assert.match(auth, /if \(user && user\.username\)/);
  assert.doesNotMatch(auth, /if \(user && !user\.pricingToken\)/);
  assert.match(auth, /clearPricingToken: safeClearPricingToken/);
  assert.equal((auth.match(/https:\/\/vivadpricing-app|https:\/\/vivad-pricing-configurator/g) ?? []).length, 2);
  assert.match(auth, /requestPricingToken\(username, password, index \+ 1\)/);
  assert.match(auth, /authenticatedUser\.pricingApiBase = pricing\.apiBase/);
  assert.equal((pricing.match(/user\.pricingApiBase \|\| API_BASE/g) ?? []).length, 2);
  assert.doesNotMatch(pricing, /response\.status === 401[^\n]+signOut/);
  assert.equal((pricing.match(/response\.status === 401[^\n]+clearPricingToken/g) ?? []).length, 2);
});
