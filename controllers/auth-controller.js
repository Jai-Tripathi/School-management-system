const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Admin = require("../models/admin");
const Class = require("../models/class");

const HttpError = require("../middleware/http-error");


const signup = async (req, res, next) => {
    const { email, password, name, role, subject, classId } = req.body;

    const existingStudent = await Student.findOne({ email });
    const existingTeacher = await Teacher.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });

    if (existingStudent || existingTeacher || existingAdmin) {
        return next(new HttpError("An account with this email already exists", 400));
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12)
    } catch (err) {
        return next(new HttpError("Failed to hash password", 500));
    };

    if (role === "student") {
        if (!classId) {
            return next(new HttpError("Class ID is required for students", 400));
        }

        const classData = await Class.findById(classId);
        if (!classData) {
            return next(new HttpError("Class not found with the provided ID", 404));
        }

        const session = await Student.startSession();
        session.startTransaction();

        try {
            const newStudent = new Student({ email, password: hashedPassword, name, classId, role });
            await newStudent.save({ session });

            // Increment student count in class
            await Class.findByIdAndUpdate(classId, { $inc: { studentCount: 1 } }, { session });

            await session.commitTransaction();
            session.endSession();

            return res.status(201).json(newStudent);
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            return next(new HttpError("Failed to register student", 500));
        }
    } else if (role === "teacher") {
        if (!subject) {
            return next(new HttpError("Subject is required for teachers", 400));
        }

        const newTeacher = new Teacher({ email, password: hashedPassword, name, subject, role });
        await newTeacher.save();
        return res.status(201).json(newTeacher);
    } else {
        const newAdmin = new Admin({ email, password: hashedPassword, name, role });
        await newAdmin.save();
        return res.status(201).json(newAdmin);
    }
};

const login = async (req, res, next) => {
    const { email, password, role } = req.body;

    let existingUser;
    switch (role) {
        case "student":
            existingUser = await Student.findOne({ email });
            break;
        case "teacher":
            existingUser = await Teacher.findOne({ email });
            break;
        case "admin":
            existingUser = await Admin.findOne({ email });
            break;
        default:
            return next(new HttpError("Invalid role specified", 400));
    }

    if (!existingUser) {
        return next(new HttpError("Invalid credentials", 400));
    }

    let isValidPassword;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        return next(new HttpError('Could not log you in, please check your credentials and try again.', 500));
    }

    if (!isValidPassword) {
        return next(new HttpError("Invalid credentials", 400));
    }

    let token;
    try {
        token = jwt.sign({ userId: existingUser.id, role: existingUser.role }, process.env.JWT_KEY, { expiresIn: "1h" });
    } catch (err) {
        console.log(err);
        return next(new HttpError('Logging in failed, please try again later.', 500));
    }
    res.status(200).json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token
    });
};

module.exports = {
    signup,
    login,
};
