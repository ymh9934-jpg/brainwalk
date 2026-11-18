/**
 * 두뇌 산책 - 가족 연동 서버 (Google Apps Script)
 *
 * 할머니 앱이 기록을 보내면 이 시트에 저장하고,
 * 가족 앱이 가족 코드로 기록을 읽어 갑니다.
 *
 * - 쓰기(sync): 할머니 폰에만 있는 기기 토큰이 맞아야 저장돼요.
 * - 읽기(summary): 가족 코드를 아는 사람만 볼 수 있어요.
 *
 * 설치: 구글 시트 → 확장 프로그램 → Apps Script → 이 코드 붙여넣기 →
 *       배포 → 새 배포 → 웹 앱 (실행: 나, 액세스: 모든 사용자)
 */

var SHEET = 'families';
var HEADER = ['code', 'token', 'name', 'created', 'updated', 'snapshot'];
var MAX_CELL = 49000;
var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(HEADER);
    sh.setFrozenRows(1);
  }
  return sh;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function norm_(code) {
  return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function findRow_(sh, code) {
  var c = norm_(code);
  if (!c) return -1;
  var vals = sh.getRange(1, 1, sh.getLastRow(), 1).getValues();
  for (var i = 1; i < vals.length; i++) {
    if (norm_(vals[i][0]) === c) return i + 1;
  }
  return -1;
}

function newCode_(sh) {
  for (var tries = 0; tries < 20; tries++) {
    var s = '';
    for (var i = 0; i < 8; i++) s += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    var code = s.slice(0, 4) + '-' + s.slice(4);
    if (findRow_(sh, code) < 0) return code;
  }
  throw new Error('code');
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'summary') return out_(summary_(p.code));
  return out_({ ok: true, app: 'brainwalk' });
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return out_({ ok: false, error: 'bad_json' });
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (body.action === 'register') return out_(register_(body));
    if (body.action === 'sync') return out_(sync_(body));
    return out_({ ok: false, error: 'unknown_action' });
  } finally {
    lock.releaseLock();
  }
}

function register_(body) {
  var sh = sheet_();
  var code = newCode_(sh);
  var token = Utilities.getUuid();
  var now = new Date();
  sh.appendRow([code, token, String(body.name || '').slice(0, 20), now, now, '']);
  return { ok: true, code: code, token: token };
}

function sync_(body) {
  var sh = sheet_();
  var row = findRow_(sh, body.code);
  if (row < 0) return { ok: false, error: 'not_found' };
  var token = sh.getRange(row, 2).getValue();
  if (!body.token || body.token !== token) return { ok: false, error: 'bad_token' };
  var snap = body.snapshot || {};
  var json = JSON.stringify(snap);
  // 셀 한 칸 한도(5만 자)를 넘지 않게 오래된 점수 기록부터 줄여요.
  while (json.length > MAX_CELL && snap.hist && snap.hist.length > 20) {
    snap.hist = snap.hist.slice(Math.floor(snap.hist.length / 4));
    json = JSON.stringify(snap);
  }
  if (json.length > MAX_CELL) return { ok: false, error: 'too_big' };
  sh.getRange(row, 3, 1, 4).setValues([[String(snap.name || '').slice(0, 20), sh.getRange(row, 4).getValue(), new Date(), json]]);
  return { ok: true, saved: new Date().getTime() };
}

function summary_(code) {
  var sh = sheet_();
  var row = findRow_(sh, code);
  if (row < 0) return { ok: false, error: 'not_found' };
  var v = sh.getRange(row, 1, 1, 6).getValues()[0];
  var snap = null;
  try {
    snap = v[5] ? JSON.parse(v[5]) : null;
  } catch (err) {}
  return { ok: true, code: v[0], name: v[2], updated: v[4] ? new Date(v[4]).getTime() : 0, snapshot: snap };
}
