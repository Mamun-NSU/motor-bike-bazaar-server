const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.get("/", (req, res) => {
  res.send("Running the NODE server");
});

// use middleware
app.use(cors());
app.use(express.json());

// warehousebduser1
// Afg7GM5EJiWWE8YD

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' });
    }
    console.log('decoded', decoded);
    req.decoded = decoded;
    next();
  })
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sc4os.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// client.connect((err) => {
//   const collection = client.db("test").collection("devices");
//   console.log("DB connected");
//   // perform actions on the collection object
//   client.close();
// });

async function run() {
  try {
    await client.connect();
    const productsCollection = client.db("warehouse").collection("products");
    const itemsCollection = client.db("warehouse").collection("items");


    // AUTH
    app.post('/login', async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d'
      });
      res.send({ accessToken });
    });

    // After solving the problem

    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });

    // POST
    app.post("/products", verifyJWT, async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    // This is test
    // DELETE
    app.delete("/products/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    //Items collections APIs

    app.get("/items", async (req, res) => {
      const user_email = req.query.email;

      // console.log(req.query);
      let query = {};
      if (user_email) {
        query = { user_email: user_email };
      }

      const cursor = itemsCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    // app.get("/items", async (req, res) => {
    //   const query = {};
    //   const cursor = itemsCollection.find(query);
    //   const items = await cursor.toArray();
    //   res.send(items);
    // });

    app.post("/items", async (req, res) => {
      const item = req.body;
      const result = await itemsCollection.insertOne(item);
      res.send(result);
    });
    //Updated for Heroku API testing

    // DELETE one Item
    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log("NODE server is running");
});
