/**
 * Validation utilities for client-side forms and inputs.
 */

export function validateInputString(inputStr, alphabet = ['0', '1']) {
  const allowed = new Set(alphabet);
  for (let i = 0; i < inputStr.length; i++) {
    const char = inputStr[i];
    if (!allowed.has(char)) {
      return {
        isValid: false,
        error: `Symbol '${char}' at index ${i} is not in the alphabet {${alphabet.join(', ')}}.`,
      };
    }
  }
  return { isValid: true, error: null };
}

export function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) {
    throw new Error('CSV text is empty.');
  }

  const samples = [];
  let startIndex = 0;

  // Check header
  const firstLine = lines[0].toLowerCase();
  if (firstLine.includes('string') && firstLine.includes('label')) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length < 2) {
      throw new Error(`Line ${i + 1} does not have at least two comma-separated values (string, label).`);
    }

    const strVal = parts[0].trim();
    const rawLabel = parts[1].trim().toLowerCase();
    let label = 0;

    if (rawLabel === '1' || rawLabel === 'true' || rawLabel === 'positive' || rawLabel === 'pos') {
      label = 1;
    } else if (rawLabel === '0' || rawLabel === 'false' || rawLabel === 'negative' || rawLabel === 'neg') {
      label = 0;
    } else {
      throw new Error(`Line ${i + 1}: Unrecognized label '${rawLabel}'. Expected 1/0 or positive/negative.`);
    }

    samples.push({
      id: `imported-${i}`,
      string: strVal === 'ε' || strVal === '""' ? '' : strVal,
      label,
      source: 'csv_import',
      is_noisy: false,
    });
  }

  return samples;
}

export function exportToCSV(samples) {
  const header = 'string,label,is_noisy\n';
  const rows = samples.map((s) => `"${s.string}",${s.label},${s.is_noisy}`).join('\n');
  return header + rows;
}

export function exportToJSON(data) {
  return JSON.stringify(data, null, 2);
}

