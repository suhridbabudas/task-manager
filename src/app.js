require("./db/mongoose");
const express = require("express");
const app = express();
const userRoutes = require("./routers/userRoute");
const taskRoutes = require("./routers/taskRoute");

app.use(express.json());
app.use(userRoutes);
app.use(taskRoutes);

module.exports = app