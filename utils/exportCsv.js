const {sanitizeRow} = require('./sanitization');
const { format } = require('@fast-csv/format');


function exportCsvResponse(res, data, filename = 'export.csv') {
  const timestamp = new Date().toISOString().split('T')[0];
  const safeFilename = `${filename.replace(/[^a-z0-9_\-]/gi, '_')}-${timestamp}.csv`;
  res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');

  const csvStream = format({ headers: true });
  csvStream.pipe(res);

  data.forEach((row) => {
    csvStream.write(sanitizeRow(row));
  });

  csvStream.end();
}

module.exports = exportCsvResponse;