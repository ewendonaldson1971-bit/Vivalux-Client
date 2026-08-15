import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../lanterns/app.js", import.meta.url), "utf8");
const functionSource = source.match(/function diagramGeometry\([\s\S]*?\n}/)?.[0];

assert.ok(functionSource, "diagramGeometry must remain available to the Lantern renderer");

function geometry(diameterMm, heightMm) {
  const context = { diameterMm, heightMm, result: null };
  vm.runInNewContext(`${functionSource}; result = diagramGeometry(diameterMm, heightMm);`, context);
  return context.result;
}

test("draws Lantern height in proportion to its diameter", () => {
  for (const [diameterMm, heightMm] of [[2000, 500], [2000, 1000], [2000, 3000], [4000, 1200]]) {
    const drawing = geometry(diameterMm, heightMm);
    assert.ok(Math.abs(drawing.bodyHeight / (drawing.rx * 2) - heightMm / diameterMm) < 1e-12);
  }
});

test("changes the rendered cylinder when height changes", () => {
  const short = geometry(2000, 500);
  const medium = geometry(2000, 1000);
  const tall = geometry(2000, 3000);

  assert.ok(short.bodyHeight < medium.bodyHeight);
  assert.ok(medium.bodyHeight < tall.bodyHeight);
  assert.ok(short.rx > medium.rx);
  assert.ok(medium.rx > tall.rx);
});

test("keeps every supported proportion inside the diagram viewport", () => {
  for (const [diameterMm, heightMm] of [[1500, 78], [1500, 3000], [3000, 1000], [6000, 3000]]) {
    const drawing = geometry(diameterMm, heightMm);
    assert.ok(drawing.leftX >= 130 && drawing.rightX <= 630);
    assert.ok(drawing.topY - drawing.ry >= 88);
    assert.ok(drawing.bottomY + drawing.ry <= 430);
  }
});
