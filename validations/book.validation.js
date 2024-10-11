const joi = require("joi");

const validateBookCreation = (obj) => {
  const schema = joi.object({
    title: joi.string().required().error(new Error("Book title is required")),
    description: joi
      .string()
      .required()
      .error(new Error("Book description is required")),
    summary: joi.string(),
    tags: joi.array().items(joi.string()),
    genres: joi.array().items(joi.string()),
    coverImage: joi.string(),
  });
  return schema.validate(obj);
};

const validateChapterCreation = (obj) => {
  const schema = joi.object({
    title: joi
      .string()
      .required()
      .error(new Error("Chapter title is required")),
    content: joi
      .string()
      .required()
      .error(new Error("Chapter content is required")),
  });
  return schema.validate(obj);
};

const validateBookStatusUpdate = (obj) => {
  const schema = joi.object({
    status: joi
      .string()
      .valid("published", "archived", "draft")
      .required()
      .error(
        new Error(
          "Book status is required and must be either published, archived or draft"
        )
      ),
  });
  return schema.validate(obj);
};

const validateBookRating = (obj) => {
  const schema = joi.object({
    title: joi.string(),
    description: joi.string(),
    summary: joi.string(),
    content: joi.string(),
    tags: joi.array().items(joi.string()),
    genres: joi.array().items(joi.string()),
    coverImage: joi.string(),
  });
  return schema.validate(obj);
};

module.exports = {
  validateBookCreation,
  validateChapterCreation,
  validateBookStatusUpdate,
  validateBookRating,
};
