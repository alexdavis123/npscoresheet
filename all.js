const express = require('express');

const ejs = require('ejs');

const app = express();
const port = 3000;

const { MongoClient } = require("mongodb");
// Set the view engine to EJS
app.set('view engine', 'ejs');
// Replace the uri string with your connection string.
const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);

async function run() {
  try {
    const database = client.db('test');
    const clients = database.collection('clients');


    // Find all documents in the collection and convert to an array
    const allClients = await clients.find({}).toArray();
    // Display the retrieved data
    console.log('All Clients:', allClients);

    app.get('/', (req, res) => {
      res.render('index', { allClients });
    });
 
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});