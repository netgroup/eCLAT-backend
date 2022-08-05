var mongoose = require("mongoose");

var Schema = mongoose.Schema;

const PackageSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    url: { type: String, unique: true, required: true },
    version: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    // releases: [{ version: String, url: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", PackageSchema);
