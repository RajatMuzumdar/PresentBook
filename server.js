const cors = require("cors");
const express = require("express");
const multer = require("multer"); 
const userRoutes = require("./routes/users");
const { loadModels } = require("./faceAPI/faceai.js"); 
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" }); 
app.use(upload.single("image")); 

app.use("/users", userRoutes);

// MongoDB connection via mongoose
const mongoose = require("mongoose");

const server = "127.0.0.1:27017";
const database = "loginUser";

const store = new MongoDBStore({
  uri: `mongodb://${server}/${database}`,
  collection: "sessions",
});

app.use(
  session({
    secret: "77172",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
    store: store,
  })
);

class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose
      .connect(`mongodb://${server}/${database}`)
      .then(() => {
        console.log("Database connection successful");
      })
      .catch((err) => {
        console.error("Database connection failed");
      });
  }
}

module.exports = new Database();

const modelDir = __dirname + "/faceAPI/models";

async function startServer() {
  await loadModels(modelDir); // Wait for the models to load
  app.listen(5000, () => console.log("Server started on port 5000"));
}

startServer().catch(console.error);
