const { string } = require("joi");
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Book title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Book description is required"],
  },
  summary: {
    type: String,
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: [true, "A book should have an author"],
  },

  content: {
    type: String,
    required: [true, "Book content is required"],
  },

  tags: {
    type: [String],
  },

  genres: {
    type: [String],
  },

  coverImage: {
    type: String,
    default: "",
  },

  publicationDate: {
    type: Date,
  },

  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },

  likes: {
    type: Number,
    default: 0,
  },

  ratings: {
    type: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
      },
    ],
  },

  reviews: {
    type: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },

  isFeatured: {
    type: Boolean,
    default: false,
  },

  readTime: {
    type: Number,
  },
});

const Books = new mongoose.model("Books", bookSchema);

module.exports = Books;
