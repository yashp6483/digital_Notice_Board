const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require('./models/User');
const connectDb = require('./config/db');
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Database Connection
connectDb();

const SECRET_KEY = process.env.JWT_SECRET;
app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const role = (req.body.role || "").toString().trim().toLowerCase();

  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  }

  const user = await User.findOne({ email });
  // console.log("USER FOUND:", user);

  if (!user) {
    return res.status(401).json({ message: "Invalid email" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid Password" });
  }

  if (user.role !== role) {
    return res.status(403).json({ message: "Selected role does not match account role" });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({ token, name: user.name, role: user.role });
});

// admin routes
app.use("/admin", require("./Routes/adminRoutes"));

// professor routes
app.use("/admin",require("./Routes/professorRoutes"));

// notice routes
app.use("/admin", require("./Routes/noticeRoutes"));
app.use("/professor",require("./Routes/noticeRoutes"));

//forgot route 
app.use("/",require("./Routes/auth"));

// port listening
app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
})

