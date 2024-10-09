const express = require("express");
const bookController = require("../controllers/book.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookDetails);

// Protected routes
router.use(authMiddleware.protectRoute, authMiddleware.checkIfEmailIsVerified);
router.post("/", bookController.createNewBook);
router.get("/author/all", bookController.getAllBooksForAuthor);
router.get("/author/:id", bookController.getBookDetailsByAuthor);
router.patch("/author/status/:id", bookController.updateBookStatus);

module.exports = router;
