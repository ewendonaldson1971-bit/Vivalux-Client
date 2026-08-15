import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../lanterns/app.js", import.meta.url), "utf8");
const functionSource = source.match(/function geometry\([\s\S]*?\n}/)?.[0];

assert.ok(functionSource, "geometry must remain available to the Lantern packing controls");

function geometry(maxPackingLengthMm) {
  const context = {
    DATA: { innerDiameterOffsetMm: 80, miniBraceSpacingMm: 2000, miniBraceHeightOffsetMm: 77, rollingLengthMm: 5000 },
    input: { diameterMm: 2000, heightMm: 1000, maxPackingLength: { name: "Test", mm: maxPackingLengthMm } },
    Math,
    result: null,
  };
  vm.runInNewContext(`${functionSource}; result = geometry(input);`, context);
  return context.result;
}

test("maximum packing length controls Lantern segments and joiners", () => {
  const long = geometry(5600);
  const short = geometry(3000);

  assert.equal(long.rollingLengthQty, 4);
  assert.equal(long.joinerQty, 8);
  assert.equal(Math.round(long.ringSegmentLengthMm), 3142);
  assert.equal(short.rollingLengthQty, 6);
  assert.equal(short.joinerQty, 12);
  assert.equal(Math.round(short.ringSegmentLengthMm), 2094);
});
