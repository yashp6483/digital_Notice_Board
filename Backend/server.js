const express = require('express');
const cors = require('cors');
const connectDb = require('./config/db');
const http = require("http");

const app = express();
const server = http.createServer(app);
require('dotenv').config();

const { Server } = require("socket.io");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Database Connection
connectDb();

app.use(cors());
app.use(express.json());

// socket io connection
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 🔥 MAKE IO AVAILABLE IN CONTROLLERS
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 🔥 SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// 🔥 INITIALIZE NOTICE CRON JOB
require("./cron/noticeCron")(io);

// admin routes
app.use("/admin", require("./Routes/adminRoutes"));

// professor routes
app.use("/admin", require("./Routes/professorRoutes"));

// notice routes
app.use("/admin", require("./Routes/noticeRoutes"));
app.use("/professor", require("./Routes/noticeRoutes"));
app.use("/", require("./Routes/noticeRoutes"));

//forgot route 
app.use("/", require("./Routes/auth"));

// port listening
server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});