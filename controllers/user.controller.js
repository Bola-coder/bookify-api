const {
  updateUserById,
  getUserById,
} = require("../repositories/user.repository");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { dataUri } = require("../utils/multer");
const { uploader } = require("../utils/cloudinary");
const filterObj = require("../utils/filterObj");

// Update User Profile Picture
const updateProfilePiture = catchAsync(async (req, res, next) => {
  console.log(req.file);
  const userID = req.user._id;
  if (!req.file) {
    return next(new AppError("Please upload an image", 404));
  }

  const file = dataUri(req).content;
  try {
    const result = await uploader.upload(file, {
      folder: "Synconference",
      use_filename: true,
    });

    const image = result.url;
    const user = await updateUserById(userID, { profileImage: image });
    return res.status(200).json({
      messge: "Your image has been uploded successfully to cloudinary",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      messge: "someting went wrong while processing your request",
      data: {
        err,
      },
    });
  }
});

// Get User Profile
const getProfile = catchAsync(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    status: "success",
    message: "User details retrieved successfully",
    data: {
      user,
    },
  });
});

// Update User Profile
const updateProfile = catchAsync(async (req, res, next) => {
  const userID = req.user._id;

  console.log(req.body);
  if (Object.keys(req.body).length === 0) {
    return next(new AppError("Please fill in fields to update", 404));
  }

  if (req.body.password) {
    return next(
      new AppError(
        "This route is not for password update, please use the correct route if you want to update passwordx",
        404
      )
    );
  }
  const allowedFields = filterObj(
    req.body,
    "firstname",
    "lastname",
    "phoneNumber"
  );

  const user = await updateUserById(userID, allowedFields);

  if (!user) {
    return next(new AppError("Failed to update user details", 404));
  }

  res.status(200).json({
    status: "success",
    message: "User details updated successfully",
    data: {
      user,
    },
  });
});

// Update User Password
const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError("Please provide the current and new password", 404)
    );
  }
  const user = await getUserById(req.user._id).select("+password");
  console.log(await user.confirmPassword(currentPassword, user.password));
  if (!(await user.confirmPassword(currentPassword, user.password))) {
    return next(new AppError("Current password supplied is wrong!!!", 404));
  }

  user.password = newPassword;
  // THe password will be hashed by the pre save middleware in the user

  await user.save();
  res.status(200).json({
    status: "success",
    message: "Password updated successfully!",
  });
});

module.exports = {
  updateProfilePiture,
  getProfile,
  updateProfile,
  updatePassword,
};
