const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const { multerUploads } = require("../utils/multer");
const router = express.Router();

router.use(authMiddleware.protectRoute);

router.patch(
  "/profile-image",
  multerUploads,
  userController.updateProfilePiture
);

router
  .route("/profile")
  .get(userController.getProfile)
  .patch(userController.updateProfile);

router.route("/update-password").patch(userController.updatePassword);

module.exports = router;
