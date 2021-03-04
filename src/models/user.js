const moogose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = new moogose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email!");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      hide: true,
      trim: true,
      validate(value) {
        if (value.toLocaleLowerCase().includes("password")) {
          throw new Error(
            'Password minimum length is 6, and should not include "password"'
          );
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age can't be negative.");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

// creating a virtual for mongoose to understand relationship
// between task and user.
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

// JWT generation and saving
userSchema.methods.generateJwt = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7 day",
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// find user by email and logging in by matching password
userSchema.statics.findByUserCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error(
      JSON.stringify({
        error: 404,
        message: "User not found.",
      })
    );
  }
  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    throw new Error(
      JSON.stringify({
        error: 400,
        message: "Invalid email or password",
      })
    );
  }

  return user;
};

// Hasing password by bcrypt
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// delete task when user is deleted
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = moogose.model("User", userSchema);

module.exports = User;
