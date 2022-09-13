var mongoose = require("mongoose");

const ReleaseSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    version: { type: String, required: true },
    stato: {
      type: String,
      enum: ["not-verified", "verified", "suspended"],
      default: "non-verificato",
    },
    note: { type: String, required: true }, //es: correzione bug
  },
  {
    timestamps: {
      createdAt: "created_at",
    },
  }
);

module.exports = ReleaseSchema;
