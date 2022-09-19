const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const postsRoutes = require("./routes/post")
const userRoutes = require("./routes/user")

const app = express();

// testing the connection
mongoose
  .connect(
    "mongodb+srv://cumeel:AtIH54UJLSac6lxF@pooplatin.bhsynet.mongodb.net/poop-latin?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to the db!");
  })
  .catch(() => {
    console.log("Connection to db failed!");
  });

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false})); // we don't need this but bodyParser is capable of parsing different bodies
app.use("/images", express.static(path.join("backend/images"))); // make this folder statically accessible

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept" // allowing other headers if any others are set access will be blocked
  );
  res.setHeader(
    // control which http words can be used with these reqs
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
