exports.sanitizeRow = (row) => {
  const sanitized = {};
  for (const key in row) {
    if (typeof row[key] === 'string' && /^[=+\-@]/.test(row[key])) {
      sanitized[key] = `'${row[key]}`;
    } else {
      sanitized[key] = row[key];
    }
  }
  return sanitized;
}
