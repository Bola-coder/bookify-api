const express = require("express");
const bookController = require("../controllers/book.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookDetails);

// Protected routes
router.use(authMiddleware.protectRoute, authMiddleware.checkIfEmailIsVerified);
// Author
router.post("/", bookController.createNewBook);
router.post("/author/chapter/:id", bookController.addNewBookChapter);
router.patch("/author/chapter/:id/:chapterId", bookController.updateChapter);
router.delete("/author/chapter/:id/:chapterId", bookController.deleteChapter);
router.get("/author/all", bookController.getAllBooksForAuthor);
router.get("/author/:id", bookController.getBookDetailsByAuthor);
router.patch("/author/:id", bookController.updateBookDetails);
router.patch("/author/status/:id", bookController.updateBookStatus);

// Users
router.post("/like/:id", bookController.userLikeBook);
router.post("/unlike/:id", bookController.userUnlikeBook);
router.post("/rate/:id", bookController.userRateBook);
router.post("/review/:id", bookController.userReviewBook);

module.exports = router;
