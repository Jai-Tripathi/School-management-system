const express = require("express");

const router = express.Router();

const classController = require("../controllers/class-controller");
const { adminRoleMiddleware, teacherOrAdminRoleMiddleware } = require("../middleware/check-auth");

// route to get all classes
router.get('/', adminRoleMiddleware, classController.getClasses);

// route to create a new class
router.post('/', adminRoleMiddleware, classController.createClass);

// route to get a class by ID
router.get('/:id', teacherOrAdminRoleMiddleware, classController.getClassById);

// route to update a class by ID
router.put('/:id', adminRoleMiddleware, classController.updateClass);

// route to delete a class by ID
router.delete('/:id', adminRoleMiddleware, classController.deleteClass);

module.exports = router;