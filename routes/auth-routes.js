const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const authController = require("../controllers/auth-controller");

router.post("/signup",
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 })
    ],
    authController.signup);

router.post("/login", authController.login);



module.exports = router;