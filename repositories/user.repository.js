const UserModel = require("../models/user.model");

const createNewUser = (values) => {
  return new UserModel(values).save().then((user) => user.toObject());
};

const getUsers = () =>
  UserModel.find({ active: true }).then((users) =>
    users.map((user) => user.toObject())
  );

const getUserById = (id) => UserModel.findById(id);

const getUserByEmail = (email) => UserModel.findOne({ email });

const getUserByFirstName = (firstName) =>
  UserModel.findOne({ firstName }).then((user) => user?.toObject());

const getUserByLastName = (lastName) =>
  UserModel.findOne({ lastName }).then((user) => user?.toObject());

const updateUserById = (id, values) =>
  UserModel.findByIdAndUpdate(id, values, {
    new: true,
    runValidators: true,
    select: "-password -__v",
  }).then((user) => user?.toObject());

const deleteUser = (id) => UserModel.findByIdAndDelete(id);

module.exports = {
  createNewUser,
  getUsers,
  getUserById,
  getUserByEmail,
  getUserByFirstName,
  getUserByLastName,
  updateUserById,
  deleteUser,
};
