const express = require("express");
const router = express.Router();
const collectionController = require("./../controllers/collection.controller");
const authMiddleware = require("./../middlewares/auth.middleware");

router
  .route("/")
  .post(authMiddleware.protectRoute, collectionController.createNewCollection)
  .get(authMiddleware.protectRoute, collectionController.getAllCollections);

router
  .route("/add-book")
  .post(authMiddleware.protectRoute, collectionController.addBookToACollection);

router
  .route("/remove-book")
  .patch(
    authMiddleware.protectRoute,
    collectionController.removeBookFromACollection
  );

router
  .route("/:id")
  .get(authMiddleware.protectRoute, collectionController.getColletionDetails)
  .patch(
    authMiddleware.protectRoute,
    collectionController.updateCollectionDetails
  )
  .delete(authMiddleware.protectRoute, collectionController.removeCollection);

module.exports = router;
