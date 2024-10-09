const Books = require("../models/book.model");

const createBook = (values) => {
  return new Books(values).save().then((book) => book.toObject());
};

const getBooks = () =>
  Books.find({ status: "published" }).then((books) =>
    books.map((book) => book.toObject())
  );

const getBooksByAuthor = (author) =>
  Books.find({ author }).then((books) => books.map((book) => book.toObject()));

const getBookById = (id) => Books.findById(id);

const getBookByIdAndAuthor = (id, author) =>
  Books.findOne({ _id: id, author }).then((book) => book?.toObject());

const getBookByTitle = (title) =>
  Books.findOne({ title }).then((book) => book?.toObject());

const updateBook = (id, values) =>
  Books.findByIdAndUpdate(id, values, {
    new: true,
    runValidators: true,
    select: "-password -__v",
  }).then((book) => book?.toObject());

const deleteBook = (id) => Books.findByIdAndDelete(id);

module.exports = {
  createBook,
  getBooks,
  getBookById,
  getBookByIdAndAuthor,
  getBookByTitle,
  getBooksByAuthor,
  updateBook,
  deleteBook,
};
