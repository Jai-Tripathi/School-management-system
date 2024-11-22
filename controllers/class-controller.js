const Class = require("../models/class");
const HttpError = require("../middleware/http-error");

// Create a new class
const createClass = async (req, res, next) => {
    try {
        const { name, teacherId, studentCount } = req.body;

        if (!name) {
            return next(new HttpError('Class name cannot be empty', 400));
        }

        const lowerCaseName = name.toLowerCase();
        const existingClass = await Class.findOne({ name: lowerCaseName });
        if (existingClass) {
            return next(new HttpError('Class name already exists, including the deleted classes', 400));
        }

        const newClass = new Class({ name: lowerCaseName, teacherId, studentCount });
        await newClass.save();
        res.status(201).json(newClass);
    } catch (error) {
        return next(new HttpError("Failed to create Class", 500));
    }
};

// Get all classes with pagination
const getClasses = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const total = await Class.countDocuments();
        const classes = await Class.find().skip(skip).limit(limit);

        res.status(200).json({ classes, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        return next(new HttpError("Failed to get Classes", 500));
    }
};

// Get a class by ID
const getClassById = async (req, res, next) => {
    try {
        const { id } = req.params;

        let classData = await Class.findOne({ _id: id, deleted: false });
        if (req.user && req.user.role === 'admin') {
            classData = await Class.findOne({ _id: id });
        }

        if (!classData) {
            return next(new HttpError('Class not found', 404));
        }

        res.status(200).json(classData);
    } catch (error) {
        return next(new HttpError("Failed to get the Class", 500));
    }
};

// Update a class by ID
const updateClass = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, teacherId, studentCount } = req.body;

        if (name && !isValidName(name)) {
            return next(new HttpError('Class name cannot be empty', 400));
        }

        const updatedClass = await Class.findByIdAndUpdate(id, { name, teacherId, studentCount }, { new: true });
        if (!updatedClass) {
            return next(new HttpError('Class not found', 404));
        }

        res.status(200).json(updatedClass);
    } catch (error) {
        return next(new HttpError("Failed to update class", 500));
    }
};

// Delete a class by ID
const deleteClass = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deletedClass = await Class.findByIdAndDelete(id);
        if (!deletedClass) {
            return next(new HttpError('Class not found', 404));
        }

        res.status(200).json({ message: 'Class deleted' });
    } catch (error) {
        return next(new HttpError("Failed to delete class", 500));
    }
};

module.exports = {
    createClass,
    getClasses,
    getClassById,
    updateClass,
    deleteClass
}