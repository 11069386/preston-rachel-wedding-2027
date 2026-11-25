const RSVP_SPREADSHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";
const RSVP_SHEET_NAME = "RSVPs";
const RSVP_HEADERS = ["Timestamp", "Name", "Attendance", "Number Attending", "Message"];
const RSVP_ACCEPTS = "Joyfully accepts";
const RSVP_DECLINES = "Regretfully declines";

function doGet() {
  return HtmlService.createHtmlOutputFromFile("RSVP_Admin")
    .setTitle("Preston & Rachel — RSVP Manager");
}

function listRsvps() {
  const sheet = getAdminRsvpSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  return sheet.getRange(2, 1, lastRow - 1, RSVP_HEADERS.length)
    .getDisplayValues()
    .map((values, index) => ({
      row: index + 2,
      timestamp: values[0],
      name: values[1],
      attendance: values[2],
      guests: values[3],
      message: values[4]
    }))
    .reverse();
}

function addManualRsvp(data) {
  const rsvp = normalizeAdminRsvp_(data);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getAdminRsvpSheet_().appendRow([
      new Date(),
      safeAdminCell_(rsvp.name),
      rsvp.attendance,
      rsvp.guests,
      safeAdminCell_(rsvp.message)
    ]);
  } finally {
    lock.releaseLock();
  }
  return { result: "success" };
}

function updateRsvp(data) {
  const row = Number(data.row);
  const sheet = getAdminRsvpSheet_();
  const rsvp = normalizeAdminRsvp_(data);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (!Number.isInteger(row) || row < 2 || row > sheet.getLastRow()) {
      throw new Error("That RSVP could not be found. Refresh the list and try again.");
    }
    sheet.getRange(row, 2, 1, 4).setValues([[
      safeAdminCell_(rsvp.name),
      rsvp.attendance,
      rsvp.guests,
      safeAdminCell_(rsvp.message)
    ]]);
  } finally {
    lock.releaseLock();
  }
  return { result: "success" };
}

function deleteRsvp(rowValue) {
  const row = Number(rowValue);
  const sheet = getAdminRsvpSheet_();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (!Number.isInteger(row) || row < 2 || row > sheet.getLastRow()) {
      throw new Error("That RSVP could not be found. Refresh the list and try again.");
    }
    sheet.deleteRow(row);
  } finally {
    lock.releaseLock();
  }
  return { result: "success" };
}

function getAdminRsvpSheet_() {
  if (RSVP_SPREADSHEET_ID === "PASTE_YOUR_GOOGLE_SHEET_ID_HERE") {
    throw new Error("Add your Google Sheet ID to RSVP_SPREADSHEET_ID in the Apps Script project.");
  }
  const spreadsheet = SpreadsheetApp.openById(RSVP_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(RSVP_SHEET_NAME)
    || spreadsheet.insertSheet(RSVP_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(RSVP_HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, RSVP_HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

function normalizeAdminRsvp_(data) {
  const name = String(data.name || "").trim();
  const attendance = String(data.attendance || "").trim();
  const guests = Number(data.guests);
  const message = String(data.message || "").trim();

  if (!name || name.length > 200) throw new Error("Enter a name (up to 200 characters).");
  if (attendance !== RSVP_ACCEPTS && attendance !== RSVP_DECLINES) {
    throw new Error("Choose whether this guest accepts or declines.");
  }
  if (attendance === RSVP_ACCEPTS && (!Number.isInteger(guests) || guests < 1 || guests > 50)) {
    throw new Error("Enter a guest count between 1 and 50.");
  }
  if (message.length > 1000) throw new Error("The message must be 1,000 characters or fewer.");

  return {
    name,
    attendance,
    guests: attendance === RSVP_ACCEPTS ? guests : 0,
    message
  };
}

function safeAdminCell_(value) {
  const text = String(value || "");
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}
