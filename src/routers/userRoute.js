const express = require("express");
const multer = require("multer");
const router = express.Router();
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");
const sharp = require("sharp");
const {sendWelcomeMail, sendGoodbyeMail} = require("../emails/account");

const upload = multer({
  limits: {
    fileSize: 2000000,
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
      return callback(new Error("File format is not supported."));
    }
    callback(undefined, true);
  },
});

router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const token = await user.generateJwt();
    await user.save();
    sendWelcomeMail(user.email, user.name);
    res.status(201).send({
      status: 1,
      user,
      token,
      message: "Saved successfully",
    });
  } catch (e) {
    res.status(400).send({
      status: 0,
      error: e.message,
      message: "Saving failed",
    });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByUserCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateJwt();
    res.status(200).send({
      status: 1,
      user,
      token,
      message: "Login successfull.",
    });
  } catch (e) {
    res.status(400).send({
      status: 0,
      error: e.message,
    });
  }
});

router.post("/users/logout", authMiddleware, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.status(200).send({
      status: 1,
      message: "Successfully logout.",
    });
  } catch (e) {
    res.status(500).send({
      status: 0,
      error: e,
      message: "Logout unsuccessfull.",
    });
  }
});

router.post("/users/logout-all", authMiddleware, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send({
      status: 1,
      message: "Successfully logout from all devices.",
    });
  } catch (e) {
    res.status(500).send({
      status: 0,
      error: e,
      message: "Logout unsuccessfull.",
    });
  }
});

router.get("/users/profile", authMiddleware, async (req, res) => {
  res.status(200).send({
    status: 1,
    user: req.user,
  });
  // try {
  //   const users = await User.find({});
  //   if (!users.length) {
  //     return res.status(404).send({
  //       status: 1,
  //       users,
  //       message: "User collection is empty.",
  //     });
  //   }
  //   res.status(200).send({
  //     status: 1,
  //     users,
  //   });
  // } catch (e) {
  //   res.status(500).send({
  //     status: 0,
  //     error: e,
  //   });
  // }
});

// router.get("/users/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).send({
//         status: 1,
//         user,
//         message: "No user found",
//       });
//     }
//     res.status(200).send({
//       status: 1,
//       user,
//     });
//   } catch (e) {
//     res.status(500).send({
//       status: 0,
//       error: e,
//     });
//   }
// });

router.patch("/users/update-profile", authMiddleware, async (req, res) => {
  const allowToUpdate = ["name", "age", "email", "password"];
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
    // const user = await User.findById(req.params.id);
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    // if (!user) {
    //   return res.status(404).send({
    //     status: 1,
    //     message: "User not found.",
    //   });
    // }
    updates.forEach((update) => (req.user[update] = req.body[update]));
    const updatedUser = await user.save();
    res.status(200).send({
      status: 1,
      updatedUser,
      message: "Profile updated successfully",
    });
  } catch (e) {
    res.status(400).send({
      status: 0,
      error: e.message,
    });
  }
});

router.delete("/users/delete-profile", authMiddleware, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.params.id);
    // if (!user) {
    //   return res.status(404).send({
    //     status: 1,
    //     message: "No user found",
    //   });
    // }
    await req.user.remove();
    sendGoodbyeMail(req.user.email, req.user.name)
    res.status(200).send({
      status: 1,
      user: req.user,
      message: "Profile deleted successfully",
    });
  } catch (e) {
    res.status(500).send({
      status: 0,
      error: e.message,
    });
  }
});

router.post(
  "/users/profile/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    // req.user.avatar = req.file.buffer;
    req.user.avatar = buffer;
    await req.user.save();
    res.send({
      status: 1,
      message: "Avatar changed successfully.",
    });
  },
  (error, req, res, next) => {
    res.status(400).send({
      status: 0,
      message: error.message,
    });
  }
);

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error("Unable to fetch avatar.");
    }
    res.set("Content-Type", "image/png");
    res.status(200).send(user.avatar);
  } catch (e) {
    res.status(200).send({
      status: 0,
      message: e.message,
    });
  }
});

router.delete(
  "/users/profile/delete-avatar",
  authMiddleware,
  async (req, res) => {
    try {
      req.user.avatar = undefined;
      await req.user.save();
      res.status(200).send({
        status: 1,
        message: "Avatar deleted successfully.",
      });
    } catch (e) {
      res.status(500).send({
        status: 0,
        message: e.message,
      });
    }
  }
);

module.exports = router;
