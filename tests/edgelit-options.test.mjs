import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../edgelit.html", import.meta.url), "utf8");

test("includes both three-edge Edgelit lighting options", () => {
  assert.match(source, /8 Edgelit Top and 2 Sides", edges: \["top", "left", "right"\]/);
  assert.match(source, /9 Edgelit Bottom and 2 Sides", edges: \["bottom", "left", "right"\]/);
});

test("uses selected edges for LEDs, power, cost and description", () => {
  assert.match(source, /cfg\.lighting\.edges\.forEach\(\(edge\) =>/);
  assert.match(source, /ledCounts = addCounts\(ledCounts, composeModules\(edgeUnits\[edge\]\)\)/);
  assert.match(source, /const totalPower = Object\.entries\(ledCounts\)/);
  assert.match(source, /const powerQty = totalPower > 0 \? Math\.ceil\(totalPower \/ powerSpec\.limit\) : 0/);
  assert.match(source, /const rawCost = [^;]*ledCost \+ powerCost/);
  assert.match(source, /Illuminated edges: \$\{litEdgesDescription\(cfg\)\}/);
});
