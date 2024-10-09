const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");

const authcontroller = require("../controllers/auth.controller");

const router = express.Router();

router.route("/register").post(authcontroller.signup);
router.route("/login").post(authcontroller.login);
router
  .route("/verify/:email/:verification_token")
  .get(authcontroller.verifyUserEmail);
router.post("/verify/resend/", authcontroller.resendEmailVerificationToken);
router.get("/logout", authMiddleware.protectRoute, authcontroller.logout);

module.exports = router;
