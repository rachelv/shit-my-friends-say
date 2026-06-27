/**
 * Read-only backend for "Shit My Friends Say".
 *
 * The bound spreadsheet is the database. People add quotes by editing the sheet
 * directly; anything in the sheet is live. Sheet "Quotes" has a header row:
 *   text | person | note | group_id
 *
 * Deploy as a Web App (Deploy > New deployment > Web app):
 *   - Execute as: Me
 *   - Who has access: Anyone
 * Copy the resulting /exec URL into ENDPOINT in app.js.
 *
 * doGet -> returns quotes as conversation-grouped JSON: [[{text,person,note}], ...]
 *          Rows sharing a group_id render as one card; blank group_id = standalone.
 */

var SHEET_NAME = "Quotes";

function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var values = sheet.getDataRange().getValues();
  values.shift(); // drop header row

  var standalone = [];
  var groups = {}; // group_id -> array of quotes

  values.forEach(function (row) {
    var text = String(row[0] || "").trim();
    var person = String(row[1] || "").trim();
    var note = String(row[2] || "").trim();
    var groupId = String(row[3] || "").trim();

    if (!text || !person) return;

    var quote = { text: text, person: person, note: note };
    if (groupId) {
      (groups[groupId] = groups[groupId] || []).push(quote);
    } else {
      standalone.push([quote]);
    }
  });

  var entries = standalone.concat(
    Object.keys(groups).map(function (k) {
      return groups[k];
    }),
  );

  return ContentService.createTextOutput(JSON.stringify(entries)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
