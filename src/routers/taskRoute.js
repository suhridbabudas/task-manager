const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/tasks", authMiddleware, async (req, res) => {
  // const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send({
      status: 1,
      task,
      message: "Saved successfully",
    });
  } catch (e) {
    res.status(400).send({
      status: 0,
      error: e,
    });
  }
});

router.get("/tasks", authMiddleware, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const sortVal = req.query.sortBy.split(":");
    sort[sortVal[0]] = sortVal[1] === "asc" || sortVal[1] === "false" ? 1 : -1;
  }

  try {
    // const tasks = await Task.find({});
    // const tasks = await Task.find({ owner: req.user._id });
    // ----- using populate -----
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        },
      })
      .execPopulate();
    const tasks = req.user.tasks;
    if (!tasks.length) {
      return res.status(404).send({
        status: 1,
        tasks,
        message: "Task collection is empty.",
      });
    }
    // ----- using populate -----
    // res.status(200).send({
    //   status: 1,
    //   tasks: req.user.tasks,
    // });
    res.status(200).send({
      status: 1,
      tasks,
    });
  } catch (e) {
    res.status(500).send({
      status: 0,
      error: e.message,
    });
  }
});

router.get("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    // const task = await Task.findById(req.params.id);
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send({
        status: 1,
        task,
        message: "No task found",
      });
    }
    res.status(200).send({
      status: 1,
      task,
    });
  } catch (e) {
    res.status(500).send({
      status: 0,
      error: e,
    });
  }
});

router.patch("/tasks/:id", authMiddleware, async (req, res) => {
  const allowToUpdate = ["description", "completed"];
  let updates = Object.keys(req.body);
  let isAllowed = updates.every((update) => allowToUpdate.includes(update));

  if (!isAllowed) {
    return res.status(400).send({
      status: 0,
      allowToUpdate,
      userRequest: updates,
      message: "Invalid field.",
    });
  }
  try {
    // const task = await Task.findById(req.params.id);
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send({
        status: 1,
        message: "Taks not found.",
      });
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    const updatedTask = await task.save();
    res.status(200).send({
      status: 1,
      updatedTask,
      message: "Updated successfully",
    });
  } catch (e) {
    res.status(400).send({
      status: 0,
      error: e,
    });
  }
});

router.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    // const task = await Task.findByIdAndDelete(req.params.id);
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send({
        status: 1,
        message: "No task found",
      });
    }
    res.status(200).send({
      status: 1,
      task,
      message: "Deleted successfully",
    });
  } catch (e) {
    res.status(500).send({
      status: 0,
      error: e,
    });
  }
});

module.exports = router;
