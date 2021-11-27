const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5rymw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("Database Connection is Ok");
    const database = client.db("foodieDB");
    const servicesCollection = database.collection("services");
    const orderCollection = database.collection("orders");

    // GET API (get/load all services)
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    // GET API (get/load all orders)
    // app.get("/orders", async (req, res) => {
    //   const cursorNew = orderCollection.find({});
    //   const orders = await cursorNew.toArray();
    //   res.send(orders);
    // });

    // GET API (get/load all orders)
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log("email is :", email);
      console.log("query is :", query);
      console.log(req);
      console.log(req.complete);
      let cursor;
      if (req.complete === false) {
        cursor = orderCollection.find(query);
      } else {
        cursor = orderCollection.find({});
      }
      const orders = await cursor.toArray();
      res.json(orders);
    });

    // delete a order from the order collection (My Orders)
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });

    // update an order status if it's not approved yet (Manage Orders)
    app.put("/orders/:id", async (req, res) => {
      const order = req.body;
      // console.log(req.body);
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updateDoc = { $set: order };
      const result = await orderCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // GET Single Service Details
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.json(service);
    });

    // POST API (Add a Service to the Database)
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.json(result);
    });

    // Add Orders API (POST)
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Foodie server is running");
});

app.listen(port, () => {
  console.log("Server running at port:", port);
});
