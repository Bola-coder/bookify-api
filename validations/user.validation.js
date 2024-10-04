const joi = require("joi");

// Validation for the user signup
const validateUserSignup = (obj) => {
  const schema = joi.object().keys({
    firstname: joi
      .string()
      .required()
      .error(() => new Error("Please provide first name")),
    lastname: joi
      .string()
      .required()
      .error(() => new Error("Please provide last name")),
    email: joi
      .string()
      .email({ tlds: { allow: false } })
      .required()
      .error(() => new Error("Please provide a valid email address")),
    password: joi
      .string()
      .min(7)
      .required()
      .error(
        () => new Error("Please provide a password not less than 8 characters")
      ),
    phoneNumber: joi
      .string()
      .required()
      .error(() => new Error("Please provide a valid phone number")),
  });
  return schema.validate(obj);
};

// Validation for the user login
const validateUserLogin = (obj) => {
  const schema = joi.object().keys({
    email: joi
      .string()
      .email()
      .required()
      .error(() => new Error("Please provide a valid email address")),
    password: joi
      .string()
      .required()
      .error(() => new Error("Password must be provided")),
  });
  return schema.validate(obj);
};

module.exports = { validateUserLogin, validateUserSignup };
