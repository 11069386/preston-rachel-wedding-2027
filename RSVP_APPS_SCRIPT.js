function doPost(event) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RSVPs")
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet("RSVPs");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Name", "Attendance", "Number Attending", "Message"]);
  }

  const data = JSON.parse(event.postData.contents);
  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.name || "",
    data.attendance || "",
    data.guests || "",
    data.message || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
