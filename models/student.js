const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const studentSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 6 },
    role: { type: String, default: "student" },
    image: { type: String },
    classId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Class" },
    createdAt: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
});

studentSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Student", studentSchema);