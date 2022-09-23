var mongoose = require("mongoose");
const ReleaseSchema = require("./ReleaseModel").schema;

var Schema = mongoose.Schema;

const PackageSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    author: { type: String, required: true },
    git_url: { type: String, required: true },
    tag: { type: String, required: true },
    description: { type: String, required: true },
    programs: { type: Object, default: {} },
    releases: [ReleaseSchema],
    downloads: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Package", PackageSchema);
