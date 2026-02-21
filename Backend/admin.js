require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error(err));

(async () => {
  const exists = await User.findOne({ email: "admin@gmail.com" });

  if (exists) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    email: "admin@gmail.com",
    password: hashedPassword,
    role: "admin"
  });

  console.log("Admin created successfully");
  process.exit();
})();
