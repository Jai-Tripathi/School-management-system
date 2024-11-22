const Student = require("../models/student");
const Class = require("../models/class");
const HttpError = require("../middleware/http-error");
const imageUpload = require('../utils/imageUpload');


const getStudents = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const classId = req.query.classId;

        const query = {};
        if (classId) {
            query.classId = classId;
        }

        const skip = (page - 1) * limit;
        const total = await Student.countDocuments(query);
        const students = await Student.find(query).skip(skip).limit(limit);

        res.json({ students, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        next(err);
    }
};


const getStudentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        let student = await Student.findOne({ _id: id, deleted: false });
        if (req.user && req.user.role === 'admin') {
            student = await Student.findOne({ _id: id });
        }

        if (!student) {
            return next(new HttpError('Student not found', 404));
        }

        res.json(student);
    } catch (err) {
        next(err);
    }
};

// Update a student by ID with image upload
const updateStudent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, classId } = req.body;

        if (!req.user) {
            return next(new HttpError('Authorization required', 401));
        }

        if (req.user.role === 'student' && req.user.id !== id) {
            return next(new HttpError('You are not authorized to update this student profile', 401));
        }

        const student = await Student.findById(id);
        if (!student) {
            return next(new HttpError('Student not found', 404));
        }

        // Handle classId update logic
        if (classId) {
            if (req.user.role !== 'admin') {
                return next(new HttpError('Access denied. Only admins can update the classId.', 403));
            }

            if (student.classId && student.classId !== classId) {
                const previousClass = await Class.findById(student.classId);
                if (previousClass) {
                    previousClass.studentCount = Math.max(0, (previousClass.studentCount || 1) - 1);
                    await previousClass.save();
                }
            }

            const classData = await Class.findById(classId);
            if (!classData) {
                return next(new HttpError('Class not found', 404));
            }

            classData.studentCount = (classData.studentCount || 0) + 1;
            await classData.save();
        }

        // Image upload logic
        let profileImageUrl = student.profileImageUrl; // Default to existing image
        if (req.file) {
            const uploadResult = await imageUpload(req.file.path);
            profileImageUrl = uploadResult.data.url;
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (classId) updateData.classId = classId;
        if (profileImageUrl) updateData.profileImageUrl = profileImageUrl;

        const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { new: true });

        res.json(updatedStudent);
    } catch (err) {
        next(err);
    }
};

// Soft-delete a student by ID
const deleteStudent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const student = await Student.findByIdAndUpdate(
            id,
            { deleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!student) {
            return next(new HttpError('Student not found', 404));
        }

        if (student.classId) {
            const classData = await Class.findById(student.classId);
            if (classData) {
                classData.studentCount = Math.max(0, (classData.studentCount || 1) - 1);
                await classData.save();
            }
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
};