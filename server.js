const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();

// Config Express.js
app.use(express.json());
app.use(cors());

// MongoDB connection
let db;
const uri = "mongodb+srv://khalyboss198:newapppassword@cluster0.cbevbiq.mongodb.net/webstore";

async function connectToDB() {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db("webstore");
    console.log("Successfully connected to MongoDB!");
  } catch (e) {
    console.error("Database connection failed. - Error:" + e);
    process.exit(1);
  }
}

connectToDB();

// Logger Middleware
app.use((req, res, next) => {
  var log = `${req.ip} -- ${req.method} ${req.path} ${res.statusCode}"`;
  console.log(log, req.body);
  next();
});

app.get("/", (req, res) => {
  res.send("Select a collection, e.g., /collection/lessons");
});

// Retrieve all objects from a collection
app.get("/collection/:collectionName", async (req, res) => {
  try {
    const results = await db.collection(req.params.collectionName).find({}).toArray();
    res.send(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while retrieving the collection.");
  }
});

// Search in lessons collection
app.post("/search/collection/lessons", async (req, res) => {
  try {
    let search = req.body.search || "";
    const sort = req.body.sort || "title";
    const order = req.body.order === "desc" ? -1 : 1;

    const query = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ],
    };

    const results = await db.collection("lessons").find(query).sort({ [sort]: order }).toArray();
    res.send(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while searching the lessons.");
  }
});

// Insert a document into a collection
app.post("/collection/:collectionName", async (req, res) => {
  try {
    const result = await db.collection(req.params.collectionName).insertOne(req.body);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while inserting the document.");
  }
});

// Get a document by ID
app.get("/collection/:collectionName/:id", async (req, res) => {
  try {
    const result = await db.collection(req.params.collectionName).findOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while retrieving the document.");
  }
});

// Update a document by ID
app.put("/collection/:collectionName/:id", async (req, res) => {
  try {
    const result = await db.collection(req.params.collectionName).updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating the document.");
  }
});

// Delete a document by ID
app.delete("/collection/:collectionName/:id", async (req, res) => {
  try {
    const result = await db.collection(req.params.collectionName).deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while deleting the document.");
  }
});

// Setting app port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express.js server running at PORT ${PORT}`);
});
