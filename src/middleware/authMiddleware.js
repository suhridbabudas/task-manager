const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    const token = await req.header("Authorization").replace("Bearer ", "");
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({
      _id: decodedToken._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error("Unauthorized.");
    }
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({
      status: 0,
      error: e.message ? e.message : "Authentication failed.",
    });
  }
};

module.exports = authMiddleware;
