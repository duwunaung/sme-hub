const { sanitizeRow } = require('./sanitization');
const { format } = require('@fast-csv/format');

function exportCsvResponse(res, data, filename = 'export.csv', viewFile, dataRes) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      res.render(viewFile, dataRes);
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const safeFilename = `${filename.replace(/[^a-z0-9_\-]/gi, '_')}-${timestamp}.csv`;

    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');

    const csvStream = format({ headers: true });

    csvStream.on('error', (err) => {
      console.error('CSV stream error:', err);
      if (!res.headersSent) {
        res.render(viewFile, dataRes);
      } else {
        res.end();
      }
    });

    csvStream.on('end', () => {
      console.log('CSV export completed successfully');
    });

    csvStream.pipe(res);

    data.forEach((row) => {
      csvStream.write(sanitizeRow(row));
    });

    csvStream.end();
  } catch (err) {
    console.error('Unexpected error during CSV export:', err);
    if (!res.headersSent) {
      res.render(viewFile, dataRes);
    } else {
      res.end();
    }
  }
}

module.exports = exportCsvResponse;


// const {sanitizeRow} = require('./sanitization');
// const { format } = require('@fast-csv/format');


// function exportCsvResponse(res, data, filename = 'export.csv') {
//   const timestamp = new Date().toISOString().split('T')[0];
//   const safeFilename = `${filename.replace(/[^a-z0-9_\-]/gi, '_')}-${timestamp}.csv`;
//   res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
//   res.setHeader('Content-Type', 'text/csv; charset=utf-8');

//   const csvStream = format({ headers: true });
//   csvStream.pipe(res);

//   data.forEach((row) => {
//     csvStream.write(sanitizeRow(row));
//   });

//   csvStream.end();
// }

// module.exports = exportCsvResponse;