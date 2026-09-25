/**
 * Backend do placar de "Advinhe o signo do predinho".
 *
 * Guarda o melhor resultado de cada sessão de jogo numa aba chamada
 * "Leaderboard" da planilha onde este script está vinculado (Extensões >
 * Apps Script) e devolve o ranking (por sequência, do maior pro menor)
 * quando o jogo pede.
 *
 * Cada sessão de jogo (uma pessoa jogando, numa aba/navegador) tem um
 * sessionId gerado no navegador. Toda vez que ela bate um novo recorde
 * NESSA sessão, o jogo manda esse sessionId de novo — este script então
 * ATUALIZA a linha existente em vez de criar uma nova, então uma pessoa
 * jogando por 20 minutos não vira 20 linhas na planilha, só 1, sempre
 * com o melhor resultado dela até agora.
 *
 * COMO PUBLICAR:
 * 1. Abra (ou crie) uma planilha do Google Sheets — pode ser uma nova, só
 *    pro placar, não precisa ser a dos predinhos.
 * 2. Menu Extensões > Apps Script.
 * 3. Apague o conteúdo de Code.gs e cole este arquivo inteiro.
 * 4. Menu Implantar > Nova implantação.
 * 5. Tipo: "App da Web".
 * 6. Executar como: "Eu" (sua conta).
 * 7. Quem pode acessar: "Qualquer pessoa".
 * 8. Implantar, autorize as permissões pedidas.
 * 9. Copie a URL que termina em /exec.
 * 10. Cole essa URL na constante LEADERBOARD_URL do arquivo
 *     advinhe-o-signo.html.
 *
 * Sempre que editar este script, é preciso fazer uma NOVA implantação
 * (ou "Gerenciar implantações > editar > Nova versão") pra publicar
 * a mudança — só salvar o arquivo não atualiza o app já publicado.
 */

var SHEET_NAME = 'Leaderboard';
var MAX_ENTRIES_RETURNED = 20;
var MAX_NAME_LENGTH = 24;

// Colunas: A Data | B Nome | C Acertos | D SessionId
var COL_DATA = 1, COL_NOME = 2, COL_SEQ = 3, COL_SESSION = 4;

function doGet(e) {
  var sheet = getSheet_();
  var rows = readRows_(sheet);
  rows.sort(function (a, b) { return b.streak - a.streak; });
  var top = rows.slice(0, MAX_ENTRIES_RETURNED);
  return jsonResponse_({ ok: true, leaderboard: top });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var name = sanitizeName_(body.name);
    var streak = sanitizeStreak_(body.streak);
    var sessionId = String(body.sessionId || '').trim().slice(0, 64);

    if (streak <= 0) {
      return jsonResponse_({ ok: false, error: 'Sequência inválida.' });
    }
    if (!sessionId) {
      return jsonResponse_({ ok: false, error: 'sessionId ausente.' });
    }

    var sheet = getSheet_();
    var rowIndex = findRowBySession_(sheet, sessionId);

    if (rowIndex) {
      sheet.getRange(rowIndex, COL_DATA).setValue(new Date());
      sheet.getRange(rowIndex, COL_NOME).setValue(name);
      sheet.getRange(rowIndex, COL_SEQ).setValue(streak);
    } else {
      sheet.appendRow([new Date(), name, streak, sessionId]);
    }

    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function findRowBySession_(sheet, sessionId) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  var ids = sheet.getRange(2, COL_SESSION, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === sessionId) return i + 2; // +2: cabeçalho + índice 1-based
  }
  return null;
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Data', 'Nome', 'Acertos', 'SessionId']);
  }
  return sheet;
}

function readRows_(sheet) {
  var values = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var name = String(values[i][COL_NOME - 1] || '').trim();
    var streak = Number(values[i][COL_SEQ - 1]) || 0;
    if (name && streak > 0) {
      rows.push({ name: name, streak: streak });
    }
  }
  return rows;
}

function sanitizeName_(rawName) {
  var name = String(rawName || '').trim().slice(0, MAX_NAME_LENGTH);
  return name || 'Anônimo';
}

function sanitizeStreak_(rawStreak) {
  var streak = parseInt(rawStreak, 10);
  if (isNaN(streak)) return 0;
  return Math.max(0, Math.min(9999, streak));
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

