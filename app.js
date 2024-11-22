const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth-routes");
const classRoutes = require("./routes/class-routes");
const teacherRoutes = require("./routes/teacher-routes");
const studentRoutes = require("./routes/student-routes");
const { authMiddleware } = require("./middleware/check-auth");

const app = express();

app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/class", authMiddleware, classRoutes);
app.use("/api/teacher", authMiddleware, teacherRoutes);
//app.use("/api/student", studentRoutes);

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iqd1gnw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`).then(() => { app.listen(5000); }).catch(err => { console.log(err); });

