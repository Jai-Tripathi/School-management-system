const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const adminSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 6 },
    role: { type: String, default: "admin" },
    createdAt: { type: Date, default: Date.now }
});

adminSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Admin", adminSchema);