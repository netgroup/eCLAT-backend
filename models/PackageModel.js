var mongoose = require("mongoose");
const ReleaseSchema = require("./ReleaseModel");

var Schema = mongoose.Schema;

const PackageSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    releases: [ReleaseSchema],
  }
  //, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}}
);

module.exports = mongoose.model("Package", PackageSchema);
