export const validate = (schema, property = "body") => (req, res, next) => {
  const { value, error } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      errors: error.details.map((e) => e.message),
    });
  }

  req[property] = value;
  next();
};