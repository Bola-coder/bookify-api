const {
  createBook,
  getBooks,
  getBooksByAuthor,
  getBookById,
  getBookByIdAndAuthor,
  updateBook,
} = require("../repositories/book.repository");
const {
  validateBookCreation,
  validateBookStatusUpdate,
} = require("../validations/book.validation");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const createNewBook = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { error } = validateBookCreation(req.body);
  if (error) {
    return next(new AppError(error.message, 400));
  }

  const book = await createBook({ ...req.body, author: userId });

  if (!book) {
    return next(new AppError("Book not found", 404));
  }

  res.status(201).json({
    status: "success",
    message: "Book created successfully",
    data: {
      book,
    },
  });
});

const getAllBooks = catchAsync(async (req, res, next) => {
  const books = await getBooks();

  if (books.length === 0) {
    res.status(200).json({
      status: "success",
      message: "No books found",
    });
  }

  res.status(200).json({
    status: "success",
    result: books.length,
    message: "Books retrieved successfully",
    data: {
      books,
    },
  });
});

const getAllBooksForAuthor = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const books = await getBooksByAuthor(userId);

  if (books.length === 0) {
    res.status(200).json({
      status: "success",
      message: "No books found for the author",
    });
  }

  res.status(200).json({
    status: "success",
    result: books.length,
    message: "Author's Books retrieved successfully",
    data: {
      books,
    },
  });
});

const getBookDetails = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const book = await getBookById(id);

  if (!book) {
    return next(new AppError("Book with the specified ID not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Book details retrieved successfully",
    data: {
      book,
    },
  });
});

const getBookDetailsByAuthor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  const userId = req.user._id;
  const book = await getBookByIdAndAuthor(id, userId);

  if (!book) {
    return next(
      new AppError(
        "Book with the specified id not found for the logged in user (author)",
        404
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Book details retrieved successfully",
    data: {
      book,
    },
  });
});

const updateBookStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const { error } = validateBookStatusUpdate(req.body);

  if (error) {
    return next(new AppError(error.message, 400));
  }

  const book = await getBookByIdAndAuthor(id, userId);

  if (!book) {
    return next(
      new AppError(
        "Book with the specified ID not found, for the user (author)s",
        404
      )
    );
  }

  const { status } = req.body;

  if (book.status === status) {
    return next(
      new AppError(
        `Book already has a status of ${status}. Please specify a new status`,
        400
      )
    );
  }

  const publishedBook = await updateBook(id, { status });

  if (!publishedBook) {
    return next(new AppError("Book could not be published", 400));
  }

  res.status(200).json({
    status: "success",
    message: "Book published successfully",
    data: {
      book: publishedBook,
    },
  });
});

module.exports = {
  createNewBook,
  getAllBooks,
  getAllBooksForAuthor,
  getBookDetails,
  getBookDetailsByAuthor,
  updateBookStatus,
};
