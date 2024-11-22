const Teacher = require("../models/teacher");
const HttpError = require("../middleware/http-error");
const imageUpload = require("../utils/imageUpload");


const getTeachers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const skip = (page - 1) * limit;
        const total = await Teacher.countDocuments();
        const teachers = await Teacher.find().skip(skip).limit(limit);

        res.json({ teachers, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        return next(new HttpError("Couldn't get teachers", 500));
    }
};

const getTeacherById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!req.user) {
            return next(new HttpError('Authorization required', 401));
        }

        if (req.user.role === 'teacher' && req.user.id !== id) {
            return next(new HttpError('You are not authorized to view this teacher profile', 401));
        }

        let teacher = await Teacher.findOne({ _id: id, deleted: false });
        if (req.user.role === 'admin') {
            teacher = await Teacher.findOne({ _id: id });
        }

        if (!teacher) {
            return next(new HttpError('Teacher not found', 404));
        }

        res.json(teacher);
    } catch (err) {
        next(err);
    }
};

const updateTeacher = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, subject, profileImageUrl } = req.body;

        if (!req.user) {
            return next(new HttpError('Authorization required', 401));
        }

        if (req.user.role === 'teacher' && req.user.id !== id) {
            return next(new HttpError('You are not authorized to update this teacher profile', 401));
        }

        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return next(new HttpError('Teacher not found', 404));
        }

        if (subject && req.user && req.user.role !== 'admin') {
            return next(new HttpError('Access denied. Only admins can update the subject.', 403));
        }
        // Check if an image is being uploaded
        if (req.file) {
            const uploadResult = await imageUpload(req.file.path); // Call the utility function
            profileImageUrl = uploadResult.data.url; // Extract the Cloudinary URL
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (subject) updateData.subject = subject;
        if (profileImageUrl) updateData.profileImageUrl = profileImageUrl;

        const updatedTeacher = await Teacher.findByIdAndUpdate(id, updateData, { new: true });

        res.json(updatedTeacher);
    } catch (err) {
        next(err);
    }
};

const deleteTeacher = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deletedTeacher = await Teacher.findByIdAndUpdate(
            id,
            { deleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!deletedTeacher) {
            return next(new AppError('Teacher not found', 404));
        }

        res.json({ message: 'Teacher deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher
}