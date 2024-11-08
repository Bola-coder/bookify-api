const { string } = require("joi");
const mongoose = require("mongoose");

// Chapter Schema
const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Chapter title is required"],
    },
    content: {
      type: String,
      required: [true, "Chapter content is required"],
    },
  },
  {
    timestamps: true,
  }
);

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
    default: "",
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: [true, "A book should have an author"],
  },

  chapters: [chapterSchema],

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
    default: null,
  },

  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },

  likes: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],

  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
    },
  ],

  reviews: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      comment: { type: String, trim: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  isFeatured: {
    type: Boolean,
    default: false,
  },

  readTime: {
    type: Number,
  },

  collaborators: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
      role: { type: String, enum: ["editor", "co-author"], default: "editor" },
    },
  ],
});

bookSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

const Books = new mongoose.model("Books", bookSchema);

module.exports = Books;
