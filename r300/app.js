const FABRICS = [
  { name: "Standard Graphic", sqmRate: 55, qcode: "Q203210-02", gsm: 230 },
  { name: "Greyback Graphic", sqmRate: 55, qcode: "Q203210-06", gsm: 260 },
  { name: "Blockout Graphic", sqmRate: 65, qcode: "Q203210-03", gsm: 260 },
  { name: "Standard Plain", sqmRate: 25, qcode: "Q203210-04", gsm: 230 },
  { name: "Greyback Plain", sqmRate: 25, qcode: "Q203210-07", gsm: 260 },
  { name: "Blackback Plain", sqmRate: 30, qcode: "Q203210-08", gsm: 260 },
  { name: "Black Plain", sqmRate: 25, qcode: "Q203210-05", gsm: 230 },
];

const SHAPES = {
  "Closed Shape": { cornerCount: 4, squareCornerCount: 0, wallRuns: ["width", "length", "width", "length"] },
  "U-Shape": { cornerCount: 2, squareCornerCount: 4, wallRuns: ["width", "length", "length"] },
  "L-Shape": { cornerCount: 1, squareCornerCount: 4, wallRuns: ["width", "length"] },
  "L-Reversed-Shape": { cornerCount: 1, squareCornerCount: 4, wallRuns: ["width", "length"] },
};

const PACKING_LENGTHS = [
  { name: "A Pipe Rack 5.6M", mm: 5600 },
  { name: "B LWB 3M", mm: 3000 },
  { name: "C Van/Tray 2.5M", mm: 2500 },
  { name: "D Car 1.5M", mm: 1500 },
];

const CONSTANTS = {
  Aluminium_Cost: 28,
  Corner_Weight: 0.59,
  Tension_Lock_Weight: 0.07,
  Forex_SQM_Weight: 1.5,
  Forex_SQM_Cost: 30,
  Brace_Weight: 0.401,
  EXT_Weight_PerM: 0.94,
  Fabric_SQM_Weight: 0.24,
  Joiner_Pair_Weight: 0.1,
  Rigging_Point_Weight: 0.07,
  Joiner_Cost: 5,
  Tension_Lock_Cost: 14,
  Corner_Cost: 58.75,
  Square_Corner_Bracket_Cost: 7,
  Square_Corner_Bracket_Weight: 0.1,
  Rigging_Point_Cost: 12,
  Rigging_Point_Dist: 2000,
  Corner_Length: 400,
  DS40_Extrusion_Offset: 38.5,
};

const PT_PER_MM = 2.834645669;
const CART_BASE = "https://vivad.com.au/shopping-cart";
const PRICE_MULTIPLIER = 1.4285714;
let configuredPriceMultiplier = PRICE_MULTIPLIER;
const INFILL_PDF_MARGIN_MM = 0;

const INFILL_TEMPLATE = {
  width: 600,
  baseCutHeight: 1484,
  shiftY: 742,
  lines: [
    [600, 742, 600, 1453.5],
    [600, 742, 600, 30.5],
    [0, 30.5, 0, 742],
    [0, 1453.5, 0, 742],
    [62, 0, 538, 0],
    [16.5, 39, 53, 39],
    [57, 5, 57, 35],
    [18, 29, 1.5, 29],
    [18, 35, 16.5, 35],
    [15, 37.5, 15, 36.5],
    [583.5, 39, 547, 39],
    [543, 5, 543, 35],
    [582, 29, 598.5, 29],
    [582, 35, 583.5, 35],
    [585, 37.5, 585, 36.5],
    [16.5, 1445, 53, 1445],
    [57, 1479, 57, 1449],
    [18, 1455, 1.5, 1455],
    [18, 1449, 16.5, 1449],
    [15, 1446.5, 15, 1447.5],
    [583.5, 1445, 547, 1445],
    [543, 1479, 543, 1449],
    [582, 1455, 598.5, 1455],
    [582, 1449, 583.5, 1449],
    [585, 1446.5, 585, 1447.5],
    [62, 1484, 538, 1484],
  ],
  arcs: [
    [1.5, 30.5, 1.5, 180, 270],
    [16.5, 36.5, 1.5, 180, 270],
    [16.5, 37.5, 1.5, 90, 180],
    [18, 32, 3, 0, 90],
    [18, 32, 3, 270, 0],
    [62, 5, 5, 180, 270],
    [57, 39, 4, 270, 180],
    [598.5, 30.5, 1.5, 270, 0],
    [583.5, 36.5, 1.5, 270, 0],
    [583.5, 37.5, 1.5, 0, 90],
    [582, 32, 3, 90, 180],
    [582, 32, 3, 180, 270],
    [538, 5, 5, 270, 0],
    [543, 39, 4, 0, 270],
    [1.5, 1453.5, 1.5, 90, 180],
    [16.5, 1447.5, 1.5, 90, 180],
    [16.5, 1446.5, 1.5, 180, 270],
    [18, 1452, 3, 270, 0],
    [18, 1452, 3, 0, 90],
    [62, 1479, 5, 90, 180],
    [57, 1445, 4, 180, 90],
    [598.5, 1453.5, 1.5, 0, 90],
    [583.5, 1447.5, 1.5, 0, 90],
    [583.5, 1446.5, 1.5, 270, 0],
    [582, 1452, 3, 180, 270],
    [582, 1452, 3, 90, 180],
    [538, 1479, 5, 0, 90],
    [543, 1445, 4, 90, 0],
  ],
};

const els = {
  width: document.querySelector("#width"),
  length: document.querySelector("#length"),
  height: document.querySelector("#height"),
  quantity: document.querySelector("#quantity"),
  shape: document.querySelector("#shape"),
  shortname: document.querySelector("#shortname"),
  includeRigging: document.querySelector("#includeRigging"),
  riggingLabel: document.querySelector("#riggingLabel"),
  maxPacking: document.querySelector("#maxPacking"),
  packingHint: document.querySelector("#packingHint"),
  outerFabricGroup: document.querySelector("#outerFabricGroup"),
  innerFabricGroup: document.querySelector("#innerFabricGroup"),
  outerGraphicQty: document.querySelector("#outerGraphicQty"),
  innerGraphicQty: document.querySelector("#innerGraphicQty"),
  infillDxfLink: document.querySelector("#infillDxfLink"),
  insertSummary: document.querySelector("#insertSummary"),
  descriptionText: document.querySelector("#descriptionText"),
  diagram: document.querySelector("#diagram"),
  metrics: document.querySelector("#metrics"),
  cartButtons: document.querySelector("#cartButtons"),
  selectedUrl: document.querySelector("#selectedUrl"),
};

const state = {
  outerFabric: FABRICS[0].name,
  innerFabric: FABRICS[0].name,
  cart: null,
  infillDxfObjectUrl: null,
};

const SHARED_DIMENSION_STATE_KEY = "vivalux-shared-frame-dimensions";
const SHARED_DIMENSION_LINKS = new Set(["index.html", "../palisade.html", "../cube.html"]);
const DEFAULT_SHARED_DIMENSIONS = { width: 3000, depth: 3000, height: 1500 };

function money(value) {
  return value.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function increasedPrice(value) {
  const number = Number(value);
  const discountMultiplier = window.VivaluxAuth?.getDiscountMultiplier?.() ?? 1;
  return Number.isFinite(number) ? number * configuredPriceMultiplier * discountMultiplier : 0;
}

function numberValue(input, fallback) {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : fallback;
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function clampForInput(input, value) {
  const min = input.min === "" ? null : Number(input.min);
  const max = input.max === "" ? null : Number(input.max);
  let clamped = value;
  if (Number.isFinite(min)) clamped = Math.max(min, clamped);
  if (Number.isFinite(max)) clamped = Math.min(max, clamped);
  return clamped;
}

function setSharedDimensionInput(input, value) {
  const number = positiveNumber(value);
  if (!input || number === null) return;
  input.value = String(Math.round(clampForInput(input, number)));
}

function normalizedSharedDimensions(source) {
  const dimensions = {};
  ["width", "height"].forEach((key) => {
    const value = positiveNumber(source && source[key]);
    if (value !== null) dimensions[key] = value;
  });
  const depth = positiveNumber(source && (source.depth ?? source.length));
  if (depth !== null) dimensions.depth = depth;
  return dimensions;
}

function readStoredSharedDimensions() {
  try {
    return normalizedSharedDimensions(JSON.parse(localStorage.getItem(SHARED_DIMENSION_STATE_KEY) || "{}"));
  } catch {
    return {};
  }
}

function readUrlSharedDimensions() {
  const params = new URLSearchParams(window.location.search);
  return normalizedSharedDimensions({
    width: params.get("width"),
    depth: params.get("depth") || params.get("length"),
    height: params.get("height"),
  });
}

function currentSharedDimensions() {
  return {
    width: positiveNumber(els.width.value) || 3000,
    depth: positiveNumber(els.length.value) || 3000,
    height: positiveNumber(els.height.value) || 1500,
  };
}

function updateSharedDimensionLinks(dimensions = currentSharedDimensions()) {
  document.querySelectorAll(".app-tabs a").forEach((link) => {
    const originalHref = link.dataset.dimensionHref || link.getAttribute("href") || "";
    link.dataset.dimensionHref = originalHref;
    if (!SHARED_DIMENSION_LINKS.has(originalHref)) return;

    const url = new URL(originalHref, window.location.href);
    url.searchParams.set("width", String(Math.round(dimensions.width)));
    url.searchParams.delete("length");
    url.searchParams.set("depth", String(Math.round(dimensions.depth)));
    url.searchParams.set("height", String(Math.round(dimensions.height)));
    link.href = url.href;
  });
}

function saveSharedFrameDimensions() {
  const dimensions = currentSharedDimensions();
  try {
    localStorage.setItem(SHARED_DIMENSION_STATE_KEY, JSON.stringify(dimensions));
  } catch {
    /* Ignore storage errors in private or locked-down browser contexts. */
  }
  updateSharedDimensionLinks(dimensions);
}

function restoreSharedFrameDimensions() {
  const dimensions = { ...DEFAULT_SHARED_DIMENSIONS, ...readUrlSharedDimensions() };
  setSharedDimensionInput(els.width, dimensions.width);
  setSharedDimensionInput(els.length, dimensions.depth);
  setSharedDimensionInput(els.height, dimensions.height);
}

function strictEncode(value) {
  return encodeURIComponent(String(value)).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function query(params) {
  return Object.entries(params)
    .map(([key, value]) => `${strictEncode(key)}=${strictEncode(value)}`)
    .join("&");
}

function fabricByName(name) {
  return FABRICS.find((fabric) => fabric.name === name) || FABRICS[0];
}

function graphicsQcode(fabric, shapeName) {
  const suffix = fabric.qcode.split("-")[1];
  const prefix = shapeName === "Closed Shape" ? "Q157942" : "Q203210";
  return `${prefix}-${suffix}`;
}

function readInputs() {
  return {
    width: Math.max(800, Math.round(numberValue(els.width, 3000))),
    length: Math.max(800, Math.round(numberValue(els.length, 3000))),
    height: Math.min(3000, Math.max(280, Math.round(numberValue(els.height, 1500)))),
    quantity: Math.max(1, Math.round(numberValue(els.quantity, 1))),
    shapeName: els.shape.value || "Closed Shape",
    shortname: els.shortname.value.trim() || "Halo Frame",
    maxPackingLength: PACKING_LENGTHS.find((item) => item.name === els.maxPacking.value) || PACKING_LENGTHS[0],
    includeRigging: els.includeRigging.checked,
    outerFabric: fabricByName(state.outerFabric),
    innerFabric: fabricByName(state.innerFabric),
    outerGraphicQty: Math.max(0, Math.round(numberValue(els.outerGraphicQty, 1))),
    innerGraphicQty: Math.max(0, Math.round(numberValue(els.innerGraphicQty, 1))),
  };
}

function shapeSpec(shapeName) {
  return SHAPES[shapeName] || SHAPES["Closed Shape"];
}

function runLength(input, run) {
  return run === "length" ? input.length : input.width;
}

function shapeRunSpecs(input) {
  if (input.shapeName === "Closed Shape") {
    return [
      { length: input.width, roundedEnds: 2 },
      { length: input.length, roundedEnds: 2 },
      { length: input.width, roundedEnds: 2 },
      { length: input.length, roundedEnds: 2 },
    ];
  }
  if (input.shapeName === "U-Shape") {
    return [
      { length: input.width, roundedEnds: 2 },
      { length: input.length, roundedEnds: 1 },
      { length: input.length, roundedEnds: 1 },
    ];
  }
  return [
    { length: input.width, roundedEnds: 1 },
    { length: input.length, roundedEnds: 1 },
  ];
}

function shapeRunLengths(input) {
  return shapeRunSpecs(input).map((run) => run.length);
}

function shapedInsertLength(input, arcRadius, setbackRadius = 300) {
  const spec = shapeSpec(input.shapeName);
  const straightLength = shapeRunLengths(input).reduce((sum, value) => sum + value, 0);
  return Math.round(straightLength + spec.cornerCount * ((Math.PI / 2) * arcRadius - 2 * setbackRadius));
}

function shapeBraceCount(input) {
  const straightBraces = shapeRunSpecs(input).reduce((sum, run) => {
    const straightLength = Math.max(0, run.length - run.roundedEnds * CONSTANTS.Corner_Length);
    return sum + Math.floor(straightLength / 2100);
  }, 0);
  return straightBraces + shapeSpec(input.shapeName).cornerCount * 2;
}

function splitLength(length, maxLength) {
  if (length <= 0) return [];
  const sectionCount = Math.max(1, Math.ceil(length / maxLength));
  const baseLength = Math.floor(length / sectionCount);
  const remainder = length - baseLength * sectionCount;
  return [
    { qty: remainder, length: baseLength + 1 },
    { qty: sectionCount - remainder, length: baseLength },
  ].filter((section) => section.qty > 0 && section.length > 0);
}

function horizontalExtrusionPlan(input) {
  const maxLength = Math.max(1, input.maxPackingLength.mm);
  const groupedSections = new Map();
  let joinerPairs = 0;
  let totalLength = 0;
  let longestSection = 0;

  shapeRunSpecs(input).forEach((run) => {
    const straightLength = Math.max(0, run.length - run.roundedEnds * CONSTANTS.Corner_Length);
    if (straightLength <= 0) return;
    const sections = splitLength(straightLength, maxLength);
    const sectionCount = sections.reduce((sum, section) => sum + section.qty, 0);
    totalLength += straightLength * 2;
    joinerPairs += (sectionCount + 1) * 2;

    sections.forEach((section) => {
      const qty = section.qty * 2;
      groupedSections.set(section.length, (groupedSections.get(section.length) || 0) + qty);
      longestSection = Math.max(longestSection, section.length);
    });
  });

  if (input.shapeName !== "Closed Shape") {
    joinerPairs += 4;
  }

  const sections = Array.from(groupedSections, ([length, qty]) => ({ length, qty }));

  return { sections, joinerPairs, totalLength, longestSection };
}

function shapePlanSegments(shapeName, width, length) {
  if (shapeName === "L-Reversed-Shape") return [[0, 0, width, 0], [0, 0, 0, length]];
  if (shapeName === "L-Shape") return [[0, 0, width, 0], [width, 0, width, length]];
  if (shapeName === "U-Shape") return [[0, 0, width, 0], [0, 0, 0, length], [width, 0, width, length]];
  return [[0, 0, width, 0], [width, 0, width, length], [width, length, 0, length], [0, length, 0, 0]];
}

function calculate() {
  const input = readInputs();
  const W = input.width;
  const L = input.length;
  const H = input.height;
  const Q = input.quantity;
  const c = CONSTANTS;
  const spec = shapeSpec(input.shapeName);
  const runLengths = shapeRunLengths(input);
  const extrusionPlan = horizontalExtrusionPlan(input);

  const Number_Of_Braces = shapeBraceCount(input);
  const Brace_Length = Math.max(0, H - 2 * c.DS40_Extrusion_Offset);
  const Vertical_Extrusion_QTY = spec.squareCornerCount ? 2 : 0;
  const Horizontal_Extrusion_Weight = (extrusionPlan.totalLength * c.EXT_Weight_PerM) / 1000;
  const Vertical_Brace_Weight = (Number_Of_Braces * Brace_Length * c.Brace_Weight) / 1000;
  const Square_End_Vertical_Weight = (Vertical_Extrusion_QTY * H * c.EXT_Weight_PerM) / 1000;
  const Extrusion_Weight = Horizontal_Extrusion_Weight + Vertical_Brace_Weight + Square_End_Vertical_Weight;
  const Forex_width = 610;
  const Forex_Height = H - 16;
  const Infill_Height = H - 16;
  const Infill_Qty = spec.cornerCount;
  const Tension_Lock_QTY = 2 * Number_Of_Braces;
  const Joiner_Pairs = extrusionPlan.joinerPairs;
  const EXT_Cost = Extrusion_Weight * c.Aluminium_Cost;
  const Forex_Cost = ((Forex_width * Forex_Height) / 1e6) * c.Forex_SQM_Cost * Infill_Qty;
  const Forex_Weight = ((Forex_width * Forex_Height) / 1e6) * c.Forex_SQM_Weight * Infill_Qty;

  const Inner_Length = shapedInsertLength(input, 260);
  const Outer_Length = shapedInsertLength(input, 300);
  const Number_Rigging_Points = runLengths.reduce((sum, run) => sum + Math.ceil(run / c.Rigging_Point_Dist), 0);
  const Rigging_Cost = input.includeRigging ? Number_Rigging_Points * c.Rigging_Point_Cost : 0;
  const Square_Corner_Bracket_QTY = spec.squareCornerCount * 2;
  const Square_Corner_Bracket_Cost = Square_Corner_Bracket_QTY * c.Square_Corner_Bracket_Cost;
  const Square_Corner_Bracket_Weight = Square_Corner_Bracket_QTY * c.Square_Corner_Bracket_Weight;
  const Corner_Sections = spec.cornerCount * 2;

  const Total_Frame_Price =
    EXT_Cost +
    Corner_Sections * c.Corner_Cost +
    Square_Corner_Bracket_Cost +
    Tension_Lock_QTY * c.Tension_Lock_Cost +
    Forex_Cost +
    Joiner_Pairs * c.Joiner_Cost +
    Rigging_Cost;

  const Inner_Area = (Inner_Length * H) / 1e6;
  const Outer_Area = (Outer_Length * H) / 1e6;
  const Inner_Price_Each = input.innerFabric.sqmRate * Inner_Area;
  const Outer_Price_Each = input.outerFabric.sqmRate * Outer_Area;
  const Inner_Price = Inner_Price_Each * input.innerGraphicQty;
  const Outer_Price = Outer_Price_Each * input.outerGraphicQty;
  const Inner_Weight = Inner_Area * c.Fabric_SQM_Weight * input.innerGraphicQty;
  const Outer_Weight = Outer_Area * c.Fabric_SQM_Weight * input.outerGraphicQty;
  const Joiner_Weight = Joiner_Pairs * c.Joiner_Pair_Weight;
  const Corner_Weight = Corner_Sections * c.Corner_Weight;
  const Tension_Lock_Weight = c.Tension_Lock_Weight * Tension_Lock_QTY;
  const Rigging_Weight = input.includeRigging ? Number_Rigging_Points * c.Rigging_Point_Weight : 0;
  const Total_Weight =
    Extrusion_Weight +
    Tension_Lock_Weight +
    Corner_Weight +
    Forex_Weight +
    Inner_Weight +
    Outer_Weight +
    Joiner_Weight +
    Square_Corner_Bracket_Weight +
    Rigging_Weight;

  const Packing_Length = Math.ceil(Math.max(extrusionPlan.longestSection, H) / 10);
  const Packing_Width = 57;
  const Packing_Height = 30;
  const Outer_QCode = graphicsQcode(input.outerFabric, input.shapeName);
  const Inner_QCode = graphicsQcode(input.innerFabric, input.shapeName);
  const Horizontal_Sections_Description = extrusionPlan.sections
    .map((section) => `${section.qty} @${section.length}mm`)
    .join(", ") || "No horizontal straight sections";
  const Vertical_Section_Description = Vertical_Extrusion_QTY
    ? `Vertical Sections: ${Vertical_Extrusion_QTY} @${H}mm.\n`
    : "";
  const Corner_Bracket_Description = Square_Corner_Bracket_QTY
    ? `Corner Brackets: ${Square_Corner_Bracket_QTY}.\n`
    : "";

  const description =
    `Quantity: ${Q} R300 Halo frame, ${input.shapeName}, ${W}mm (w) x ${L}mm (d) x ${H}mm (h).\n` +
    `${input.includeRigging ? `Includes ${Number_Rigging_Points} rigging points.\n` : ""}` +
    "Includes all extrusion, R300 corners, crossbraces, Forex inserts and tension locks.\n" +
    `Horizontal Sections: ${Horizontal_Sections_Description}.\n` +
    `${Vertical_Section_Description}` +
    `Vertical braces: ${Number_Of_Braces} @${Math.round(Brace_Length)}mm.\n` +
    `300mm Radius Corners: ${Corner_Sections} @${c.Corner_Length}mm x ${c.Corner_Length}mm.\n` +
    `${Corner_Bracket_Description}` +
    `Joiners Pairs: ${Joiner_Pairs}.\n` +
    `Packing Dimensions: ${Packing_Length}cm (l) x 57cm (w) x 30cm (h).\n` +
    `Total Weight Frame and Graphics: ${Math.ceil(Total_Weight)}Kg`;

  const frameUrl = `${CART_BASE}?${query({
    qcode: "Q203210-01",
    quantity: Q,
    shortname: input.shortname,
    description,
    packinglengthcm: Packing_Length,
    packingwidthcm: Packing_Width,
    packingheightcm: Packing_Height,
    weightkg: Math.ceil(Total_Weight),
    price: Math.ceil(increasedPrice(Total_Frame_Price)),
  })}`;

  const infillUrl = `${CART_BASE}?${query({
    qcode: "Q200341-01",
    quantity: Infill_Qty,
    width: 600,
    height: Infill_Height,
    shortname: "Infill panels",
  })}`;

  const outerUrl = `${CART_BASE}?${query({
    qcode: Outer_QCode,
    quantity: input.outerGraphicQty,
    width: Outer_Length,
    height: H,
    shortname: "Outer Hoop Insert",
    price: Math.ceil(increasedPrice(Outer_Price_Each)),
  })}`;

  const innerUrl = `${CART_BASE}?${query({
    qcode: Inner_QCode,
    quantity: input.innerGraphicQty,
    width: Inner_Length,
    height: H,
    shortname: "Inner Hoop Insert",
    price: Math.ceil(increasedPrice(Inner_Price_Each)),
  })}`;

  return {
    ...input,
    Number_Of_Braces,
    roundedCornerCount: spec.cornerCount,
    Corner_Sections,
    Vertical_Extrusion_QTY,
    squareCornerCount: spec.squareCornerCount,
    Square_Corner_Bracket_QTY,
    Square_Corner_Bracket_Weight,
    Tension_Lock_QTY,
    Brace_Length,
    Horizontal_Sections: extrusionPlan.sections,
    Horizontal_Sections_Description,
    Joiner_Pairs,
    Horizontal_Extrusion_Weight,
    Vertical_Brace_Weight,
    Square_End_Vertical_Weight,
    Joiner_Weight,
    Corner_Weight,
    Tension_Lock_Weight,
    Rigging_Weight,
    Inner_Length,
    Outer_Length,
    Number_Rigging_Points,
    Total_Frame_Price,
    Inner_Price_Each,
    Outer_Price_Each,
    Inner_Price,
    Outer_Price,
    Total_Weight,
    Packing_Length,
    Packing_Width,
    Packing_Height,
    Infill_Height,
    Infill_Qty,
    Outer_QCode,
    Inner_QCode,
    description,
    frameUrl,
    infillUrl,
    outerUrl,
    innerUrl,
    totalUnitPrice: Total_Frame_Price + Outer_Price + Inner_Price,
  };
}

function renderFabricOptions() {
  renderFabricSelect(els.outerFabricGroup, "outerFabric");
  renderFabricSelect(els.innerFabricGroup, "innerFabric");
}

function renderShapeOptions() {
  els.shape.innerHTML = Object.keys(SHAPES).map((shapeName) =>
    `<option value="${shapeName}" ${shapeName === "Closed Shape" ? "selected" : ""}>${shapeName}</option>`
  ).join("");
}

function renderPackingOptions() {
  els.maxPacking.innerHTML = PACKING_LENGTHS.map((item) =>
    `<option value="${item.name}" ${item.name === "A Pipe Rack 5.6M" ? "selected" : ""}>${item.name}</option>`
  ).join("");
  els.maxPacking.value = "A Pipe Rack 5.6M";
}

function renderFabricSelect(target, stateKey) {
  const shapeName = els.shape.value || "Closed Shape";
  target.innerHTML = FABRICS.map((fabric) => {
    const selected = state[stateKey] === fabric.name ? "selected" : "";
    return `<option value="${fabric.name}" ${selected}>${fabric.name} · ${graphicsQcode(fabric, shapeName)}</option>`;
  }).join("");

  target.onchange = () => {
    state[stateKey] = target.value;
    render();
  };
}

function roundedRectPoints(width, length, radius) {
  const r = Math.min(radius, width / 2, length / 2);
  const steps = 8;
  const corners = [
    { cx: r, cy: r, start: Math.PI, end: Math.PI * 1.5 },
    { cx: width - r, cy: r, start: Math.PI * 1.5, end: Math.PI * 2 },
    { cx: width - r, cy: length - r, start: 0, end: Math.PI * 0.5 },
    { cx: r, cy: length - r, start: Math.PI * 0.5, end: Math.PI },
  ];
  return corners.flatMap((corner) => {
    const points = [];
    for (let i = 0; i <= steps; i += 1) {
      const angle = corner.start + (corner.end - corner.start) * (i / steps);
      points.push([corner.cx + Math.cos(angle) * r, corner.cy + Math.sin(angle) * r]);
    }
    return points;
  });
}

function roundedShapePoints(shapeName, width, length, radius) {
  const r = Math.min(radius, width / 2, length / 2);
  if (shapeName === "U-Shape") {
    return {
      closed: false,
      points: [
        [0, length], [0, r],
        ...arcPoints(r, r, r, Math.PI, Math.PI * 1.5, 8),
        [width - r, 0],
        ...arcPoints(width - r, r, r, Math.PI * 1.5, Math.PI * 2, 8),
        [width, length],
      ],
      posts: [[0, length], [0, r], [r, 0], [width - r, 0], [width, r], [width, length]],
    };
  }
  if (shapeName === "L-Shape") {
    return {
      closed: false,
      points: [
        [0, 0], [width - r, 0],
        ...arcPoints(width - r, r, r, Math.PI * 1.5, Math.PI * 2, 8),
        [width, length],
      ],
      posts: [[0, 0], [width - r, 0], [width, r], [width, length]],
    };
  }
  if (shapeName === "L-Reversed-Shape") {
    return {
      closed: false,
      points: [
        [width, 0], [r, 0],
        ...arcPoints(r, r, r, Math.PI * 1.5, Math.PI, 8),
        [0, length],
      ],
      posts: [[width, 0], [r, 0], [0, r], [0, length]],
    };
  }
  const points = roundedRectPoints(width, length, radius);
  return {
    closed: true,
    points,
    posts: [
      [r, 0], [width - r, 0],
      [width, r], [width, length - r],
      [width - r, length], [r, length],
      [0, length - r], [0, r],
    ],
  };
}

function arcPoints(cx, cy, radius, start, end, steps) {
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = start + (end - start) * (i / steps);
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  return points;
}

function renderDiagram(calc) {
  const width = calc.width;
  const length = calc.length;
  const height = calc.height;
  const radius = 300;
  const scale = Math.min(
    480 / Math.max(1, width + length * 0.58),
    300 / Math.max(1, height + length * 0.34),
  );
  const origin = { x: 130, y: 94 };
  const project = (x, y, z) => ({
    x: origin.x + x * scale + y * scale * 0.58,
    y: origin.y + (height - z) * scale + y * scale * 0.34,
  });
  const pathFromPoints = (points, z, className, closed = true) => {
    const projected = points.map(([x, y]) => project(x, y, z));
    return `<path class="${className}" d="M ${projected.map((p) => `${p.x} ${p.y}`).join(" L ")}${closed ? " Z" : ""}"/>`;
  };
  const line = (x1, y1, z1, x2, y2, z2, className, extra = "") => {
    const a = project(x1, y1, z1);
    const b = project(x2, y2, z2);
    return `<line class="${className}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" ${extra}/>`;
  };
  const textAt = (x, y, z, label, dx = 0, dy = 0, anchor = "middle") => {
    const p = project(x, y, z);
    return `<text x="${p.x + dx}" y="${p.y + dy}" text-anchor="${anchor}">${label}</text>`;
  };
  const outline = roundedShapePoints(calc.shapeName, width, length, radius);
  const posts = outline.posts.map(([x, y]) => line(x, y, 0, x, y, height, "halo-line")).join("");
  const planSegments = shapePlanSegments(calc.shapeName, width, length);
  const braces = [];
  planSegments.forEach(([x1, y1, x2, y2]) => {
    const span = Math.hypot(x2 - x1, y2 - y1);
    const braceCount = Math.max(0, Math.floor((span - 800) / 2100));
    for (let i = 1; i <= braceCount; i += 1) {
      const t = i / (braceCount + 1);
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      braces.push(line(x, y, 0, x, y, height, "brace-line"));
    }
  });
  const dimWidth = line(0, -260, height, width, -260, height, "dim", 'marker-start="url(#arrow)" marker-end="url(#arrow)"');
  const dimLength = line(width + 230, 0, height, width + 230, length, height, "dim", 'marker-start="url(#arrow)" marker-end="url(#arrow)"');
  const dimHeight = line(-150, 0, 0, -150, 0, height, "dim", 'marker-start="url(#arrow)" marker-end="url(#arrow)"');
  const guides = [
    line(0, 0, height, 0, -260, height, "guide"),
    line(width, 0, height, width, -260, height, "guide"),
    line(width, 0, height, width + 230, 0, height, "guide"),
    line(width, length, height, width + 230, length, height, "guide"),
    line(0, 0, 0, -150, 0, 0, "guide"),
    line(0, 0, height, -150, 0, height, "guide"),
  ].join("");

  els.diagram.innerHTML = `
    <svg viewBox="0 0 760 520" role="img" aria-label="R300 Halo isometric diagram with 300mm radius corners">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto" markerUnits="strokeWidth">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="#53565a"/>
        </marker>
      </defs>
      <rect x="0" y="0" width="760" height="520" fill="#f7f8fa"/>
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        ${guides}
        ${dimWidth}
        ${dimLength}
        ${dimHeight}
        ${pathFromPoints(outline.points, 0, "halo-line", outline.closed)}
        ${pathFromPoints(outline.points, height, "halo-line", outline.closed)}
        ${posts}
        ${braces.join("")}
      </g>
      <g class="dim-labels">
        <text x="28" y="34" text-anchor="start">R300 Halo, ${calc.shapeName}, 300mm radius corners</text>
        ${textAt(width / 2, -260, height, `${width} mm Width`, 0, -12)}
        ${textAt(width + 230, length / 2, height, `${length} mm Depth`, 22, 4, "start")}
        ${textAt(-150, 0, height / 2, `${height} mm Height`, -18, 4, "end")}
      </g>
    </svg>
  `;
}

function render() {
  const calc = calculate();
  state.cart = calc;

  els.riggingLabel.textContent = `Include ${calc.Number_Rigging_Points} Rigging Points`;
  els.packingHint.textContent = `${calc.maxPackingLength.mm}mm maximum horizontal section length`;

  els.insertSummary.textContent =
    `${calc.shapeName} · Outer: ${calc.outerGraphicQty} @ ${calc.Outer_Length}mm x ${calc.height}mm · ` +
    `Inner: ${calc.innerGraphicQty} @ ${calc.Inner_Length}mm x ${calc.height}mm`;
  els.descriptionText.value = calc.description;
  renderDiagram(calc);

  els.metrics.innerHTML = [
    ["Frame Price Ex GST", money(increasedPrice(calc.Total_Frame_Price))],
    ["Graphics Price Ex GST", money(increasedPrice(calc.Outer_Price + calc.Inner_Price))],
    ["Total Price Ex GST", money(increasedPrice(calc.totalUnitPrice))],
  ]
    .map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");

  const frameUrls = [calc.frameUrl, calc.infillUrl].filter(Boolean);
  const graphicsUrls = [
    calc.outerGraphicQty > 0 ? calc.outerUrl : null,
    calc.innerGraphicQty > 0 ? calc.innerUrl : null,
  ].filter(Boolean);
  const buttons = [
    { label: "Add Frame to Cart", code: "Frame", urls: frameUrls },
    { label: "Add Graphics to Cart", code: "Graphics", urls: graphicsUrls, className: "secondary", disabled: !graphicsUrls.length },
    { label: "Add Frame and Graphics to Cart", code: "Bundle", urls: [...frameUrls, ...graphicsUrls], className: "combo" },
  ];
  els.cartButtons.innerHTML = buttons.map((button) => {
    const payload = `data-bundle="${strictEncode(JSON.stringify(button.urls))}"`;
    return `<button class="cart-button ${button.className || ""}" type="button" ${payload} ${button.disabled ? "disabled" : ""}><span>${button.label}</span><small>${button.code}</small></button>`;
  }).join("");
  els.selectedUrl.value = frameUrls.join("\n");
  updateInfillDxfLink(calc);
}

function enforceMinimum(input, minimum, message) {
  const value = Number(input.value);
  if (!Number.isFinite(value)) {
    input.value = String(minimum);
    render();
    return;
  }
  if (value < minimum) {
    alert(message);
    input.value = String(minimum);
  }
  render();
}

function clampHeightOnInput() {
  const value = Number(els.height.value);
  if (Number.isFinite(value) && value > 3000) {
    alert("For Halo's Higher than 3 Metres contact Vivad to discuss your project");
    els.height.value = "3000";
  }
  render();
}

function currentCalculation() {
  const calc = calculate();
  state.cart = calc;
  return calc;
}

function templateGuideRuns(calc) {
  if (calc.shapeName === "Closed Shape") return [calc.width, calc.length, calc.width];
  if (calc.shapeName === "U-Shape") return [calc.length, calc.width];
  return [calc.width];
}

function templateGuidePositions(calc, isOuter) {
  const offset = isOuter ? 12.876 : 19.15;
  let position = 0;
  return templateGuideRuns(calc).map((run) => {
    position += run / 10 - offset;
    return position;
  });
}

function openCartUrlsSequentially(urls) {
  const queue = urls.filter(Boolean);
  if (!queue.length) return;
  const cartTab = window.open(queue[0], "_blank");
  if (!cartTab) return;
  queue.slice(1).forEach((url, index) => {
    window.setTimeout(() => {
      if (!cartTab.closed) {
        cartTab.location.href = url;
        cartTab.focus();
      }
    }, (index + 1) * 2500);
  });
}

function downloadTemplate(kind) {
  const calc = state.cart || calculate();
  const isOuter = kind === "outer";
  const templateLength = isOuter ? calc.Outer_Length : calc.Inner_Length;
  const pageWidthPt = (templateLength / 10) * PT_PER_MM;
  const pageHeightPt = (calc.height / 10) * PT_PER_MM;
  const guidePts = templateGuidePositions(calc, isOuter)
    .map((position) => position * PT_PER_MM)
    .filter((position) => position > 0 && position < pageWidthPt);
  const pdf = makeTemplatePdf(pageWidthPt, pageHeightPt, guidePts);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${isOuter ? "Outer" : "Inner"}-Template-${templateLength}x${calc.height}mm.pdf`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadInfillCutFile() {
  const calc = currentCalculation();
  const cutHeight = Math.max(1, calc.height - 16);
  const pageWidthPt = (600 + INFILL_PDF_MARGIN_MM * 2) * PT_PER_MM;
  const pageHeightPt = (cutHeight + INFILL_PDF_MARGIN_MM * 2) * PT_PER_MM;
  const pdf = makeInfillCutFilePdf(pageWidthPt, pageHeightPt, cutHeight);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Forex-Infill-Cut-File-600x${cutHeight}mm.pdf`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function updateInfillDxfLink(calc) {
  if (!els.infillDxfLink) return;
  const cutHeight = Math.max(1, calc.height - 16);
  const dxf = makeInfillCutFileDxf(cutHeight);
  if (state.infillDxfObjectUrl) URL.revokeObjectURL(state.infillDxfObjectUrl);
  state.infillDxfObjectUrl = URL.createObjectURL(new Blob([dxf], { type: "application/octet-stream" }));
  els.infillDxfLink.href = state.infillDxfObjectUrl;
  els.infillDxfLink.download = `Forex-Infill-Cut-File-600x${cutHeight}mm.dxf`;
}

function makeTemplatePdf(width, height, guides) {
  const fmt = (value) => Number(value).toFixed(3).replace(/\.?0+$/, "");
  const content = [
    "q",
    "0.4 G",
    "0.6 w",
    `0.5 0.5 ${fmt(width - 1)} ${fmt(height - 1)} re S`,
    "0.8 G",
    "0.5 w",
    ...guides.map((x) => `${fmt(x)} 0 m ${fmt(x)} ${fmt(height)} l S`),
    "Q",
  ].join("\n");

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  const addObject = (id, body) => {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${body}\nendobj\n`;
  };

  addObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
  addObject(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  addObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmt(width)} ${fmt(height)}] /Contents 4 0 R >>`,
  );
  addObject(4, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

  const xrefOffset = pdf.length;
  pdf += "xref\n0 5\n";
  pdf += "0000000000 65535 f \n";
  for (let id = 1; id <= 4; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

function fmtFileNumber(value) {
  return Number(value).toFixed(3).replace(/\.?0+$/, "");
}

function shortestArcSweep(start, end) {
  let sweep = ((end - start + 540) % 360) - 180;
  if (sweep === -180) sweep = 180;
  return sweep || 360;
}

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

function infillAdjustedY(y, cutHeight) {
  const delta = cutHeight - INFILL_TEMPLATE.baseCutHeight;
  return y > INFILL_TEMPLATE.shiftY ? y + delta : y;
}

function infillLocalX(x) {
  return x;
}

function infillLocalY(y, cutHeight) {
  return infillAdjustedY(y, cutHeight);
}

function makeInfillCutFilePdf(width, height, cutHeight) {
  const fmt = fmtFileNumber;
  const xPt = (x) => (infillLocalX(x) + INFILL_PDF_MARGIN_MM) * PT_PER_MM;
  const yPt = (y) => (infillLocalY(y, cutHeight) + INFILL_PDF_MARGIN_MM) * PT_PER_MM;
  const arcCommands = ([cx, cy, r, startDeg, endDeg]) => {
    const commands = [];
    const sweepDeg = shortestArcSweep(startDeg, endDeg);
    const segments = Math.max(1, Math.ceil(Math.abs(sweepDeg) / 90));
    const segmentSweep = (sweepDeg * Math.PI / 180) / segments;
    const centerX = xPt(cx);
    const centerY = yPt(cy);
    const radius = r * PT_PER_MM;
    let angle = startDeg * Math.PI / 180;
    let startX = centerX + Math.cos(angle) * radius;
    let startY = centerY + Math.sin(angle) * radius;
    commands.push(`${fmt(startX)} ${fmt(startY)} m`);
    for (let index = 0; index < segments; index += 1) {
      const nextAngle = angle + segmentSweep;
      const kappa = 4 / 3 * Math.tan(segmentSweep / 4);
      const endX = centerX + Math.cos(nextAngle) * radius;
      const endY = centerY + Math.sin(nextAngle) * radius;
      const c1x = startX - Math.sin(angle) * radius * kappa;
      const c1y = startY + Math.cos(angle) * radius * kappa;
      const c2x = endX + Math.sin(nextAngle) * radius * kappa;
      const c2y = endY - Math.cos(nextAngle) * radius * kappa;
      commands.push(`${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(endX)} ${fmt(endY)} c`);
      angle = nextAngle;
      startX = endX;
      startY = endY;
    }
    commands.push("S");
    return commands;
  };
  const lineCommands = INFILL_TEMPLATE.lines.map(([x1, y1, x2, y2]) =>
    `${fmt(xPt(x1))} ${fmt(yPt(y1))} m ${fmt(xPt(x2))} ${fmt(yPt(y2))} l S`
  );
  const arcContent = INFILL_TEMPLATE.arcs.flatMap(arcCommands);
  const content = [
    "q",
    "/CS1 CS",
    "1 SCN",
    "0.4 w",
    "1 J",
    "1 j",
    ...lineCommands,
    ...arcContent,
    "Q",
  ].join("\n");

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  const addObject = (id, body) => {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${body}\nendobj\n`;
  };

  addObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
  addObject(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  const cutContourColorSpace =
    "[/Separation /CutContour /DeviceCMYK << /FunctionType 2 /Domain [0 1] /Range [0 1 0 1 0 1 0 1] /C0 [0 0 0 0] /C1 [0 1 0 0] /N 1 >>]";
  addObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmt(width)} ${fmt(height)}] /Resources << /ColorSpace << /CS1 ${cutContourColorSpace} >> >> /Contents 4 0 R >>`,
  );
  addObject(4, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

  const xrefOffset = pdf.length;
  pdf += "xref\n0 5\n";
  pdf += "0000000000 65535 f \n";
  for (let id = 1; id <= 4; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

function makeInfillCutFileDxf(cutHeight) {
  const fmt = fmtFileNumber;
  const dxfAnglePair = (startDeg, endDeg) => {
    return [normalizeAngle(startDeg), normalizeAngle(endDeg)];
  };
  const entityLines = [];

  INFILL_TEMPLATE.lines.forEach(([x1, y1, x2, y2]) => {
    entityLines.push(
      "0", "LINE",
      "8", "CutContour",
      "10", fmt(infillLocalX(x1)),
      "20", fmt(infillLocalY(y1, cutHeight)),
      "30", "0",
      "11", fmt(infillLocalX(x2)),
      "21", fmt(infillLocalY(y2, cutHeight)),
      "31", "0",
    );
  });

  INFILL_TEMPLATE.arcs.forEach(([cx, cy, r, startDeg, endDeg]) => {
    const [startAngle, endAngle] = dxfAnglePair(startDeg, endDeg);
    entityLines.push(
      "0", "ARC",
      "8", "CutContour",
      "10", fmt(infillLocalX(cx)),
      "20", fmt(infillLocalY(cy, cutHeight)),
      "30", "0",
      "40", fmt(r),
      "50", fmt(startAngle),
      "51", fmt(endAngle),
    );
  });

  return [
    "0", "SECTION",
    "2", "HEADER",
    "9", "$INSUNITS",
    "70", "4",
    "9", "$MEASUREMENT",
    "70", "1",
    "0", "ENDSEC",
    "0", "SECTION",
    "2", "TABLES",
    "0", "TABLE",
    "2", "LAYER",
    "70", "1",
    "0", "LAYER",
    "2", "CutContour",
    "70", "0",
    "62", "1",
    "6", "CONTINUOUS",
    "0", "ENDTAB",
    "0", "ENDSEC",
    "0", "SECTION",
    "2", "ENTITIES",
    ...entityLines,
    "0", "ENDSEC",
    "0", "EOF",
    "",
  ].join("\r\n");
}

function bindEvents() {
  ["width", "length", "height", "quantity", "shortname", "shape", "includeRigging", "outerGraphicQty", "innerGraphicQty"].forEach((key) => {
    els[key].addEventListener("input", key === "height" ? clampHeightOnInput : render);
  });
  ["width", "length", "height"].forEach((key) => {
    els[key].addEventListener("input", saveSharedFrameDimensions);
  });
  els.shape.addEventListener("change", () => {
    renderFabricOptions();
    render();
  });

  els.width.addEventListener("blur", () => {
    enforceMinimum(els.width, 800, "Minimum width is 800mm");
    saveSharedFrameDimensions();
  });
  els.length.addEventListener("blur", () => {
    enforceMinimum(els.length, 800, "Minimum depth is 800mm");
    saveSharedFrameDimensions();
  });
  els.height.addEventListener("blur", () => {
    enforceMinimum(els.height, 280, "Minimum height is 280mm");
    saveSharedFrameDimensions();
  });
  els.quantity.addEventListener("blur", () => enforceMinimum(els.quantity, 1, "Minimum quantity is 1"));
  els.outerGraphicQty.addEventListener("blur", () => enforceMinimum(els.outerGraphicQty, 0, "Minimum outer graphics quantity is 0"));
  els.innerGraphicQty.addEventListener("blur", () => enforceMinimum(els.innerGraphicQty, 0, "Minimum inner graphics quantity is 0"));
  els.maxPacking.addEventListener("change", render);

  document.addEventListener("click", (event) => {
    const templateButton = event.target.closest("[data-template]");
    if (templateButton) {
      downloadTemplate(templateButton.dataset.template);
      return;
    }

    if (event.target.closest("[data-infill-cut-file]")) {
      downloadInfillCutFile();
      return;
    }

    const cartButton = event.target.closest(".cart-button");
    if (cartButton && cartButton.dataset.bundle) {
      const urls = JSON.parse(decodeURIComponent(cartButton.dataset.bundle));
      els.selectedUrl.value = urls.join("\n");
      openCartUrlsSequentially(urls);
      return;
    }

    if (cartButton && cartButton.dataset.url) {
      const url = decodeURIComponent(cartButton.dataset.url);
      els.selectedUrl.value = url;
      window.open(url, "_blank");
    }
  });

  document.querySelectorAll(".app-tabs a").forEach((link) => {
    link.addEventListener("click", saveSharedFrameDimensions);
  });
}

renderShapeOptions();
renderPackingOptions();
renderFabricOptions();
restoreSharedFrameDimensions();
bindEvents();
saveSharedFrameDimensions();
render();
window.VivaluxPricing.register("r300", (config, merge) => {
  configuredPriceMultiplier = Number(config.priceMultiplier) || PRICE_MULTIPLIER;
  merge(FABRICS, config.fabrics || []);
  merge(SHAPES, config.shapes || {});
  merge(PACKING_LENGTHS, config.packingLengths || []);
  merge(CONSTANTS, config.constants || {});
  renderFabricOptions();
  renderPackingOptions();
  render();
});
