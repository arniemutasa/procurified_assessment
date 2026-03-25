const { AppError } = require("../errors/AppError");


// Uses loop to find where json ends and also matches curly braces for nested objjects
function splitLeadingJsonObject(expression) {
  if (typeof expression !== 'string') {
    throw new AppError('Expression must be a string', 400);
  }
  const s = expression.trimStart();
  if (!s.startsWith('{')) {
    throw new AppError('Expression must start with a JSON object', 400);
  }

  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        const jsonText = s.slice(0, i + 1);
        const arithmetic = s.slice(i + 1).trim();
        return { jsonText, arithmetic };
      }
    }
  }

  throw new AppError('Invalid expression: JSON object is not closed', 400);
}

// Extracts and validates variable reference inside JSON part of expression
function parseVariableRef(jsonText) {
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new AppError('Invalid JSON in expression prefix', 400);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new AppError('Expression JSON must be an object', 400);
  }
  const id = parsed.id;
  const n =
    typeof id === 'number'
      ? id
      : typeof id === 'string'
        ? Number.parseInt(id, 10)
        : NaN;
  if (!Number.isInteger(n) || n < 1) {
    throw new AppError('Expression JSON must include a positive integer "id"', 400);
  }
  return { id: n, name: typeof parsed.name === 'string' ? parsed.name : undefined };
}


module.exports = {
    splitLeadingJsonObject,
    parseVariableRef
}