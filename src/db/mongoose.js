const moogose = require("mongoose");

// creating connection to mongodb database
moogose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});
