import { badRequest } from '../lib/errors.js';

/**
 * Validate and coerce part of the request with a zod schema.
 * The parsed value replaces the original, so handlers only ever see clean data.
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(badRequest('Some fields need fixing.', details));
    }
    // Express 5 makes req.query a getter, so store parsed values separately.
    req.valid = { ...req.valid, [source]: result.data };
    next();
  };
}
