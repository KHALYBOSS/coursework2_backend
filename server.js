// Import dependencies modules:
const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");

// Create an Express.js instance:
const app = express();

// Config Express.js
app.use(express.json());
app.set('port', 3000); // Update to match the listening port

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  next();
});

// MongoDB URI
const uri = 'mongodb+srv://khalyboss198:newapppassword@cluster0.cbevbiq.mongodb.net/';
let db;

// Connect to MongoDB and start the server
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db('Coursework2');
    console.log("Connected to MongoDB");

    // Start the server only after successful connection
    app.listen(3000, () => {
      console.log("Express.js server running at PORT 3000");
    });
  })
  .catch(error => {
    console.error("Failed to connect to MongoDB", error);
  });

// Logger Middleware
app.use((req, res, next) => {
  var log = `${req.ip} -- ${req.method} ${req.path} ${res.statusCode}`;
  console.log(log, req.body);
  next();
});

app.get("/", (req, res) => {
  res.send("Select a collection, e.g., /collection/lessons");
});

// Retrieve all objects from a collection
app.get("/collection/:collectionName", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .find({})
      .toArray()
      .then(results => {
        res.send(results);
      })
      .catch(error => {
        res.status(500).send({ error: error.message });
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Search
app.post("/search/collection/lessons/", (req, res) => {
  try {
    let search = req.body.search;
    let sort = req.body.sort || "title";
    let order = req.body.order === "desc" ? -1 : 1;

    if (search) {
      search = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      };
    } else {
      search = {};
    }

    db.collection("lessons")
      .find(search)
      .sort({ [sort]: order })
      .toArray()
      .then(results => {
        res.send(results);
      })
      .catch(error => {
        res.status(500).send({ error: error.message });
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Insert a document into the collection
app.post("/collection/:collectionName", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .insertOne(req.body)
      .then(results => {
        res.send(results);
      })
      .catch(error => {
        res.status(500).send({ error: error.message });
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Retrieve a document by ID
app.get("/collection/:collectionName/:id", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .findOne({ _id: new ObjectId(req.params.id) })
      .then(results => {
        res.send(results);
      })
      .catch(error => {
        res.status(500).send({ error: error.message });
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update a document by ID
app.put("/collection/:collectionName/:id", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body })
      .then(results => {
        res.send(results);
      })
      .catch(error => {
        res.status(500).send({ error: error.message });
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Delete a document by ID
app.delete("/collection/:collectionName/:id", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then(results => {
        res.send(results);
      })
      .catch(error => {
        res.status(500).send({ error: error.message });
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});