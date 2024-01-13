
<<<<<<< HEAD
const express = require('express');
const ejs = require('ejs');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const { databaseConnectionMiddleware, closeConnection, getDatabase, getClient } = require('./db');



const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');

// Add this middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Set Templating Engine
app.use(expressLayouts);
app.set('layout', './layouts/full-width');
app.set('view engine', 'ejs');

// Middleware to use the layout
//app.use(expressLayouts);

app.use(express.static('public'));
// Set the view engine to EJS
app.set('view engine', 'ejs');
// Apply the middleware to connect to the database before handling any requests
app.use(databaseConnectionMiddleware);
// Replace the uri string with your connection string.
// const uri = 'mongodb://localhost:27017/test';
// const client = new MongoClient(uri);
// const database = client.db('test');
const database = getClient().db('test');
const clients = database.collection('clients');
const tombaughTMTA = database.collection('TombaughTMTA');
const conversion = database.collection('conversion');
const waisem =  database.collection('waissem');
// const query = { Name: 'haha', TestNum: 1 };



app.get('/thankyou', (req, res) => {
  res.render('thankyou',{ title: 'Thank You'});
});

app.get('/rcioutput', (req, res) => {
  res.render('rcioutput',{ title: 'RCI'});
});

app.get('/getrci', (req, res) => {
  res.render('getrci',{ title: 'Get RCI'});
});

app.get('/about', (req, res) => {
  res.render('about',{ title: 'About'});
});

app.get('/', (req, res) => {
  res.render('index', { title: 'Home Page'});
});


const insertdataArray = [
  ["BVMT-R", "Trial 1","","","readonly","readonly","Memory"],
  ["BVMT-R", "Trial 2","","","readonly","readonly","Memory"],
  ["BVMT-R", "Trial 3","","","readonly","readonly", "Memory"],
  ["BVMT-R", "Total","readonly","","readonly","readonly", "Memory"],
  ["BVMT-R", "Copy","","readonly","readonly","readonly", "Memory"],
  ["BVMT-R", "DR","readonly","","readonly","readonly","Memory"],
  ["HVLT-R", "Trial 1","","","readonly","readonly","Memory"],
  ["HVLT-R", "Trial 2","","","readonly","readonly","Memory"],
  ["HVLT-R", "Trial 3","","","readonly","readonly","Memory"],
  ["HVLT-R", "Total","readonly","","readonly","readonly","Memory"],
  ["HVLT-R", "DR","readonly","","readonly","readonly","Memory"],
  ["HVLT-R", "Retention%","readonly","","readonly","readonly","Memory"],
  ["WMS-IV", "LM-I","readonly","readonly","readonly","","Memory"],
  ["WMS-IV", "LM-II","readonly","readonly","readonly","","Memory"],
  ["WAIS-DS", "Total","readonly","readonly","readonly","","Attention"],
  ["WAIS-DS", "DSF","readonly","readonly","readonly","","Attention"],
  ["WAIS-DS", "DSB","readonly","readonly","readonly","","Attention"],
  ["WAIS-DS", "DSS","readonly","readonly","readonly","","Attention"],
  ["TMTA", "","readonly","","readonly","readonly","Processing Speed"],
  ["TMTB", "","readonly","","readonly","readonly","Executive"],
  ["NAB", "Naming","readonly","","readonly","readonly","Language"],
  ["FAS", "","readonly","","readonly","readonly","Language"],
  ["Animal", "","readonly","","readonly","readonly","Language"],
  ["WCST", "Total Errors","readonly","readonly","","readonly","Executive"],
  ["WCST", "Perseverative Responses","readonly","readonly","","readonly","Executive"],
  ["WCST", "Perseverative Errors","readonly","readonly","","readonly","Executive"],
  ["WCST", "Nonperseverative Errors","readonly","readonly","","readonly","Executive"],
  ["WCST", "Conceptual Level Responses","readonly","readonly","","readonly","Executive"],
];



app.get('/insert', (req, res) => {
  res.render('dynamicinsert', { insertdataArray,title:'dynamicinsert'});
});

// app.get('/insert', (req, res) => {
//   res.render('dynamicinsert', { title: 'Submit Data'});
// });

// Middleware to connect to the database
app.use(databaseConnectionMiddleware);




async function getCOMPAREScores(clientid, testNum, subtest, measure, scoretype) {
 // await connectToDatabase(); 
  console.log('getcomparescores input',clientid,testNum,subtest,measure,scoretype);
  const compareNum1 = await clients.findOne({ $and: [{ Name: clientid }, { TestNum: 1}, { Subtest: subtest }, { Measure: measure }] });
  console.log('compareNum1 ',compareNum1);
  const compareNum2 = await clients.findOne({ $and: [{ Name: clientid }, { TestNum: 2}, { Subtest: subtest }, { Measure: measure }] });
  console.log('get scores from clients table',compareNum1,compareNum2);
  const score1 = compareNum1.ScaledScore;
  const score2 = compareNum2.ScaledScore;
  console.log('scores 1 and 2',score1,score2);
  return { score1: score1, score2: score2 };
}

async function getRCIs(clientid, age) {
  let rcisArray = [];

  try {
   // await connectToDatabase(); 
    //const query = { age: 79 };
    const semRows = await waisem.find({ age: Number(age) }).toArray();

    console.log('age',age,semRows);
    for (const row of semRows) {
      const test = row.test;
      const sem = row.sem;

      let compareScores;
      if (test === 'DS') {
        const sedDS = 1.96 * Math.sqrt(2 * sem ** 2);
        compareScores = await getCOMPAREScores(clientid, 1, 'Total', 'WAIS-DS','ScaledScore');
        const rciDS = (compareScores.score2 - compareScores.score1)/sedDS;
        console.log('compareScores',compareScores);

        rcisArray.push({ measure:'WAIS-DS',subtest: 'Total', ...compareScores, diff: compareScores.score2 - compareScores.score1, sed: sedDS, rci: rciDS });
      } else if (test === 'DSF') {
        const sedDSF = 1.96 * Math.sqrt(2 * sem ** 2);
        compareScores = await getCOMPAREScores(clientid, 1, 'DSF', 'WAIS-DS','ScaledScore');
        const rciDSF = (compareScores.score2 - compareScores.score1)/sedDSF;
        console.log('compareScores',compareScores);

        rcisArray.push({ measure: 'WAIS-DS', subtest: 'DSF', ...compareScores, diff: compareScores.score2 - compareScores.score1, sed: sedDSF, rci:rciDSF });
      }
    }
    console.log('rcisArray at getRCIs',rcisArray);
    return rcisArray;
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    //await client.close();
  }
}


async function rearrangeData(query) {

  try {
   // await client.connect();
  //  console.log('Connected to MongoDB');


    // Use MongoDB aggregation pipeline to reshape the data
    const rearrangedData = await clients.aggregate([
    { 
        $match: query // Optional: use $match to filter data
      },
      {
        $group: {
          _id: '$Measure',
          data: {
            $push: {
              Subtest: '$Subtest',
              Raw: '$Raw',
              T: '$T',
              StandardScore: '$StandardScore',
              ScaledScore: '$ScaledScore',
              Domain:'$Domain',
            },
          },
        },
      },
      ]).toArray();

    console.log('Rearranged data:', rearrangedData);

    return rearrangedData;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    //await client.close();
   //console.log('Connection closed');
  }
}


function getDataForTargets(rearrangedData, targetMeasures) {
  const result = {};

  for (const targetMeasure of targetMeasures) {
    const targetMeasureData = rearrangedData.find(item => item._id === targetMeasure);

    if (targetMeasureData) {
      result[targetMeasure] = targetMeasureData.data;
    } else {
      console.log(`No data found for ${targetMeasure}`);
    }
  }

  return result;
}

async function getUniqueMeasureNames(query) {

  try {
    //await client.connect();
   // console.log('Connected to MongoDB');

    // Use MongoDB find and toArray to convert the cursor to an array
    const resultArray = await clients.find(query).toArray();
    // Use distinct on the array to get unique measure names
    const uniqueMeasureNames = [...new Set(resultArray.map(item => item.Measure))];

    console.log('Unique Measure Names:', uniqueMeasureNames);
    return uniqueMeasureNames;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  } finally {
    //await client.close();
    //console.log('Connection closed');
  }
}

// Example usage:
async function processTSSArray(resultInputArray,clientId,testNum) {
 // const resultsArray = [];
  //await connectToDatabase(); // Ensure the connection is established
  console.log('resultinputarray',resultInputArray);
  const inputObject=resultInputArray;

  try {
   for (const measureName in inputObject) {
    if (inputObject.hasOwnProperty(measureName)) {
      const subtests = inputObject[measureName];

    // Iterate through each subtest within the measure
      for (const subtest of subtests) {
        console.log(`Measure: ${measureName}, Subtest: ${subtest.Subtest}`);

      // Access other properties based on the subtest type
        if (subtest.T) {
          console.log('subtest T',subtest.T);
          const queryConversionT = { T: subtest.T};
          try {
          //await connectToDatabase();
            const resultConversionT = await conversion.findOne(queryConversionT);
            console.log('result conversion T',resultConversionT);

            subtest.PR = resultConversionT.PR;
            subtest.Descriptor = resultConversionT.Descriptor;

          //console.log('subtests',subtest);

          } catch (error) {
            console.error('Error querying conversion:', error);
          }
        }
        if (subtest.Raw) {
          console.log(`Raw: ${subtest.Raw}`);
          // const { resultTMTA, calculateTMTAZ, resultConversionZ } = await calculateTMTAZAndResult(
          //   clientId,
          //   testNum,
          //   tombaughTMTA,
          //   conversion,);
          // subtest.PR = resultConversionZ[0].PR;
          // subtest.Descriptor = resultConversionZ[0].Descriptor;
          // subtest.Z= resultConversionZ[0].Z;
          // subtest.T= resultConversionZ[0].T;
          // console.log('convert Z',resultConversionZ[0]);

        }
        if (subtest.StandardScore) {
          console.log(`StandardScore: ${subtest.StandardScore}`);
          const queryConversion = { StandardScore: subtest.StandardScore};
          try {
          //await connectToDatabase();
            const resultConversion = await conversion.findOne(queryConversion);
            console.log('result conversion StandardScore',resultConversion);
            subtest.T = resultConversion.T;
            subtest.PR = resultConversion.PR;
            subtest.Descriptor = resultConversion.Descriptor;

          //console.log('subtests',subtest);

          } catch (error) {
            console.error('Error querying conversion:', error);
          }

        }
        if (subtest.ScaledScore) {
          console.log(`ScaledScore: ${subtest.ScaledScore}`);
          const queryConversion = { ScaledScore: subtest.ScaledScore};
          try {
          //await connectToDatabase();
            const resultConversion = await conversion.findOne(queryConversion);
            console.log('result conversion ScaledScore',resultConversion);
            subtest.T = resultConversion.T;
            subtest.PR = resultConversion.PR;
            subtest.Descriptor = resultConversion.Descriptor;

          //console.log('subtests',subtest);

          } catch (error) {
            console.error('Error querying conversion:', error);
          }
        }

      // Add your logic for each subtest here
      }
    }
  }
} finally {
    // Ensure to close the client after processing
 // await client.close();
}

return resultInputArray;
}


async function calculateResultConversionZ(conversion, calculateTMTAZ) {
  const resultConversionZ = await conversion
  .aggregate([
  {
    $addFields: {
      difference: { $abs: { $subtract: ['$Z', calculateTMTAZ] } },
    },
  },
  {
    $sort: { difference: 1 },
  },
  {
    $limit: 1,
  },
  ])
  .toArray();

  return resultConversionZ;
}


async function calculateTMTAZAndResult(clientId, testNum, tombaughTMTA, conversion) {
  try {
    // Query for TMTA

    const queryTMTA = { $and: [{ Measure: 'TMTA' }, {Name:clientId},{TestNum: Number(testNum)}] };
    console.log('TMTA query',queryTMTA );
    const resultTMTA = await clients.find(queryTMTA).toArray();    
    console.log('result tmta',resultTMTA );

    const tmtaRaw = resultTMTA[0].Raw;
    const clientAge = resultTMTA[0].Age;
    const clientEducation = resultTMTA[0].Education;

    // Query TombaughTMTA based on Age and Education
    const queryTombaughTMTA = {
      Age: clientAge,
      Education: clientEducation > 12 ? '>12' : '<12',
    };

    const resultTombaughTMTA = await tombaughTMTA.find(queryTombaughTMTA).toArray();
    console.log(`Education: ${clientEducation > 12 ? '>12' : '<12'}`);

    console.log(tmtaRaw);
    console.log('Tombaugh',queryTombaughTMTA);

    let calculateTMTAZ = 0;
    if (tmtaRaw < resultTombaughTMTA[0].Mean) {
      calculateTMTAZ = (tmtaRaw - resultTombaughTMTA[0].Mean) / resultTombaughTMTA[0].SD;
      console.log('raw < mean');
    } else {
      calculateTMTAZ = (resultTombaughTMTA[0].Mean - tmtaRaw) / resultTombaughTMTA[0].SD;
      console.log('raw > mean');
    }

    // Find descriptor from Z
    const resultConversionZ = await calculateResultConversionZ(conversion, calculateTMTAZ);

    // Return the results
    return { resultTMTA, calculateTMTAZ, resultConversionZ };
  } catch (error) {
    console.error('Error:', error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  }
}



const submissionSchema = new mongoose.Schema({
      Name: String,
      Sex: String,
      Age: Number,
      Education: Number,
      Race: String,
      TestNum: Number,
      Measure: String,
      Subtest: String,
      Raw: Number,
      T: Number,
      StandardScore: Number,
      ScaledScore: Number,
      Domain: String,
    });
const Submission = mongoose.model('Submission', submissionSchema, 'clients');
//Submission.create(dataToInsert);

// Handle form submission
app.post('/submit', async (req, res) => {
 //console.log('Received form data:', req.body);
  try {
    //await connectToDatabase(); 
    // const uri = 'mongodb://localhost:27017/test';
    // mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    console.log('sumission sch',Submission);
  // Extract common fields from the request body
    const { Name, Sex, Education, Age, Race, TestNum} = req.body;
    // Create two separate documents
    //const parseNumber = (value) => (isNaN(value) || value === '') ? null : parseInt(value);

 // Iterate through each row in the request body
    for (const rowData of req.body.rows) {
      // Combine common fields with row-specific data
      const data = rowData;

      
      // Insert data into MongoDB
      await Submission.create(data);
      console.log('submit data',data);
    }

    res.send('Data submitted successfully!!!');
  } catch (error) {
    console.error('Error submitting data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/process', async (req, res) => {
  console.log('post to process');

  try {
    const clientId = req.body.clientId;
    const testNum = req.body.testNum;
    //console.log('get client id', testNum );
    const query = { Name: clientId, TestNum: Number(testNum)};
    console.log('find client', query  );
    // Use findOne to find a single document that matches the query
    const result = await clients.findOne(query);
    console.log('find name age',result);

    const rearrangedData = await rearrangeData(query);

    const uniqueMeasureNamesResult = await getUniqueMeasureNames(query);

    const targetMeasuresToRetrieve = uniqueMeasureNamesResult;
    const resultData = getDataForTargets(rearrangedData, targetMeasuresToRetrieve);
    const resultsTSS = await processTSSArray(resultData,clientId,testNum);
    const testlistArray  = Object.fromEntries( 
      Object.entries(resultsTSS ).map(([key, value]) => [key,value.filter(item => item.T !== null)]));
    console.log('testlist',testlistArray);
   
    // Function to filter items with T not null
    const filterItemsWithTNotNull = (array) => array.filter(item => item.T !== null);

    // Apply the function to each array in the data
    const resultNotNull = {};
    Object.entries(resultsTSS).forEach(([key, value]) => {
      resultNotNull[key] = filterItemsWithTNotNull(value);
    });

   console.log('resultNotNull', resultNotNull);

    // Format output
    let outputArray = {
      Client: clientId,
      ClientAge: result.Age,
      TSS: resultNotNull,
    };

    // Render the results
    res.render('dynamicoutput', { outputArray, title: 'Client Result' });
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // No need to close the client here since it's already closed in the try block
  }
});



app.post('/processrci', async (req, res) => {
  console.log('post to rci process');

   try {
        const clientId = req.body.clientid;
        const age = req.body.age;
        console.log('req',clientId,age);
        const rcisArray = await getRCIs(clientId, age);
        const outputArray = rcisArray.map(item => ({ ...item, client: clientId }));
        console.log('ouputArray at processrci',outputArray);
        res.render('rcioutput', { outputArray, title: 'RCI Result'});

   } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // No need to close the client here since it's already closed in the try block
  }

});

// Middleware to close the database connection when the application exits
process.on('exit', closeConnection);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
=======
>>>>>>> c5fb1e4a4e25efd4c82cdc7e9fd2a735bbfd1a47
