const RSVP_SHEET_NAME = "RSVPs";
const RSVP_HEADERS = ["Timestamp", "Name", "Attendance", "Number Attending", "Message"];
const RSVP_ACCEPTS = "Joyfully accepts";
const RSVP_DECLINES = "Regretfully declines";

function doPost(event) {
  const data = JSON.parse(event.postData.contents);
  const rsvp = normalizeGuestRsvp_(data);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getGuestRsvpSheet_();
    sheet.appendRow([
      new Date(),
      safeGuestCell_(rsvp.name),
      rsvp.attendance,
      rsvp.guests,
      safeGuestCell_(rsvp.message)
    ]);
  } finally {
    lock.releaseLock();
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getGuestRsvpSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("This Apps Script must be bound to the RSVP spreadsheet.");
  const sheet = spreadsheet.getSheetByName(RSVP_SHEET_NAME)
    || spreadsheet.insertSheet(RSVP_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(RSVP_HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, RSVP_HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

function normalizeGuestRsvp_(data) {
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

function safeGuestCell_(value) {
  const text = String(value || "");
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}
