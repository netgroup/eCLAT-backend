var mongoose = require("mongoose");

const ReleaseSchema = new mongoose.Schema(
  {
    version: { type: String, required: true },
    status: {
      type: String,
      enum: ["queue", "verified", "error"],
      default: "non-verificato",
    },
    note: { type: String }, //es: correzione bug
  },
  {
    timestamps: {
      createdAt: "created_at",
    },
  }
);

const Release = mongoose.model("Release", ReleaseSchema);

module.exports = Release;
