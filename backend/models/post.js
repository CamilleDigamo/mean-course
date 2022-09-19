const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  word: { type: String, required: true },
  definition: { type: String, required: true },
  partOfSpeech: { type: String, required: false },
  use: { type: String, required: false },
  imagePath: { type: String, require: false }
});

module.exports = mongoose.model("Post", postSchema);

// collection name will be posts in mongo
