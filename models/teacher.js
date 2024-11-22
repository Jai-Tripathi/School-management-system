const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const teacherSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 6 },
    role: { type: String, default: "teacher" },
    image: { type: String },
    subject: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
});

teacherSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Teacher", teacherSchema);