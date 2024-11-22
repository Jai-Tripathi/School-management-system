const express = require("express");
const router = express.Router();

const upload = require("../middleware/multer");
const teacherController = require("../controllers/teacher-controller");

const { adminRoleMiddleware, teacherOrAdminRoleMiddleware } = require("../middleware/check-auth");

//router.post("/upload", upload.single("image"), teacherController.imageUpload)
// route to get all teachers
router.get('/', adminRoleMiddleware, teacherController.getTeachers);

// route to get a teacher by ID
router.get('/:id', teacherOrAdminRoleMiddleware, teacherController.getTeacherById);

// route to update a teacher by ID
router.put('/:id', upload.single("image"), teacherOrAdminRoleMiddleware, teacherController.updateTeacher);

// route to delete a teacher by ID
router.delete('/:id', adminRoleMiddleware, teacherController.deleteTeacher);

module.exports = router;