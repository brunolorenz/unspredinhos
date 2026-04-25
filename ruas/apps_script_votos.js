// ── Predinho do Dia — Voting Backend ──
// Deploy: Web App → Execute as: Me → Who has access: Anyone

const SHEET_NAME = 'votos';

function doGet(e) {
  const params = e.parameter;

  // ?all=1 → retorna todos os votos para o ranking
  if (params.all === '1') {
    const sheet = getSheet();
    const data  = sheet.getDataRange().getValues();
    const votes = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (parseInt(row[4]) > 0) {
        votes.push({ dia: parseInt(row[0]), mes: parseInt(row[1]), cidade: row[2], uf: row[3], votos: parseInt(row[4]) });
      }
    }
    votes.sort((a, b) => b.votos - a.votos);
    return jsonResponse({ votes });
  }

  // ?dia=7&mes=9 → retorna votos de uma data
  const dia = parseInt(params.dia);
  const mes = parseInt(params.mes);
  if (!dia || !mes) return jsonResponse({ error: 'Parâmetros dia e mes obrigatórios' });

  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  const votes = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (parseInt(row[0]) === dia && parseInt(row[1]) === mes) {
      votes.push({ cidade: row[2], uf: row[3], votos: parseInt(row[4]) || 0 });
    }
  }
  return jsonResponse({ dia, mes, votes });
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const { dia, mes, cidade, uf } = params;
  if (!dia || !mes || !cidade || !uf) return jsonResponse({ error: 'Campos obrigatórios: dia, mes, cidade, uf' });

  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (parseInt(row[0]) === dia && parseInt(row[1]) === mes && row[2] === cidade && row[3] === uf) {
      const votos = (parseInt(row[4]) || 0) + 1;
      sheet.getRange(i + 1, 5).setValue(votos);
      return jsonResponse({ ok: true, votos });
    }
  }

  sheet.appendRow([dia, mes, cidade, uf, 1]);
  return jsonResponse({ ok: true, votos: 1 });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['dia', 'mes', 'cidade', 'uf', 'votos']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
