const User = require("../models/User");

exports. professorDashboard = (req, res) => {
  res.json({
    message: "Welcome Professor",
    user: req.user
  });
}