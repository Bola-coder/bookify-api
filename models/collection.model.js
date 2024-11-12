const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Collection title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Collection description is required"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "A collection should have an user"],
    },

    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Books",
      },
    ],

    deletable: {
      type: Boolean,
      default: true,
    },

    coverImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Collections = mongoose.model("Collections", collectionSchema);

module.exports = Collections;
