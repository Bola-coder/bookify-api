const Collections = require("../models/collection.model");

const createCollection = (values) => {
  return new Collections(values).save();
};

const getCollections = (userId) => Collections.find({ user: userId });

const getCollectionById = (id) => Collections.findById(id);

const getUserCollectionById = (id, userId) =>
  Collections.findOne({ _id: id, user: userId });

const updateCollection = (id, values) =>
  Collections.findByIdAndUpdate(id, values, {
    new: true,
    runValidators: true,
  });

const deleteCollection = (id) => Collections.findByIdAndDelete(id);

module.exports = {
  createCollection,
  getCollections,
  getCollectionById,
  getUserCollectionById,
  updateCollection,
  deleteCollection,
};
