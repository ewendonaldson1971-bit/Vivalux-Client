import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../lanterns/app.js", import.meta.url), "utf8");

test("Lantern templates contain no internal vertical seam guides", () => {
  const templateSource = source.match(/function makeTemplatePdf\([\s\S]*?\n}/)?.[0];
  const downloadSource = source.match(/function downloadTemplate\([\s\S]*?\n}/)?.[0];

  assert.ok(templateSource);
  assert.ok(downloadSource);
  assert.equal(templateSource.includes("guides"), false);
  assert.equal(downloadSource.includes("guides"), false);
});
