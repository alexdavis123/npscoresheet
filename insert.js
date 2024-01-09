const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const app = express();
app.use(expressLayouts);
app.set('layout', './layouts/full-width');
app.set('view engine', 'ejs');
const port = 3000;
const ejs = require('ejs');
// Replace 'your_database_name' and 'your_collection_name' with your actual database name and collection name.
const uri = 'mongodb://localhost:27017/your_database_name';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware to parse JSON and handle form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Set the view engine to EJS
app.set('view engine', 'ejs');
// Serve static files (e.g., your HTML form)
app.use(express.static('public'));

// Create a mongoose schema
const submissionSchema = new mongoose.Schema({
  name: String,
  sex: String,
  age: Number,
  education: Number,
  race: String,
  testNum: Number,
  measure: String,
  subtest: String,
  raw: Number,
  t: Number,
  standardScore: Number,
  scaledScore: Number,
});

// Create a mongoose model
const Submission = mongoose.model('Submission', submissionSchema, 'your_collection_name');

// Handle form submission
app.post('/submit', async (req, res) => {
 //console.log('Received form data:', req.body);
try {
  // Extract common fields from the request body
    const { name, sex, education, age, testNum} = req.body;
    // Create two separate documents
   const parseNumber = (value) => (isNaN(value) || value === '') ? null : parseInt(value);

  // Iterate through each row in the request body
    for (const rowData of req.body.rows) {
      // Combine common fields with row-specific data
      const data = rowData;

      
      // Insert data into MongoDB
      await Submission.create(data);
      console.log('submit data',data);
    }


    // // Insert data into MongoDB
    // await Submission.create([dataTotal, dataDR]);

    res.send('Data submitted successfully!');
  } catch (error) {
    console.error('Error submitting data:', error);
    res.status(500).send('Internal Server Error');
  }
});
// Serve a simple form
app.get('/insert', (req, res) => {
      res.render('insert',{title:'insert'});
    });
// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
