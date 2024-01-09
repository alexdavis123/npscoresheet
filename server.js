const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a MongoDB schema
const itemSchema = new mongoose.Schema({
  domain: String,
  test: String,
  raw: String,
  client: String,
  date: Date,
  // Add other fields as needed
});

// Define a MongoDB model based on the schema
const Item = mongoose.model('Item', itemSchema);

// Set up Express to use EJS as the view engine
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  try {
    // Fetch data from MongoDB collection 'clients'
    const data = await Item.find();
    console.log('Retrieved Data:', data);

    // Render the data using the EJS template
    res.render('index', { data });
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Start the Express server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
