const express = require("express");
const bookController = require("../controllers/book.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { multerUploads } = require("../utils/multer");
const router = express.Router();

router.get("/", bookController.getAllBooks);
router.get("/search", bookController.searchForBookByTtileOrDescription);
router.get("/:id", bookController.getBookDetails);

// Protected routes
router.use(authMiddleware.protectRoute, authMiddleware.checkIfEmailIsVerified);
// Author
router.post("/", multerUploads, bookController.createNewBook);
router.post("/author/chapter/:id", bookController.addNewBookChapter);
router.patch("/author/chapter/:id/:chapterId", bookController.updateChapter);
router.delete("/author/chapter/:id/:chapterId", bookController.deleteChapter);
router.get("/author/all", bookController.getAllBooksForAuthor);
router.get("/author/:id", bookController.getBookDetailsByAuthor);
router.patch("/author/:id", bookController.updateBookDetails);
router.patch("/author/status/:id", bookController.updateBookStatus);
router.post(
  "/author/cover-image/:id",
  multerUploads,
  bookController.uploadBookCoverImage
);
router.post("/author/collaborator/:id", bookController.addBookCollaborator);
router.patch("/author/collaborator/:id", bookController.editCollaboratorRole);
router.get("/author/collaborator/:id", bookController.getAllCollaborators);
router.delete("/author/collaborator/:id", bookController.removeCollaborator);

// Users
router.post("/like/:id", bookController.userLikeBook);
router.post("/unlike/:id", bookController.userUnlikeBook);
router.post("/rate/:id", bookController.userRateBook);
router.post("/review/:id", bookController.userReviewBook);
router.post("/read/:id", bookController.userReadBook);
router.post("/complete/:id", bookController.userCompleteBook);

module.exports = router;
