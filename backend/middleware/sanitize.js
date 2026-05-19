/**
 * Recursively removes any keys starting with "$" from object inputs
 * to protect against NoSQL operator injection attacks.
 */
const sanitizeObject = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
  }
  return obj;
};

const nosqlSanitize = (req, res, next) => {
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  next();
};

/**
 * Strips script tags and potential HTML injections to prevent Cross-Site Scripting (XSS).
 */
const xssSanitize = (req, res, next) => {
  const cleanValue = (val) => {
    if (typeof val === 'string') {
      return val
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Strip script tags
        .replace(/on\w+="[^"]*"/g, '') // Strip inline event handlers
        .replace(/javascript:[^\s]*/g, ''); // Strip javascript: URLs
    }
    if (Array.isArray(val)) {
      return val.map(cleanValue);
    }
    if (val && typeof val === 'object') {
      for (const k in val) {
        val[k] = cleanValue(val[k]);
      }
    }
    return val;
  };

  req.body = cleanValue(req.body);
  req.query = cleanValue(req.query);
  next();
};

module.exports = {
  nosqlSanitize,
  xssSanitize
};
