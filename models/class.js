const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const classSchema = new Schema({
    name: { type: String, required: true },
    studentCount: { type: Number, default: 0 },
    teacherId: { type: mongoose.Types.ObjectId, required: true, ref: "Teacher" },
    createdAt: { type: Date, default: Date.now }
});

classSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Class", classSchema);