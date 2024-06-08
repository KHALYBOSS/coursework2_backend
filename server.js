const express = require('express');
const { MongoClient, ObjectID } = require('mongodb');

const app = express();

app.use(express.json());
app.set('port', 3000);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  next();
});

const uri = 'mongodb+srv://khalyboss198:newapppassword@cluster0.cbevbiq.mongodb.net/';
let db;

async function connectToDB() {
  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    db = client.db('webstore');
    console.log('Successfully connected to MongoDB!');
  } catch (err) {
    console.error('Database connection failed. - Error:', err);
    process.exit(1);
  }
}

connectToDB();

app.get('/', (req, res) => {
  res.send('Select a collection, e.g., /collection/messages');
});

app.param('collectionName', (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  next();
});

app.get('/collection/:collectionName', async (req, res, next) => {
  try {
    const results = await req.collection.find({}).toArray();
    res.json(results);
  } catch (e) {
    next(e);
  }
});

app.post('/collection/:collectionName', async (req, res, next) => {
  try {
    const result = await req.collection.insertOne(req.body);
    res.json(result.ops);
  } catch (e) {
    next(e);
  }
});

app.get('/collection/:collectionName/:id', async (req, res, next) => {
  try {
    const result = await req.collection.findOne({ _id: new ObjectID(req.params.id) });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

app.put('/collection/:collectionName/:id', async (req, res, next) => {
  try {
    const result = await req.collection.updateOne(
      { _id: new ObjectID(req.params.id) },
      { $set: req.body },
      { safe: true, multi: false }
    );
    res.json(result.matchedCount === 1 ? { msg: 'success' } : { msg: 'error' });
  } catch (e) {
    next(e);
  }
});

app.delete('/collection/:collectionName/:id', async (req, res, next) => {
  try {
    const result = await req.collection.deleteOne({ _id: new ObjectID(req.params.id) });
    res.json(result.deletedCount === 1 ? { msg: 'success' } : { msg: 'error' });
  } catch (e) {
    next(e);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(3000, () => {
  console.log('listening on port 3000');
});
