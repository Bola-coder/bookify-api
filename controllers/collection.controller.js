const AppError = require("./../utils/AppError");
const catchAsync = require("./../utils/catchAsync");
const {
  createCollection,
  getCollections,
  getCollectionById,
  getUserCollectionById,
  updateCollection,
  deleteCollection,
} = require("./../repositories/collection.repository");
const { getBookById } = require("./../repositories/book.repository");

const createBookmarkCollection = async (userId) => {
  try {
    const data = {
      title: "Bookmarks",
      description: "The default bookmark collection",
      user: userId,
      deletable: false,
    };
    const collection = await createCollection(data);
    return collection;
  } catch (error) {
    return new AppError("Collection not created", 400);
  }
};

const createNewCollection = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { title, description } = req.body;
  const data = { title, description, user: userId };
  const collection = await createCollection(data);

  if (!collection) {
    return next(new AppError("Collection not created", 400));
  }

  res.status(201).json({
    status: "success",
    message: "Collection created successfully",
    data: {
      collection,
    },
  });
});

const getAllCollections = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const collections = await getCollections(userId).populate("books");

  if (!collections) {
    return next(new AppError("Collections not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Collections retrieved successfully",
    result: collections.length,
    data: {
      collections,
    },
  });
});

const addBookToACollection = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { collectionId, bookId } = req.body;

  if (!collectionId || !bookId) {
    return next(
      new AppError("Please provide the collection id and the book id")
    );
  }

  console.log(collectionId, userId, bookId);

  const collection = await getUserCollectionById(collectionId, userId);

  if (!collection) {
    return next(
      new AppError("Collection with the specified ID not found", 404)
    );
  }

  const book = await getBookById(bookId);

  if (!book) {
    return next(
      new AppError("Book with the specified ID not found found", 404)
    );
  }

  const bookExistsInCollection = collection.books.includes(bookId);

  if (bookExistsInCollection) {
    return next(
      new AppError(
        `Book ${book.title} already exists in collection ${collection.title}`,
        400
      )
    );
  }

  collection.books.push(bookId);
  await updateCollection(collectionId, collection).populate("books");

  res.status(200).json({
    status: "success",
    message: "Book added to collection successfully",
    data: {
      collection,
    },
  });
});

const removeBookFromACollection = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { collectionId, bookId } = req.body;

  if (!collectionId || !bookId) {
    return next(
      new AppError("Please provide the collection id and the book id")
    );
  }

  const collection = await getUserCollectionById(collectionId, userId);

  if (!collection) {
    return next(
      new AppError("Collection with the specified ID not found", 404)
    );
  }

  const book = await getBookById(bookId);

  if (!book) {
    return next(
      new AppError("Book with the specified ID not found found", 404)
    );
  }

  const bookExistsInCollection = collection.books.includes(bookId);

  if (!bookExistsInCollection) {
    return next(
      new AppError(
        `Book ${book.title} does not exist in collection ${collection.title}`,
        400
      )
    );
  }

  collection.books = collection.books.filter((id) => !id.equals(bookId));
  console.log(collection.books);
  await updateCollection(collectionId, collection).populate("books");

  res.status(200).json({
    status: "success",
    message: "Book removed from collection successfully",
    data: {
      collection,
    },
  });
});

const getColletionDetails = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  if (!id) {
    return next(new AppError("Please provide the collection id"));
  }

  const collection = await getUserCollectionById(id, userId).populate("books");

  if (!collection) {
    return next(
      new AppError("Collection with the specified ID not found", 404)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Colletion details retreived successfully",
    data: {
      collection,
    },
  });
});

const updateCollectionDetails = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, description } = req.body;

  if (!id) {
    return next(new AppError("Please provide the collection id"));
  }

  if (!title && !description) {
    return next(
      new AppError("Please provide the title or description to update")
    );
  }

  if (!id) {
    return next(new AppError("Please provide the collection id"));
  }

  const collection = await getUserCollectionById(id, userId);

  if (!collection) {
    return next(
      new AppError("Collection with the specified ID not found", 404)
    );
  }

  const updatedCollection = await updateCollection(id, { title, description });

  res.status(200).json({
    status: "success",
    message: "Collection updated successfully",
    data: {
      collection: updatedCollection,
    },
  });
});

const emptyCollection = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  if (!id) {
    return next(new AppError("Please provide the collection id"));
  }

  const collection = await getUserCollectionById(id, userId);

  if (!collection) {
    return next(
      new AppError("Collection with the specified ID not found", 404)
    );
  }

  if (collection.books.length === 0) {
    return next(new AppError("Collection is already empty", 400));
  }

  collection.books = [];
  await updateCollection(id, collection).populate("books");

  res.status(200).json({
    status: "success",
    message: "Collection emptied successfully",
    data: {
      collection,
    },
  });
});

const removeCollection = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  if (!id) {
    return next(new AppError("Please provide the collection id"));
  }

  const collection = await getUserCollectionById(id, userId);

  if (!collection) {
    return next(
      new AppError("Collection with the specified ID not found", 404)
    );
  }

  if (!collection.deletable) {
    return next(
      new AppError("You are not allowed to delete this collection", 400)
    );
  }

  if (collection.books.length > 0) {
    return next(
      new AppError(
        "Collection has books. Remove all books from collection before deleting collection",
        400
      )
    );
  }

  await deleteCollection(id);

  res.status(200).json({
    status: "success",
    message: "Collection deleted successfully",
    data: null,
  });
});

module.exports = {
  createBookmarkCollection,
  createNewCollection,
  getAllCollections,
  addBookToACollection,
  removeBookFromACollection,
  getColletionDetails,
  updateCollectionDetails,
  emptyCollection,
  removeCollection,
};
