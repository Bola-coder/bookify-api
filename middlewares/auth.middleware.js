const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { getUserById } = require("../repositories/user.repository");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// Protect route from unauthorised users function
const protectRoute = catchAsync(async (req, res, next) => {
  // const token = req.cookies.token;
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError(
        "You are currently not logged in. Please sign in to continue",
        401
      )
    );
  }

  // Verifying token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log("Error: ", error);
    return next(
      new AppError("Invalid token, please login again to get a new token", 401)
    );
  }

  // Checking if user still exists
  const id = decoded.id;
  const currentUser = await getUserById(id);
  if (!currentUser) {
    return next(
      new AppError("The user with the token does not exist anymore", 401)
    );
  }

  // Checking if user hasn't changed password since the token was last issued
  if (!currentUser.passwordChangedAfterTokenIssued(decoded.iat)) {
    return next(
      new AppError(
        "User password has been changed. Please login to get a new token"
      ),
      401
    );
  }

  req.user = currentUser;
  next();
});

const checkIfEmailIsVerified = catchAsync(async (req, res, next) => {
  const user = req.user;

  if (!user.emailVerified) {
    return next(
      new AppError(
        "Email has not been verified, Please verify your email address!",
        401
      )
    );
  }

  next();
});

module.exports = { protectRoute, checkIfEmailIsVerified };
