import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../lanterns/app.js", import.meta.url), "utf8");
const functionSource = source.match(/function frameCartParams\([\s\S]*?\n}/)?.[0];

assert.ok(functionSource, "frameCartParams must remain available to the Lantern cart builder");

function frameCartParams(calc, quote, descriptionText) {
  const context = { DATA: { frameQcode: "fallback" }, calc, quote, descriptionText, Math, result: null };
  vm.runInNewContext(`${functionSource}; result = frameCartParams(calc, quote, descriptionText);`, context);
  return context.result;
}

test("forms Lantern frame orders with the Halo shopping-cart contract", () => {
  const params = frameCartParams(
    { shortname: "Hanging Lantern", quantity: 3 },
    {
      frameQcode: "Q203210-09",
      packingLengthCm: 500,
      packingWidthCm: 57,
      packingHeightCm: 30,
      totalWeightKg: 16.72,
      frame: { sell: 1234.25 },
    },
    "Quantity: 3 Cylindrical Hanging Lanterns.",
  );

  assert.deepEqual(Object.keys(params), [
    "qcode", "quantity", "shortname", "description", "packinglengthcm",
    "packingwidthcm", "packingheightcm", "weightkg", "price",
  ]);
  assert.equal(params.qcode, "Q203210-09");
  assert.equal(params.quantity, 3);
  assert.equal(params.packinglengthcm, 500);
  assert.equal(params.packingwidthcm, 57);
  assert.equal(params.packingheightcm, 30);
  assert.equal(params.weightkg, 17);
  assert.equal(params.price, 1235);
});
