import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [backlit, edgelit] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../edgelit.html", import.meta.url), "utf8"),
]);

for (const [name, source] of [["Backlit", backlit], ["Edgelit", edgelit]]) {
  test(`${name} offers and prices rigging points`, () => {
    assert.match(source, /id="includeRigging" name="includeRigging" type="checkbox"/);
    assert.match(source, /Math\.max\(2, Math\.ceil\(cfg\.width \/ (?:c|DATA)\.riggingPointDist\)\)/);
    assert.match(source, /riggingPointCost: 12/);
    assert.match(source, /riggingPointWeightKg: 0\.07/);
    assert.match(source, /includeRigging: cfg\.includeRigging, numberRiggingPoints:/);
    assert.match(source, /Includes \$\{[^}]*numberRiggingPoints\} rigging points\./);
    assert.match(source, /item: "Rigging points"/);
  });
}
