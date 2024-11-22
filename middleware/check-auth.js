const jwt = require("jsonwebtoken");
const HttpError = require("./http-error");

const authMiddleware = (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            return next(new HttpError('No token, authentication failed!', 401));
        }

        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = { userId: decodedToken.userId, role: decodedToken.role }
        next();
    } catch (err) {
        return next(new HttpError('Authentication failed', 403));
    }
};

// Checking if the user is a teacher
const teacherRoleMiddleware = (req, res, next) => {
    if (req.userData && req.userData.role === "teacher") {
        next();
    } else {
        return next(new HttpError("Accessible only for teachers.", 403));
    }
};

// Checking if the user is an admin or not
const adminRoleMiddleware = (req, res, next) => {
    if (req.userData && req.userData.role === "admin") {
        next();
    } else {
        return next(new HttpError("Accessible only for admins.", 403));
    }
};

// Checking if the user is an admin/teacher or not
const teacherOrAdminRoleMiddleware = (req, res, next) => {
    if (req.userData && (req.userData.role === "admin" || req.user.role === "teacher")) {
        next();
    } else {
        return next(new HttpError("Accessible only for admins and teachers.", 403));
    }
};

module.exports = {
    authMiddleware,
    teacherRoleMiddleware,
    adminRoleMiddleware,
    teacherOrAdminRoleMiddleware,
};