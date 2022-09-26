var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    email: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
