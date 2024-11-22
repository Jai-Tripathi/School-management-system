const express = require("express");
const router = express.Router();

const studentRoutes = require("../controllers/student-controller");
const { adminRoleMiddleware } = require("../middleware/check-auth");


// route to get all students
router.get('/', adminRoleMiddleware, studentRoutes.getStudents);

// route to get a student by ID
router.get('/:id', studentRoutes.getStudentById);

// route to update a student by ID
router.put('/:id', studentRoutes.updateStudent);

// route to delete a student by ID
router.delete('/:id', adminRoleMiddleware, studentRoutes.deleteStudent);

module.exports = router;