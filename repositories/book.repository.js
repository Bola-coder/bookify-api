const Books = require("../models/book.model");

const createBook = (values) => {
  return new Books(values).save();
};

const getBooks = (query) => Books.find({ status: "published" });

const getBooksByAuthor = (author) => Books.find({ author });

const getBookById = (id) => Books.findById(id);

const getBookByIdAndAuthor = (id, author) => Books.findOne({ _id: id, author });

const getBookByTitle = (title) =>
  Books.findOne({ title }).then((book) => book?.toObject());

const getBooksBasedOnQuery = (query) =>
  Books.find({
    status: "published",
    ...query,
  });

const updateBook = (id, values) =>
  Books.findByIdAndUpdate(id, values, {
    new: true,
    runValidators: true,
    select: "-password -__v",
  });

const deleteBook = (id) => Books.findByIdAndDelete(id);

module.exports = {
  createBook,
  getBooks,
  getBookById,
  getBookByIdAndAuthor,
  getBookByTitle,
  getBooksByAuthor,
  getBooksBasedOnQuery,
  updateBook,
  deleteBook,
};
