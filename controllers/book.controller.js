const {
  createBook,
  getBooks,
  getBooksByAuthor,
  getBookById,
  getBookByIdAndAuthor,
  updateBook,
  getBooksBasedOnQuery,
} = require("../repositories/book.repository");
const {
  validateBookCreation,
  validateChapterCreation,
  validateBookStatusUpdate,
} = require("../validations/book.validation");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { uploader } = require("./../utils/cloudinary");
const { dataUri } = require("./../utils/multer");

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

const addNewBookChapter = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const { error } = validateChapterCreation(req.body);

  if (error) {
    return next(new AppError(error.message, 400));
  }

  const book = await getBookByIdAndAuthor(id, userId);

  if (!book) {
    return next(new AppError("Book with the specified ID not found", 404));
  }

  const { title, content } = req.body;

  book.chapters.push({ title, content });

  await book.save();

  res.status(201).json({
    status: "success",
    message: "Chapter added successfully",
    data: {
      book,
    },
  });
});

const updateChapter = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { chapterId } = req.params;
  const userId = req.user._id;

  const { error } = validateChapterCreation(req.body);

  if (error) {
    return next(new AppError(error.message, 400));
  }

  const book = await getBookByIdAndAuthor(id, userId);

  if (!book) {
    return next(new AppError("Book with the specified ID not found", 404));
  }

  const { title, content } = req.body;

  const chapter = book.chapters.id(chapterId);

  if (!chapter) {
    return next(new AppError("Chapter with the specified ID not found", 404));
  }
  chapter.title = title;
  chapter.content = content;

  await book.save();

  res.status(200).json({
    status: "success",
    message: "Chapter updated successfully",
    data: {
      book,
    },
  });
});

const deleteChapter = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { chapterId } = req.params;
  const userId = req.user._id;

  const book = await getBookByIdAndAuthor(id, userId);

  if (!book) {
    return next(new AppError("Book with the specified ID not found", 404));
  }

  const chapter = book.chapters.id(chapterId);

  if (!chapter) {
    return next(new AppError("Chapter with the specified ID not found", 404));
  }

  const newChapters = book.chapters.filter(
    (chapter) => !chapter._id.equals(chapterId)
  );

  book.chapters = newChapters;

  await book.save();

  res.status(200).json({
    status: "success",
    message: "Chapter deleted successfully",
    data: {
      book,
    },
  });
});

// Get all published books in the database
const getAllBooks = catchAsync(async (req, res, next) => {
  const books = await getBooks().populate("author");

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

// Get all books for the logged in user (author)
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
  const book = await getBookById(id).populate("author");

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

  if (book.chapters.length === 0 && status === "published") {
    return next(
      new AppError("Book must have at least one chapter to be published", 400)
    );
  }

  const publishedBook = await updateBook(id, {
    status,
    publicationDate: status === "published" ? new Date() : null,
  });

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

const updateBookDetails = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (Object.keys(req.body).length === 0) {
    return next(new AppError("No fields provided for update", 400));
  }

  const allowedFields = [
    "title",
    "description",
    "summary",
    "content",
    "tags",
    "genres",
    "coverImage",
  ];

  const book = await getBookByIdAndAuthor(id, userId);

  if (!book) {
    return next(
      new AppError(
        "Book with the specified ID not found for the user (author)",
        404
      )
    );
  }

  const updatedFields = Object.keys(req.body);
  const isValidField = updatedFields.every((field) =>
    allowedFields.includes(field)
  );

  if (!isValidField) {
    return next(new AppError("Invalid field(s) provided", 400));
  }

  const updatedBook = await updateBook(id, req.body);

  if (!updatedBook) {
    return next(new AppError("Book could not be updated", 400));
  }

  res.status(200).json({
    status: "success",
    message: "Book updated successfully",
    data: {
      book: updatedBook,
    },
  });
});

const uploadBookCoverImage = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const book = await getBookByIdAndAuthor(id, userId);

  if (!book) {
    return next(
      new AppError(
        "Book with the specified ID not found for the user (author)",
        404
      )
    );
  }
  console.log(req.file);
  if (!req.file) {
    return next(new AppError("Please upload a file", 400));
  }

  const file = dataUri(req).content;

  const result = await uploader.upload(file, {
    folder: "bookify/book-covers",
    secure: true,
  });

  if (!result) {
    return next(new AppError("Book cover image could not be uploaded", 400));
  }

  const updatedBook = await updateBook(id, { coverImage: result.secure_url });

  if (!updatedBook) {
    return next(new AppError("Book cover image could not be updated", 400));
  }

  res.status(200).json({
    status: "success",
    message: "Book cover image updated successfully",
    data: {
      book: updatedBook,
    },
  });
});

const userLikeBook = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const book = await getBookById(id);

  if (!book) {
    return next(new AppError("Book not found", 404));
  }

  const userLikeExist = book.likes.filter((like) => like._id.equals(userId));
  console.log(userLikeExist);
  if (userLikeExist.length > 0) {
    return next(new AppError("You have already liked this book", 400));
  }

  book.likes.push(userId);
  await book.save();

  res.status(200).json({
    status: "success",
    message: "Book liked successfully",
    data: {
      book,
    },
  });
});

const userUnlikeBook = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const book = await getBookById(id);

  if (!book) {
    return next(new AppError("Book with the specified ID not found", 404));
  }

  console.log(book.likes);
  console.log(userId);
  const userLikeExist = book.likes.filter((like) => like._id.equals(userId));

  if (userLikeExist.length === 0) {
    return next(new AppError("You have not liked this book", 400));
  }

  book.likes.splice(book.likes.indexOf(userId), 1);
  await book.save();

  res.status(200).json({
    status: "success",
    message: "Book unliked unsuccessfully",
    data: {
      book,
    },
  });
});

const userRateBook = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { rating } = req.body;

  if (!rating) {
    return next(new AppError("Rating value is required to rate a book", 400));
  }

  if (rating < 1 || rating > 5) {
    return next(new AppError("Rating value must be between 1 and 5", 400));
  }

  const book = await getBookById(id);

  if (!book) {
    return next(new AppError("Book not found", 404));
  }

  const userRatingExist = book.ratings.filter((rating) =>
    rating.userId.equals(userId)
  );

  if (userRatingExist.length > 0) {
    userRatingExist[0].rating = rating;
    await book.save();
  } else {
    book.ratings.push({ userId, rating });
    await book.save();
  }

  res.status(200).json({
    status: "success",
    message: "Book rated successfully",
    data: {
      book,
    },
  });
});

const userReviewBook = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { comment } = req.body;

  if (!comment) {
    return next(new AppError("Comment is required to review a book", 400));
  }

  const book = await getBookById(id);

  if (!book) {
    return next(new AppError("Book not found", 404));
  }

  book.reviews.push({ userId, comment });

  await book.save();

  res.status(200).json({
    status: "success",
    message: "Book reviewed successfully",
    data: {
      book,
    },
  });
});

// Collaborative writing aspect
// Add user as a collaborator to writing a book
const addBookCollaborator = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { collaboratorId, role } = req.body;

  if (!collaboratorId) {
    return next(new AppError("User ID for collaborator is required", 400));
  }

  const book = await getBookByIdAndAuthor(id, userId);

  if (!book) {
    return next(
      new AppError(
        "Book with the specified ID not found for the user (author)",
        404
      )
    );
  }

  const collaboratorExist = book.collaborators.filter((collaborator) => {
    return collaborator.user.equals(collaboratorId);
  });

  if (collaboratorExist.length > 0) {
    return next(new AppError("User is already a collaborator", 400));
  }

  book.collaborators.push({
    user: collaboratorId,
    role: role ? role : "editor",
  });

  await book.save();

  res.status(200).json({
    status: "success",
    message: "Collaborator added successfully",
    data: {
      book,
    },
  });
});

const editCollaboratorRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { collaboratorId, role } = req.body;

  if (!collaboratorId || !role) {
    return next(
      new AppError("User ID and role for collaborator is required", 400)
    );
  }

  const book = await getBookByIdAndAuthor(id, userId);

  if (!book) {
    return next(
      new AppError(
        "Book with the specified ID not found for the user (author)",
        404
      )
    );
  }

  const collaborator = book.collaborators.filter((collaborator) => {
    return collaborator.user.equals(collaboratorId);
  });

  if (collaborator.length === 0) {
    return next(new AppError("User is not a collaborator", 400));
  }

  if (collaborator[0].role === role) {
    return next(new AppError("User already has the specified role", 400));
  }

  collaborator[0].role = role;

  await book.save();

  res.status(200).json({
    status: "success",
    message: "Collaborator role updated successfully",
    data: {
      book,
    },
  });
});

const getAllCollaborators = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;

  const book = await getBookByIdAndAuthor(id, userId)
    .populate("collaborators.user")
    .select("-permissions -password -__v  -emailVerified -verificationToken");

  if (!book) {
    return next(
      new AppError(
        "Book with the specified ID not found for the user (author)",
        404
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Collaborators retrieved successfully",
    data: {
      collaborators: book.collaborators,
    },
  });
});

const removeCollaborator = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;
  const collaboratorId = req.body.collaboratorId;

  const book = await getBookByIdAndAuthor(id, userId);

  if (!book) {
    return next(
      new AppError(
        "Book with the specified ID not found for the user (author)",
        404
      )
    );
  }

  const collaborator = book.collaborators.filter((collaborator) => {
    return collaborator.user.equals(collaboratorId);
  });

  if (collaborator.length === 0) {
    return next(
      new AppError(
        "User with the specified id is is not a collaborator for this book",
        400
      )
    );
  }

  const newCollaborators = book.collaborators.filter(
    (collaborator) => !collaborator.user.equals(collaboratorId)
  );

  book.collaborators = newCollaborators;
  await book.save();

  res.status(200).json({
    status: "success",
    message: "Collaborator removed successfully",
    data: {
      book,
    },
  });
});

// Searching and filtering books
const searchForBookByTtileOrDescription = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  const books = await getBooksBasedOnQuery({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  });

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

module.exports = {
  createNewBook,
  addNewBookChapter,
  updateChapter,
  deleteChapter,
  getAllBooks,
  getAllBooksForAuthor,
  getBookDetails,
  getBookDetailsByAuthor,
  updateBookStatus,
  updateBookDetails,
  uploadBookCoverImage,
  userLikeBook,
  userUnlikeBook,
  userRateBook,
  userReviewBook,
  addBookCollaborator,
  editCollaboratorRole,
  getAllCollaborators,
  removeCollaborator,
  searchForBookByTtileOrDescription,
};
