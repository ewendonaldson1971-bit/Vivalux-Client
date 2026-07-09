var LOGIN_EMAIL_RECIPIENT = "jtlog@vivad.com.au";
var ACCESS_REQUEST_RECIPIENT = "sales@vivad.com.au";
var CART_CLICK_RECIPIENT = "jtlog@vivad.com.au";
var USER_SHEET_ID = "1kisUqwsdbUVgI4xZuWqBtf7k9N8K33HeslEfugAhBNc";
// To send from vivad1958@gmail.com, deploy this Web App while signed in
// to the vivad1958@gmail.com Google account and choose "Execute as me".

function doPost(e) {
  var payload = parsePayload(e);
  if (String(payload.type || "").trim() === "authenticate") {
    return authenticateLogin(payload);
  }
  if (String(payload.type || "").trim() === "accessRequest") {
    return sendAccessRequestEmail(payload);
  }
  if (String(payload.type || "").trim() === "cartClick") {
    return sendCartClickEmail(payload);
  }

  return sendLoginEmail(payload);
}

function authenticateLogin(payload) {
  var username = String(payload.username || "").trim();
  var password = String(payload.password || "").trim();

  if (!username || !password) {
    return authResponse({ ok: false, error: "missingCredentials" }, payload);
  }

  var user;
  try {
    user = findUser(username, password);
  } catch (error) {
    return authResponse({ ok: false, error: "sheetUnavailable" }, payload);
  }

  if (!user) {
    return authResponse({ ok: false, error: "invalidCredentials" }, payload);
  }

  sendLoginMessage(user.username);

  return authResponse({
    ok: true,
    user: {
      username: user.username,
      discountPercentage: user.discountPercentage
    }
  }, payload);
}

function sendLoginEmail(payload) {
  var username = String(payload.username || "").trim();
  if (!username) {
    return jsonResponse({ ok: false, error: "Missing username" });
  }

  sendLoginMessage(username);

  return jsonResponse({ ok: true });
}

function sendLoginMessage(username) {
  MailApp.sendEmail({
    to: LOGIN_EMAIL_RECIPIENT,
    subject: "Vivtrack 4 Builder login",
    body: "User logged in to Vivtrack 4 Builder: " + username
  });
}

function sendAccessRequestEmail(payload) {
  var firstName = String(payload.firstName || "").trim();
  var lastName = String(payload.lastName || "").trim();
  var companyName = String(payload.companyName || "").trim();
  var email = String(payload.email || "").trim();

  if (!firstName || !lastName || !companyName || !email) {
    return jsonResponse({ ok: false, error: "Missing access request field" });
  }

  var body = [
    "Builder Access Request",
    "",
    "First Name: " + firstName,
    "Last Name: " + lastName,
    "Company Name: " + companyName,
    "Email address: " + email
  ].join("\n");

  MailApp.sendEmail({
    to: ACCESS_REQUEST_RECIPIENT,
    subject: "Builder Access Request",
    body: body,
    replyTo: email
  });

  return jsonResponse({ ok: true });
}

function sendCartClickEmail(payload) {
  var username = String(payload.username || "").trim();
  var items = Array.isArray(payload.items) ? payload.items : [];

  if (!username || !items.length) {
    return jsonResponse({ ok: false, error: "Missing cart click details" });
  }

  var body = [
    "Vivtrack 4 Builder Add to Cart click",
    "",
    "User email address: " + username,
    "Builder: " + String(payload.builder || ""),
    "Clicked button: " + String(payload.clickedLabel || ""),
    "Clicked at: " + String(payload.clickedAt || ""),
    "Page URL: " + String(payload.pageUrl || ""),
    "",
    "Items:"
  ];

  items.forEach(function (item, index) {
    body = body.concat(renderCartItem(item, index));
  });

  MailApp.sendEmail({
    to: CART_CLICK_RECIPIENT,
    subject: "Vivtrack 4 Builder Add to Cart",
    body: body.join("\n")
  });

  return jsonResponse({ ok: true });
}

function renderCartItem(item, index) {
  var lines = [
    "",
    "Item " + (index + 1),
    "Qcode: " + String(item.qcode || ""),
    "Quantity: " + String(item.quantity || ""),
    "Description: " + String(item.description || ""),
    "Short name: " + String(item.shortname || ""),
    "Price: " + String(item.price || ""),
    "Total price estimate: " + String(item.totalPrice || ""),
    "Width: " + String(item.width || ""),
    "Height: " + String(item.height || ""),
    "Packing length cm: " + String(item.packingLengthCm || ""),
    "Packing width cm: " + String(item.packingWidthCm || ""),
    "Packing height cm: " + String(item.packingHeightCm || ""),
    "Weight kg: " + String(item.weightKg || ""),
    "Cart URL: " + String(item.url || "")
  ];

  if (item.params) {
    lines.push("All cart parameters:");
    Object.keys(item.params).sort().forEach(function (key) {
      lines.push("  " + key + ": " + String(item.params[key]));
    });
  }

  return lines;
}

function parsePayload(e) {
  if (e && e.parameter && e.parameter.payload) {
    try {
      return JSON.parse(e.parameter.payload);
    } catch (error) {
      return {};
    }
  }

  try {
    return JSON.parse(e.postData && e.postData.contents ? e.postData.contents : "{}");
  } catch (error) {
    return {};
  }
}

function authResponse(data, payload) {
  if (payload && payload.requestId) {
    return htmlAuthResponse(data, payload);
  }
  return jsonResponse(data);
}

function htmlAuthResponse(data, payload) {
  var message = {
    type: "vivalux-auth-response",
    requestId: String(payload.requestId || ""),
    result: data
  };
  var targetOrigin = String(payload.parentOrigin || "*");
  var html = "<!doctype html><meta charset=\"utf-8\"><script>" +
    "(function(){" +
    "var message=" + JSON.stringify(message).replace(/</g, "\\u003c") + ";" +
    "var targetOrigin=" + JSON.stringify(targetOrigin) + ";" +
    "function send(target){try{if(target)target.postMessage(message,targetOrigin);}catch(error){}}" +
    "send(window.parent);" +
    "send(window.top);" +
    "send(window.parent&&window.parent.parent);" +
    "}());</script>";

  return HtmlService
    .createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function findUser(username, password) {
  var users = loadUsers();
  var usernameLower = username.toLowerCase();
  for (var index = 0; index < users.length; index += 1) {
    var user = users[index];
    if (user.username.toLowerCase() === usernameLower && user.password === password) {
      return user;
    }
  }
  return null;
}

function loadUsers() {
  var values = loadUserSheetValues();
  if (values.length < 2) return [];

  var headers = values.shift().map(normalizedKey);
  var users = [];

  values.forEach(function (row) {
    var record = {};
    headers.forEach(function (header, index) {
      record[header] = row[index] || "";
    });

    var username = String(getByHeader(record, ["username", "user", "email", "emailaddress", "name"]) || "").trim();
    var password = String(getByHeader(record, ["password", "pass"]) || "").trim();
    var discount = parseDiscount(getByHeader(record, ["discount", "dicount", "discountpercentage", "discountpercent"]));

    if (username && password) {
      users.push({
        username: username,
        password: password,
        discountPercentage: discount
      });
    }
  });

  return users;
}

function loadUserSheetValues() {
  try {
    return SpreadsheetApp.openById(USER_SHEET_ID).getSheets()[0].getDataRange().getDisplayValues();
  } catch (error) {
    return loadPublicUserSheetCsv();
  }
}

function loadPublicUserSheetCsv() {
  var url = "https://docs.google.com/spreadsheets/d/" + USER_SHEET_ID + "/export?format=csv";
  var response = UrlFetchApp.fetch(url, {
    followRedirects: true,
    muteHttpExceptions: true
  });
  var status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error("Could not fetch user sheet CSV. HTTP status " + status);
  }
  return Utilities.parseCsv(response.getContentText());
}

function normalizedKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getByHeader(row, names) {
  for (var index = 0; index < names.length; index += 1) {
    if (Object.prototype.hasOwnProperty.call(row, names[index])) return row[names[index]];
  }
  return "";
}

function parseDiscount(value) {
  var raw = String(value || "").trim();
  if (!raw) return 0;
  var hadPercent = raw.indexOf("%") !== -1;
  var number = Number(raw.replace(/%/g, "").trim());
  if (!isFinite(number)) return 0;
  if (!hadPercent && number > 0 && number <= 1) number *= 100;
  return Math.max(0, Math.min(100, number));
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
