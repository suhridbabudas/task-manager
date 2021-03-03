require("./db/mongoose");
const express = require("express");
const app = express();
const userRoutes = require("./routers/userRoute");
const taskRoutes = require("./routers/taskRoute");

const port = process.env.PORT;

app.use(express.json());
app.use(userRoutes);
app.use(taskRoutes);

app.listen(port, () => {
  console.log(`Server is listening to port: ${port}`);
});
