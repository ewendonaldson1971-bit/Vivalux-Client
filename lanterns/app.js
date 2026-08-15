const FABRICS = [
  { name: "Standard Graphic", sqmRate: 55, qcode: "Q203210-02", gsm: 230 },
  { name: "Greyback Graphic", sqmRate: 55, qcode: "Q203210-06", gsm: 260 },
  { name: "Blockout Graphic", sqmRate: 65, qcode: "Q203210-03", gsm: 260 },
  { name: "Standard Plain", sqmRate: 25, qcode: "Q203210-04", gsm: 230 },
  { name: "Greyback Plain", sqmRate: 25, qcode: "Q203210-07", gsm: 260 },
  { name: "Blackback Plain", sqmRate: 30, qcode: "Q203210-08", gsm: 260 },
  { name: "Black Plain", sqmRate: 25, qcode: "Q203210-05", gsm: 230 },
];

const DATA = {
  frameQcode: "Q203210-09",
  minimumDiameterMm: 1500,
  maximumHeightMm: 3000,
  innerDiameterOffsetMm: 80,
  miniBraceSpacingMm: 2000,
  miniBraceHeightOffsetMm: 77,
  rollingLengthMm: 5000,
  packingLengths: [{ name: "A Pipe Rack 5.6M", mm: 5600 }, { name: "B LWB 3M", mm: 3000 }, { name: "C Van/Tray 2.5M", mm: 2500 }, { name: "D Car 1.5M", mm: 1500 }],
  fabrics: FABRICS,
};
const CART_BASE = "https://vivad.com.au/shopping-cart";
const PT_PER_MM = 2.834645669;
const els = Object.fromEntries(["shortname", "diameter", "height", "maxPacking", "packingHint", "riggingPoints", "riggingHint", "riggingLabel", "outerFabric", "outerQuantity", "innerFabric", "innerQuantity", "metrics", "diagram", "graphicSummary", "cartButtons", "selectedUrl", "descriptionText", "takeoff"].map((id) => [id, document.getElementById(id)]));
let pricingRequest = 0;
let currentCalc = null;

function money(value) {
  return Number(value || 0).toLocaleString("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function strictEncode(value) {
  return encodeURIComponent(String(value)).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function query(params) {
  return Object.entries(params).map(([key, value]) => `${strictEncode(key)}=${strictEncode(value)}`).join("&");
}

function fabricByName(name) {
  return DATA.fabrics.find((fabric) => fabric.name === name) || DATA.fabrics[0];
}

function readInputs() {
  const diameterMm = Math.max(DATA.minimumDiameterMm, Math.round(Number(els.diameter.value) || 2000));
  const heightMm = Math.min(DATA.maximumHeightMm, Math.max(DATA.miniBraceHeightOffsetMm + 1, Math.round(Number(els.height.value) || 1000)));
  const maxPackingLength = DATA.packingLengths.find((item) => item.name === els.maxPacking.value) || DATA.packingLengths[0];
  return {
    diameterMm,
    heightMm,
    maxPackingLength,
    riggingPointQty: Math.max(0, Math.round(Number(els.riggingPoints.value) || 0)),
    outerFabric: fabricByName(els.outerFabric.value),
    innerFabric: fabricByName(els.innerFabric.value),
    outerQuantity: Math.max(0, Math.round(Number(els.outerQuantity.value) || 0)),
    innerQuantity: Math.max(0, Math.round(Number(els.innerQuantity.value) || 0)),
    shortname: els.shortname.value.trim() || "Hanging Lantern",
  };
}

function geometry(input) {
  const circumferenceMm = Math.PI * input.diameterMm;
  const innerDiameterMm = input.diameterMm - DATA.innerDiameterOffsetMm;
  const innerCircumferenceMm = Math.PI * innerDiameterMm;
  const miniBraceQty = Math.ceil(circumferenceMm / DATA.miniBraceSpacingMm);
  const maximumRingSegmentLengthMm = Math.min(DATA.rollingLengthMm, input.maxPackingLength.mm);
  const ringPiecesPerRing = Math.ceil(circumferenceMm / maximumRingSegmentLengthMm);
  const ringSegmentLengthMm = circumferenceMm / ringPiecesPerRing;
  const ringPieces = ringPiecesPerRing * 2;
  return {
    ...input,
    circumferenceMm,
    innerDiameterMm,
    innerCircumferenceMm,
    miniBraceQty,
    miniBraceLengthMm: input.heightMm - DATA.miniBraceHeightOffsetMm,
    tensionLockQty: miniBraceQty * 2,
    maximumRingSegmentLengthMm,
    ringSegmentLengthMm,
    rollingLengthQty: ringPieces,
    joinerQty: ringPieces * 2,
    suppliedSections: ringPieces + miniBraceQty,
  };
}

function description(calc, quote) {
  const base = `Quantity: 1 Cylindrical Hanging Lantern. Outer Diameter: ${calc.diameterMm}mm Height: ${calc.heightMm}mm.\nIncludes ${calc.riggingPointQty} Rigging Points and ${calc.miniBraceQty} minibraces.\nSupplied in ${calc.suppliedSections} Sections.`;
  if (!quote) return base;
  return `${base}\nPacking Dimensions: ${quote.packingLengthCm}cm (l) x ${quote.packingWidthCm}cm (w) x ${quote.packingHeightCm}cm (h).\nTotal Weight Frame and Graphics: ${Math.ceil(quote.totalWeightKg)}Kg`;
}

function cartUrl(params) {
  return `${CART_BASE}?${query(params)}`;
}

function frameCartParams(calc, quote, descriptionText) {
  return {
    qcode: quote.frameQcode || DATA.frameQcode,
    quantity: 1,
    shortname: calc.shortname,
    description: descriptionText,
    packinglengthcm: quote.packingLengthCm,
    packingwidthcm: quote.packingWidthCm,
    packingheightcm: quote.packingHeightCm,
    weightkg: Math.ceil(quote.totalWeightKg),
    price: Math.ceil(quote.frame.sell),
  };
}

function buildCart(calc, quote) {
  const descriptionText = description(calc, quote);
  const frameUrl = cartUrl(frameCartParams(calc, quote, descriptionText));
  const outer = quote.graphics.find((item) => item.id === "outer");
  const inner = quote.graphics.find((item) => item.id === "inner");
  const outerUrl = calc.outerQuantity ? cartUrl({ qcode: calc.outerFabric.qcode, quantity: calc.outerQuantity, width: Math.round(calc.circumferenceMm), height: calc.heightMm, shortname: `${calc.shortname} Outer Graphic`, price: Math.ceil(outer.unitSell) }) : null;
  const innerUrl = calc.innerQuantity ? cartUrl({ qcode: calc.innerFabric.qcode, quantity: calc.innerQuantity, width: Math.round(calc.innerCircumferenceMm), height: calc.heightMm, shortname: `${calc.shortname} Inner Graphic`, price: Math.ceil(inner.unitSell) }) : null;
  return { frameUrl, graphicsUrls: [outerUrl, innerUrl].filter(Boolean), descriptionText };
}

function ellipsePoint(index, count, cx, cy, rx, ry) {
  const angle = (index / count) * Math.PI * 2;
  return { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry };
}

function diagramGeometry(diameterMm, heightMm) {
  const diameter = Math.max(1, Number(diameterMm) || 1);
  const height = Math.max(1, Number(heightMm) || 1);
  const ellipseRatio = 0.26;
  const scale = Math.min(
    500 / diameter,
    330 / (height + diameter * ellipseRatio),
  );
  const cx = 380;
  const rx = diameter * scale / 2;
  const ry = rx * ellipseRatio;
  const bodyHeight = height * scale;
  const drawingTop = 88;
  const drawingHeight = 342;
  const topY = drawingTop + (drawingHeight - bodyHeight - ry * 2) / 2 + ry;
  return {
    cx,
    rx,
    ry,
    bodyHeight,
    topY,
    bottomY: topY + bodyHeight,
    leftX: cx - rx,
    rightX: cx + rx,
  };
}

function renderDiagram(calc) {
  const drawing = diagramGeometry(calc.diameterMm, calc.heightMm);
  const braces = Array.from({ length: calc.miniBraceQty }, (_, index) => {
    const top = ellipsePoint(index, calc.miniBraceQty, drawing.cx, drawing.topY, drawing.rx, drawing.ry);
    const bottom = ellipsePoint(index, calc.miniBraceQty, drawing.cx, drawing.bottomY, drawing.rx, drawing.ry);
    return `<line class="cylinder-brace" x1="${top.x}" y1="${top.y}" x2="${bottom.x}" y2="${bottom.y}" />`;
  }).join("");
  const rigging = Array.from({ length: calc.riggingPointQty }, (_, index) => {
    const point = ellipsePoint(index, Math.max(calc.riggingPointQty, 1), drawing.cx, drawing.topY, drawing.rx, drawing.ry);
    return `<line class="cylinder-rigging" x1="${point.x}" y1="${point.y}" x2="${point.x}" y2="35"/><circle class="cylinder-point" cx="${point.x}" cy="${point.y}" r="5"/>`;
  }).join("");
  els.diagram.innerHTML = `<svg viewBox="0 0 760 520" role="img" aria-label="Isometric cylindrical hanging lantern layout">
    <path class="cylinder-shell" d="M${drawing.leftX} ${drawing.topY} A${drawing.rx} ${drawing.ry} 0 0 0 ${drawing.rightX} ${drawing.topY} L${drawing.rightX} ${drawing.bottomY} A${drawing.rx} ${drawing.ry} 0 0 1 ${drawing.leftX} ${drawing.bottomY} Z" />
    ${rigging}${braces}
    <ellipse class="cylinder-ring cylinder-back" cx="${drawing.cx}" cy="${drawing.topY}" rx="${drawing.rx}" ry="${drawing.ry}" />
    <ellipse class="cylinder-ring" cx="${drawing.cx}" cy="${drawing.bottomY}" rx="${drawing.rx}" ry="${drawing.ry}" />
    <text class="dim-labels" x="380" y="505" text-anchor="middle">Ø ${calc.diameterMm} mm · ${calc.heightMm} mm high · ${calc.suppliedSections} sections</text>
  </svg>`;
}

function renderTakeoff(quote) {
  els.takeoff.innerHTML = quote.components.map((item) => `<div class="takeoff-row"><span>${item.label}<br><small>${Number(item.quantity).toFixed(item.quantity % 1 ? 2 : 0)} × ${money(item.unitCost)}</small></span><strong>${money(item.sell)}</strong></div>`).join("");
}

function renderButtons(cart) {
  const frameUrls = [cart.frameUrl];
  const buttons = [
    { label: "Add Frame to Cart", code: cart.frameUrl ? new URL(cart.frameUrl).searchParams.get("qcode") : DATA.frameQcode, urls: frameUrls },
    { label: "Add Graphics to Cart", code: "Graphics", urls: cart.graphicsUrls, className: "secondary", disabled: !cart.graphicsUrls.length },
    { label: "Add Frame and Graphics to Cart", code: "Bundle", urls: [...frameUrls, ...cart.graphicsUrls], className: "combo" },
  ];
  els.cartButtons.innerHTML = buttons.map((button) => `<button class="cart-button ${button.className || ""}" type="button" data-bundle="${strictEncode(JSON.stringify(button.urls))}" ${button.disabled ? "disabled" : ""}><span>${button.label}</span><small>${button.code}</small></button>`).join("");
  els.selectedUrl.value = frameUrls.join("\n");
}

async function render() {
  const calc = geometry(readInputs());
  currentCalc = calc;
  const request = ++pricingRequest;
  els.packingHint.textContent = `${calc.maxPackingLength.mm}mm selected · ${Math.round(calc.ringSegmentLengthMm)}mm ring segments`;
  els.riggingHint.textContent = `Suggested: ${calc.miniBraceQty} — one rigging point for every mini brace.`;
  els.riggingLabel.textContent = `${calc.riggingPointQty} Rigging Points`;
  renderDiagram(calc);
  els.descriptionText.value = description(calc);
  els.graphicSummary.textContent = `Outer graphic: ${Math.round(calc.circumferenceMm)} × ${calc.heightMm}mm · Inner graphic: ${Math.round(calc.innerCircumferenceMm)} × ${calc.heightMm}mm (Ø ${calc.innerDiameterMm}mm)`;
  try {
    const quote = (await window.VivaluxPricing.quote("lanterns", {
      diameterMm: calc.diameterMm,
      heightMm: calc.heightMm,
      maxPackingLengthMm: calc.maxPackingLength.mm,
      riggingPointQty: calc.riggingPointQty,
      outerFabric: calc.outerFabric.name,
      innerFabric: calc.innerFabric.name,
      outerQuantity: calc.outerQuantity,
      innerQuantity: calc.innerQuantity,
    })).calculation;
    if (request !== pricingRequest) return;
    calc.miniBraceQty = quote.miniBraceQty;
    calc.miniBraceLengthMm = quote.miniBraceLengthMm;
    calc.tensionLockQty = quote.tensionLockQty;
    calc.maximumRingSegmentLengthMm = quote.maximumRingSegmentLengthMm;
    calc.ringSegmentLengthMm = quote.ringSegmentLengthMm;
    calc.rollingLengthQty = quote.rollingLengthQty;
    calc.joinerQty = quote.joinerQty;
    calc.suppliedSections = quote.suppliedSections;
    els.packingHint.textContent = `${quote.maxPackingLengthMm}mm selected · ${Math.round(quote.ringSegmentLengthMm)}mm ring segments`;
    const cart = buildCart(calc, quote);
    els.metrics.innerHTML = [["Frame Price Ex GST", money(quote.frame.sell)], ["Graphics Price Ex GST", money(quote.graphicsTotal.sell)], ["Total Price Ex GST", money(quote.total.sell)]].map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join("");
    els.descriptionText.value = cart.descriptionText;
    renderTakeoff(quote);
    renderButtons(cart);
    renderDiagram(calc);
  } catch (error) {
    if (request === pricingRequest) els.metrics.innerHTML = `<div class="metric"><span>Pricing</span><strong>${error.message || "Unavailable"}</strong></div>`;
  }
}

function fmt(value) { return Number(value).toFixed(3).replace(/\.?0+$/, ""); }

function makeTemplatePdf(width, height, guides) {
  const content = ["q", "0.4 G", "0.6 w", `0.5 0.5 ${fmt(width - 1)} ${fmt(height - 1)} re S`, "0.8 G", "0.5 w", ...guides.map((x) => `${fmt(x)} 0 m ${fmt(x)} ${fmt(height)} l S`), "Q"].join("\n");
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  const addObject = (id, body) => { offsets[id] = pdf.length; pdf += `${id} 0 obj\n${body}\nendobj\n`; };
  addObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
  addObject(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  addObject(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmt(width)} ${fmt(height)}] /Contents 4 0 R >>`);
  addObject(4, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  const xrefOffset = pdf.length;
  pdf += "xref\n0 5\n0000000000 65535 f \n";
  for (let id = 1; id <= 4; id += 1) pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

function downloadTemplate(kind) {
  const calc = currentCalc || geometry(readInputs());
  const lengthMm = kind === "outer" ? calc.circumferenceMm : calc.innerCircumferenceMm;
  const scaledWidthMm = lengthMm / 10;
  const scaledHeightMm = calc.heightMm / 10;
  const guides = [];
  for (let positionMm = DATA.rollingLengthMm; positionMm < lengthMm; positionMm += DATA.rollingLengthMm) guides.push((positionMm / 10) * PT_PER_MM);
  const pdf = makeTemplatePdf(scaledWidthMm * PT_PER_MM, scaledHeightMm * PT_PER_MM, guides);
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${kind === "outer" ? "Outer" : "Inner"}-Lantern-Template-${Math.round(lengthMm)}x${calc.heightMm}mm.pdf`;
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function openCartUrlsSequentially(urls) {
  const queue = urls.filter(Boolean);
  if (!queue.length) return;
  const cartTab = window.open(queue[0], "_blank");
  if (!cartTab) return;
  queue.slice(1).forEach((url, index) => setTimeout(() => { if (!cartTab.closed) { cartTab.location.href = url; cartTab.focus(); } }, (index + 1) * 2500));
}

function enforceLimits() {
  const diameter = Number(els.diameter.value);
  const height = Number(els.height.value);
  if (!Number.isFinite(diameter) || diameter < DATA.minimumDiameterMm) els.diameter.value = String(DATA.minimumDiameterMm);
  if (!Number.isFinite(height) || height < DATA.miniBraceHeightOffsetMm + 1) els.height.value = String(DATA.miniBraceHeightOffsetMm + 1);
  if (Number(els.height.value) > DATA.maximumHeightMm) els.height.value = String(DATA.maximumHeightMm);
  render();
}

function renderFabricOptions() {
  const options = DATA.fabrics.map((fabric) => `<option value="${fabric.name}">${fabric.name} — ${money(fabric.sqmRate)}/m²</option>`).join("");
  const outer = els.outerFabric.value || DATA.fabrics[0].name;
  const inner = els.innerFabric.value || DATA.fabrics[0].name;
  els.outerFabric.innerHTML = options; els.innerFabric.innerHTML = options;
  els.outerFabric.value = fabricByName(outer).name; els.innerFabric.value = fabricByName(inner).name;
}

function renderPackingOptions() {
  const selected = els.maxPacking.value || DATA.packingLengths[0]?.name;
  els.maxPacking.innerHTML = DATA.packingLengths.map((item) => `<option value="${item.name}">${item.name}</option>`).join("");
  els.maxPacking.value = DATA.packingLengths.some((item) => item.name === selected) ? selected : DATA.packingLengths[0]?.name || "";
}

[els.shortname, els.diameter, els.height, els.riggingPoints, els.outerFabric, els.outerQuantity, els.innerFabric, els.innerQuantity].forEach((input) => input.addEventListener("input", render));
[els.maxPacking].forEach((input) => input.addEventListener("change", render));
[els.diameter, els.height].forEach((input) => input.addEventListener("blur", enforceLimits));
document.addEventListener("click", (event) => {
  const templateButton = event.target.closest("[data-template]");
  if (templateButton) { downloadTemplate(templateButton.dataset.template); return; }
  const cartButton = event.target.closest(".cart-button");
  if (cartButton?.dataset.bundle) {
    const urls = JSON.parse(decodeURIComponent(cartButton.dataset.bundle));
    els.selectedUrl.value = urls.join("\n");
    openCartUrlsSequentially(urls);
  }
});

renderFabricOptions();
renderPackingOptions();
render();
window.VivaluxPricing.register("lanterns", (config, merge) => {
  const connected = config || {};
  Object.keys(connected).filter((key) => key !== "fabrics").forEach((key) => { DATA[key] = connected[key]; });
  if (Array.isArray(connected.fabrics)) merge(DATA.fabrics, connected.fabrics);
  renderFabricOptions();
  renderPackingOptions();
  render();
});
