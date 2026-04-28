const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      default: '익명',
    },
    images: [
      {
        filename: String,
        originalname: String,
        url: String,
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
postSchema.index({ title: 'text' });

module.exports = mongoose.model('Post', postSchema);
