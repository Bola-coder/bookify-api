const {
  createNewUser,
  getUserByEmail,
  updateUserById,
} = require("../repositories/user.repository");
const {
  validateUserLogin,
  validateUserSignup,
} = require("../validations/user.validation");
const { signJWTToken } = require("../utils/jwt");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { compareEncryptedString } = require("../utils/encryption");
const {
  createVerificationTokenAndSendToEmail,
} = require("../utils/createVerificationToken");

// Signup function
const signup = catchAsync(async (req, res, next) => {
  const { firstname, lastname, phoneNumber, email, password } = req.body;

  // Validating the request body
  const validation = validateUserSignup({
    firstname,
    lastname,
    email,
    password,
    phoneNumber,
  });

  if (validation.error) {
    return next(new AppError(validation.error.message, 404));
  }
  // Check if the user already exists exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return next(
      new AppError("User with the specified email address already exists", 404)
    );
  }

  const newUser = await createNewUser({
    firstname,
    lastname,
    phoneNumber,
    email,
    password,
  });

  if (!newUser) {
    return next(new AppError("Failed to create new user", 404));
  }

  // Hash the verification token and save to the user data in the database
  const hashedVerificationToken = createVerificationTokenAndSendToEmail(
    req,
    newUser
  );

  const user = await updateUserById(newUser._id, {
    verificationToken: hashedVerificationToken,
  });

  const token = signJWTToken(newUser._id);
  res.status(200).json({
    status: "success",
    token,
    data: user,
  });
});

// Login function
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validating the request body
  const validation = validateUserLogin({ email, password });
  if (validation.error) {
    return next(new AppError(validation.error.message, 404));
  }

  // Fetching user from db based on email
  const user = await getUserByEmail(email).select("+password");
  // console.log(user);

  //   Checking if user exist and if password is the same with the hashed one
  if (!user || !(await user.confirmPassword(password, user.password))) {
    console.log("Can it be this?");
    return next(new AppError("Invalid email or password!"));
  }

  const token = signJWTToken(user._id);
  res.status(200).json({
    status: "success",
    token,
    data: user,
  });
});

// Resend Verification email
const resendEmailVerificationToken = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  // Check if user with email exist
  const user = await getUserByEmail(email).select("+verificationToken");
  if (!user) {
    return next(
      new AppError("User with the specified email address does not exist", 404)
    );
  }

  if (user.emailVerified) {
    return next(new AppError("User has already been verified", 404));
  }

  // Send the verification email to the user
  const hashedVerificationToken = createVerificationTokenAndSendToEmail(
    req,
    user
  );

  // stored a hashed version of the token in the database
  const updatedUser = await updateUserById(user._id, {
    verificationToken: hashedVerificationToken,
  });

  res.status(200).json({
    status: "success",
    message: "Verification link has been resent to your email address",
  });
});

// Verify User Email
const verifyUserEmail = catchAsync(async (req, res, next) => {
  const { email, verification_token } = req.params;
  // Check if user with email exist
  const user = await getUserByEmail(email).select("+verificationToken");
  if (!user) {
    return next(
      new AppError("User with the specified email address does not exist", 404)
    );
  }

  // Checks if the user is already verified
  if (user.emailVerified) {
    return next(new AppError("User has already been verified", 404));
  }

  // Checks if the verificationToken in the request params matches the encrypted on in the Db
  if (
    !(await compareEncryptedString(verification_token, user.verificationToken))
  ) {
    return next(new AppError("Invalid verification token", 404));
  }

  // Update the user's verification status
  const verifiedUser = await updateUserById(
    user._id,
    {
      emailVerified: true,
      verificationToken: null,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "User's email verified successfully",
    user: verifiedUser,
  });
});

// Logout function
const logout = async (req, res) => {
  res
    .clearCookie("token")
    .status(200)
    .json({ message: "Successfully logged out " });
};

module.exports = {
  signup,
  login,
  resendEmailVerificationToken,
  verifyUserEmail,
  logout,
};
