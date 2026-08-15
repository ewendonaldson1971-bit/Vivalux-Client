import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../pricing-config.js", import.meta.url), "utf8");

function createPage(storage, calls) {
  const user = {
    username: "speed-test",
    signedInAt: "2026-08-15T00:00:00.000Z",
    pricingToken: "test-token",
  };
  const sessionStorage = {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, value); },
  };
  const document = { documentElement: { dataset: {} } };
  const window = {
    VivaluxAuth: { getUser() { return user; }, clearPricingToken() {} },
    addEventListener() {},
  };
  const fetch = async (url) => {
    calls.push(url);
    if (url.includes("/config/")) {
      return { ok: true, status: 200, json: async () => ({ version: 1, config: { rate: 10 } }) };
    }
    return { ok: true, status: 200, json: async () => ({ calculation: { total: { sell: 100 } } }) };
  };
  vm.runInNewContext(source, { window, document, sessionStorage, fetch, Promise, JSON, Date, String, Object, Array });
  return window.VivaluxPricing;
}

test("deduplicates pricing calls and reuses them across tab navigation", async () => {
  const storage = new Map();
  const firstPageCalls = [];
  const firstPage = createPage(storage, firstPageCalls);
  let applied = 0;

  await Promise.all([
    firstPage.register("r300", () => { applied += 1; }),
    firstPage.reload("r300"),
  ]);
  const takeoff = { width: 1000, height: 2000 };
  const [firstQuote, duplicateQuote] = await Promise.all([
    firstPage.quote("r300", takeoff),
    firstPage.quote("r300", takeoff),
  ]);

  assert.equal(firstPageCalls.filter((url) => url.includes("/config/")).length, 1);
  assert.equal(firstPageCalls.filter((url) => url.includes("/pricing/")).length, 1);
  assert.equal(applied, 1);
  assert.deepEqual(firstQuote, duplicateQuote);

  const nextTabCalls = [];
  const nextTab = createPage(storage, nextTabCalls);
  await nextTab.register("r300", () => {});
  const cachedQuote = await nextTab.quote("r300", takeoff);

  assert.equal(nextTabCalls.length, 0);
  assert.equal(cachedQuote.calculation.total.sell, 100);
});
