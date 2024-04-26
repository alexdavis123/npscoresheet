
//const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 3000;
//const port = 3000;
const express = require('express');
const ejs = require('ejs');
//const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const app = express();
const { tukeyhsd } = require('stats-analysis');
const jStat = require('jstat');

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
const testnamesCollection = database.collection('testnames');
const clients = database.collection('clients');
const tombaughTMTA = database.collection('TombaughTMTA');
const conversion = database.collection('conversion');
const waisem =  database.collection('waissem');
// const query = { Name: 'haha', TestNum: 1 };

const Mpop = 50; // Population mean
const SDpop = 10; // Population standard deviation

app.get('/thankyou', (req, res) => {
  res.render('thankyou',{ title: 'Thank You'});
});

app.get('/rcioutput', (req, res) => {
  res.render('rcioutput',{ title: 'RCI'});
});



app.get('/about', (req, res) => {
  res.render('about',{ title: 'About'});
});

app.get('/', (req, res) => {
  res.render('index', { title: 'Home Page'});
});

app.get('/faq', (req, res) => {
  res.render('faq', { title: 'FAQ'});
});

app.get('/uploadpdf', (req, res) => {
  res.render('uploadpdf.ejs', { title: 'Process PDF'});
});
const getSEMArray = [

  ["BVMT-R", "Total",""],
  ["HVLT-R", "Total",""],
  ["WAIS-DS", "Total",""],
  ["TMTA", "",""],
  ["TMTB", "",""],
  ["COWAT", "",""],
  ["ANT", "",""],
  ["WCST", "Total Errors",""],
  ["ROCF", "",""],
  ]

app.get('/getrci', (req, res) => {
  res.render('getrci',{ getSEMArray, title: 'Get RCI'});
});

const insertdataArray = [
  ["HVLT-R", "Trial 1","","","readonly","readonly","readonly","Verbal Memory","verbal list learning trial 1"],
  ["HVLT-R", "Trial 2","","","readonly","readonly","readonly","Verbal Memory","verbal list learning trial 2"],
  ["HVLT-R", "Trial 3","","","readonly","readonly","readonly","Verbal Memory","verbal list learning trial 3"],
  ["HVLT-R", "Total","readonly","","readonly","readonly","readonly","Verbal Memory","verbal list learning"],
  ["HVLT-R", "DR","readonly","","readonly","readonly","readonly","Verbal Memory","verbal recall after a delay"],
  ["HVLT-R", "Retention%","readonly","","readonly","readonly","readonly","Verbal Memory","learning retention"],

  ["BVMT-R", "Trial 1","","","readonly","readonly","readonly","Visual Memory","visual learning trial 1"],
  ["BVMT-R", "Trial 2","","","readonly","readonly","readonly","Visual Memory","visual learning trial 2"],
  ["BVMT-R", "Trial 3","","","readonly","readonly","readonly", "Visual Memory","visual learning trial 3"],
  ["BVMT-R", "Total","","","readonly","readonly","readonly", "Visual Memory","visual learning"],
  ["BVMT-R", "Learning","","","readonly","readonly","readonly", "Visual Memory","visual learning"],
  ["BVMT-R", "DR","","","readonly","readonly","readonly","Visual Memory","visual delayed recall"],
  ["BVMT-R", "Copy","","readonly","readonly","readonly","","Visuospatial","copying simple figures"],
  
  ["WMS-IV", "LM-I","readonly","readonly","readonly","","readonly","Verbal Memory","story memory 1"],
  ["WMS-IV", "LM-II","readonly","readonly","readonly","","readonly","Verbal Memory","story memory 2"],
  ["CVLT-III", "Trials","readonly","readonly","","readonly","readonly","Verbal Memory","verbal list learning"],
  ["CVLT-III", "Delayed Recall","readonly","readonly","","readonly","readonly","Verbal Memory","recalling the same list of words after a delay"],
  ["CVLT-III", "Total Recall","readonly","readonly","","readonly","readonly","Verbal Memory","total recall"],
 
  ["RCFT", "Immediate","readonly","","readonly","readonly","readonly","Visual Memory","immediately recalling a complex figure"],
  ["RCFT", "Delay","readonly","","readonly","readonly","readonly","Visual Memory","visual memory after a delay"],
  ["RCFT", "Recognition","readonly","","readonly","readonly","readonly","Visual Memory","recognition visual memory"],
  ["RCFT", "Copy","","readonly","readonly","readonly","","Visuospatial","visual-spatial constructional ability"],
 
  ["WAIS-IV", "DS-Total","readonly","readonly","readonly","","readonly","Attention","auditory attention and working memory"],
  ["WAIS-IV", "DSF","readonly","readonly","readonly","","readonly","Attention","simply attention"],
  ["WAIS-IV", "DSB","readonly","readonly","readonly","","readonly","Attention","working memory manipulation"],
  ["WAIS-IV", "DSS","readonly","readonly","readonly","","readonly","Attention","sequencing numbers"],
  ["WAIS-IV", "SS","readonly","readonly","readonly","","readonly","Processing Speed","speed of information processing"],

  ["TMTA", "","readonly","","readonly","readonly","readonly","Processing Speed","attention and speed"],
  ["TMTB", "","readonly","","readonly","readonly","readonly","Executive Function","divided attention and complex alternating sequencing"],

  ["NAB", "Naming","readonly","","readonly","readonly","readonly","Language","naming common objects"],
  ["BNT", "","readonly","","readonly","readonly","readonly","Language","naming common objects"],
  ["COWAT", "","readonly","","readonly","readonly","readonly","Language","letter fluency"],
  ["ANT", "","readonly","","readonly","readonly","readonly","Language","semantic fluency"],
  ["Verb Fluency", "","readonly","","readonly","readonly","readonly","Language","semantic fluency using action verbs"],

  ["WCST", "Total Errors","readonly","","readonly","readonly","readonly","Executive Function","forming abstract concepts, shift and maintain set, and utilize feedback"],
  ["WCST", "Persev Responses","readonly","","readonly","readonly","readonly","Executive Function","cognitive flexibility"],
  ["WCST", "Persev Errors","readonly","","readonly","readonly","readonly","Executive Function","cognitive flexibility"],
  ["WCST", "Nonperseverative Errors","readonly","","readonly","readonly","readonly","Executive Function","random error"],
  ["WCST", "Conceptual Level Responses","readonly","","readonly","readonly","readonly","Executive Function","conceptual efficiency"],
  ["GPT", "Dominant","readonly","","readonly","readonly","readonly","Sensori-motor","eye-hand coordination and motor speed of the dominant hand."],
  ["GPT", "Non-dominant","readonly","","readonly","readonly","readonly","Sensori-motor","eye-hand coordination and motor speed of the non-dominant hand"],
  ];

app.get('/insert', (req, res) => {
  res.render('dynamicinsert', { insertdataArray,title:'Enter Data'});
});



// Middleware to connect to the database
app.use(databaseConnectionMiddleware);


async function getCOMPAREScores(clientid, testNum, subtest, measure, scoretype) {
  // Fetch scores from the database
 const compareNum1 = await clients.findOne({
  $and: [
    { Name: clientid },
    { TestNum: 1 },
    { Subtest: subtest },
    { Measure: measure },
    {
      $or: [
        { T: { $ne: null } },
        { StandardScore: { $ne: null } },
        { ScaledScore: { $ne: null } }
      ]
    }
  ]
});

const compareNum2 = await clients.findOne({
  $and: [
    { Name: clientid },
    { TestNum: 2 },
    { Subtest: subtest },
    { Measure: measure },
    {
      $or: [
        { T: { $ne: null } },
        { StandardScore: { $ne: null } },
        { ScaledScore: { $ne: null } }
      ]
    }
  ]
});

  // Check if either compareNum1 or compareNum2 is null
  if (!compareNum1 || !compareNum2) {
    console.log(`Client ${clientid} does not have data for measure ${measure}`);
    return { score1: null, score2: null };
  }

 const score1 = 
  compareNum1?.ScaledScore !== null && compareNum1?.ScaledScore !== undefined 
    ? Number(compareNum1.ScaledScore) 
    : (compareNum1?.StandardScore !== null && compareNum1?.StandardScore !== undefined 
        ? Number(compareNum1.StandardScore)
        : Number(compareNum1?.T));

const score2 = 
  compareNum2?.ScaledScore !== null && compareNum2?.ScaledScore !== undefined 
    ? Number(compareNum2.ScaledScore) 
    : (compareNum2?.StandardScore !== null && compareNum2?.StandardScore !== undefined 
        ? Number(compareNum2.StandardScore)
        : Number(compareNum2?.T));
  //console.log('scores 1 and 2', score1, score2);
  return { score1: score1, score2: score2 };
}


async function getRCIs(clientid,measure,subtest,sem) {
  let rcisArray = [];

  try {
    const compareScores = await getCOMPAREScores(clientid, 1, subtest, measure, 'ScaledScore');
    const sed = 1.96 * Math.sqrt(2 * sem ** 2);
    const rci = (compareScores.score2 - compareScores.score1)/sed;
    rcisArray.push({ measure:measure,subtest: subtest, ...compareScores, diff: compareScores.score2 - compareScores.score1, sed: sed, rci: rci });

    //console.log('rcisArray at getRCIs',rcisArray);
  } catch (error) {
    console.error(`Error fetching compare scores for ${measure} - ${subtest}:`, error);

    rcisArray .push({
      measure,
      subtest,
      error: error.message,
    });
  } 

  return rcisArray;
}


async function rearrangeData(query) {

  try {

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
              PR:'$PR',
              Domain:'$Domain',
              Description:'$Description',
            },
          },
        },
      },
      ]).toArray();

    //console.log('Rearranged data:', rearrangedData);

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

    // Use MongoDB find and toArray to convert the cursor to an array
    const resultArray = await clients.find(query).toArray();
    // Use distinct on the array to get unique measure names
    const uniqueMeasureNames = [...new Set(resultArray.map(item => item.Measure))];

   // console.log('Unique Measure Names:', uniqueMeasureNames);
    return uniqueMeasureNames;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  } finally {
 
  }
}

async function processTSSArray(resultInputArray,clientId,testNum) {
 // const resultsArray = [];

  //console.log('resultinputarray',resultInputArray);
  const inputObject=resultInputArray;

  try {
   for (const measureName in inputObject) {
    if (inputObject.hasOwnProperty(measureName)) {
      const subtests = inputObject[measureName];

    // Iterate through each subtest within the measure
      for (const subtest of subtests) {
       // console.log(`Measure: ${measureName}, Subtest: ${subtest.Subtest}`);

      // Access other properties based on the subtest type
        if (subtest.T) {
        //  console.log('subtest T',subtest.T);
          const queryConversionT = { T: subtest.T};
          try {
          //await connectToDatabase();
            const resultConversionT = await conversion.findOne(queryConversionT);
           // console.log('result conversion T',resultConversionT);

            subtest.PR = resultConversionT.PR;
            subtest.Descriptor = resultConversionT.Descriptor;

          //console.log('subtests',subtest);

          } catch (error) {
            console.error('Error querying conversion:', error);
          }
        }
        if (subtest.Raw && !subtest.T && !subtest.ScaledScore && !subtest.StandardScore) {
          //console.log(`Raw: ${subtest.Raw}`);
          //console.log(`PR: ${subtest.PR}`);
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
          const queryConversion = { Raw: subtest.Raw};
          //subtest.PR = subtest.PR;

          const percentileScore = subtest.PR;
          if (percentileScore === null) {
              subtest.Descriptor = '';
            } else if (percentileScore > 98) {
              subtest.Descriptor = 'Exceptionally High';
            } else if (percentileScore >= 91 && percentileScore <= 97) {
              subtest.Descriptor = 'Above Average';
            } else if (percentileScore >= 75 && percentileScore <= 90) {
              subtest.Descriptor = 'High Average';
            } else if (percentileScore >= 25 && percentileScore <= 74) {
              subtest.Descriptor = 'Average';
            } else if (percentileScore >= 9 && percentileScore <= 24) {
              subtest.Descriptor = 'Low Average';
            } else if (percentileScore >= 2 && percentileScore <= 8) {
              subtest.Descriptor = 'Below Average';
            } else if (percentileScore < 2) {
              subtest.Descriptor = 'Exceptionally Low';
            }

          subtest.Z= "";
          subtest.T= "";

        }
        if (subtest.StandardScore) {
         // console.log(`StandardScore: ${subtest.StandardScore}`);
          const queryConversion = { StandardScore: subtest.StandardScore};
          try {
          //await connectToDatabase();
            const resultConversion = await conversion.findOne(queryConversion);
            //console.log('result conversion StandardScore',resultConversion);
            subtest.T = resultConversion.T;
            subtest.PR = resultConversion.PR;
            subtest.Descriptor = resultConversion.Descriptor;

          //console.log('subtests',subtest);

          } catch (error) {
            console.error('Error querying conversion:', error);
          }

        }
        if (subtest.ScaledScore) {
         // console.log(`ScaledScore: ${subtest.ScaledScore}`);
          const queryConversion = { ScaledScore: subtest.ScaledScore};
          try {
          //await connectToDatabase();
            const resultConversion = await conversion.findOne(queryConversion);
           // console.log('result conversion ScaledScore',resultConversion);
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
//console.log('resultInputArray',resultInputArray);
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


// async function calculateTMTAZAndResult(clientId, testNum, tombaughTMTA, conversion) {
//   try {
//     // Query for TMTA

//     const queryTMTA = { $and: [{ Measure: 'TMTA' }, {Name:clientId},{TestNum: Number(testNum)}] };
//     console.log('TMTA query',queryTMTA );
//     const resultTMTA = await clients.find(queryTMTA).toArray();    
//     console.log('result tmta',resultTMTA );

//     const tmtaRaw = resultTMTA[0].Raw;
//     const clientAge = resultTMTA[0].Age;
//     const clientEducation = resultTMTA[0].Education;

//     // Query TombaughTMTA based on Age and Education
//     const queryTombaughTMTA = {
//       Age: clientAge,
//       Education: clientEducation > 12 ? '>12' : '<12',
//     };

//     const resultTombaughTMTA = await tombaughTMTA.find(queryTombaughTMTA).toArray();
//     console.log(`Education: ${clientEducation > 12 ? '>12' : '<12'}`);

//     console.log(tmtaRaw);
//     console.log('Tombaugh',queryTombaughTMTA);

//     let calculateTMTAZ = 0;
//     if (tmtaRaw < resultTombaughTMTA[0].Mean) {
//       calculateTMTAZ = (tmtaRaw - resultTombaughTMTA[0].Mean) / resultTombaughTMTA[0].SD;
//       console.log('raw < mean');
//     } else {
//       calculateTMTAZ = (resultTombaughTMTA[0].Mean - tmtaRaw) / resultTombaughTMTA[0].SD;
//       console.log('raw > mean');
//     }

//     // Find descriptor from Z
//     const resultConversionZ = await calculateResultConversionZ(conversion, calculateTMTAZ);

//     // Return the results
//     return { resultTMTA, calculateTMTAZ, resultConversionZ };
//   } catch (error) {
//     console.error('Error:', error);
//     throw error; // Rethrow the error to handle it elsewhere if needed
//   }
// }



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
  PR:Number,
  Domain: String,
  Description: String,
  Premorbid: Number,
});
const Submission = mongoose.model('Submission', submissionSchema, 'clients');
//Submission.create(dataToInsert);

// Handle form submission
app.post('/submit', async (req, res) => {
 //console.log('Received form data:', req.body);
  try {
    //await connectToDatabase(); 
    //const uri = 'mongodb://localhost:27017/test';
    const uri = "mongodb+srv://npscoreuseradmin:Hp4Fj9nQ9zYfb2fl@npscoresheet.iz2w8nw.mongodb.net/?retryWrites=true&w=majority";
    mongoose.connect(uri, {});
//app.use(databaseConnectionMiddleware);
   // console.log('sumission sch',Submission);
  // Extract common fields from the request body
    const { Name, Sex, Education, Age, Race, TestNum, Premorbid} = req.body;
    // Create two separate documents
    //const parseNumber = (value) => (isNaN(value) || value === '') ? null : parseInt(value);

 // Iterate through each row in the request body
    for (const rowData of req.body.rows) {
      // Combine common fields with row-specific data
      const data = rowData;

      
      // Insert data into MongoDB
      await Submission.create(data);
      // console.log('submit data',data);
    }

    res.send('Data submitted successfully!!!');
  } catch (error) {
    console.error('Error submitting data:', error);
    res.status(500).send('Internal Server Error');
  }
});


async function fetchLNames(testlst) {
  try {
    // console.log('test short names',testlst);

    const lnamePromises = testlst.map(async (sname) => {
      const result = await testnamesCollection.findOne({ SName: sname });
      return result ? result.LName : null;
    });

    const lnames = await Promise.all(lnamePromises);

    return lnames.filter((lname) => lname !== null);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    //await client.close();
  }
}



// const { OpenAI } = require('openai');

// const openai = new OpenAI({ apiKey: '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' });

//  ejs <!---------h1>Text AI Response</h1>
 // <p><%= response %></p----------->

app.post('/process', async (req, res) => {
 // console.log('post to process');

  try {
    const clientId = req.body.clientId;
    const clientSex = req.body.Sex;
    const testNum = req.body.testNum;
    //console.log('get client id', testNum );
    const query = { Name: clientId, TestNum: Number(testNum)};
     //console.log('find client', query  );
    // Use findOne to find a single document that matches the query
    const result = await clients.findOne(query);
  // console.log('find name age sex',result);

    const rearrangedData = await rearrangeData(query);

    const uniqueMeasureNamesResult = await getUniqueMeasureNames(query);

    const targetMeasuresToRetrieve = uniqueMeasureNamesResult;
    const resultData = getDataForTargets(rearrangedData, targetMeasuresToRetrieve);
    const resultsTSS = await processTSSArray(resultData,clientId,testNum);
    const testlistArray  = Object.fromEntries(Object.entries(resultsTSS ).map(([key, value]) => [key,value.filter(item => item.T !== null)]));
    //console.log('testlistarray:', testlistArray);

    // Get keys that are not empty
    const nonEmptyKeys = Object.keys(testlistArray).filter(key => {
      const value = testlistArray[key];
      return Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined;
    });

    let longNames={};

    await fetchLNames(nonEmptyKeys)
    .then((lnames) => {

      longNames=lnames;
      
    })
    .catch((error) => {
      console.error('Error:', error);
    });



    // Function to filter items with T not null
    const filterItemsWithTNotNull = (array) => array.filter(item => item.T !== null);


// Apply the function to each array in the data
    const resultNotNull = Object.fromEntries(
      Object.entries(resultsTSS).map(([key, value]) => [key, filterItemsWithTNotNull(value)])
      );

// Filter out keys with empty values
    const finalResult = Object.fromEntries(
      Object.entries(resultNotNull).filter(([key, value]) => Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined)
      );
    //console.log('resultNotNull', finalResult);

    // Format output
    let outputArray = {
      Client: clientId,
      Sex:result.Sex,
     // ClientAge: result.Age,
     // TSS: finalResult,
      Premorbid:result.Premorbid,
      TestList: longNames,
    };

const flatArray = [];

for (const measure in finalResult) {
  const subtests = finalResult[measure];
  for (const subtest of subtests) {
    flatArray.push({
      Measure: measure,
      ...subtest
    });
  }
}

//console.log(flatArray);



const rearrangedByDomain = flatArray.reduce((result, item) => {
  const domain = item.Domain;
  if (!result[domain]) {
    result[domain] = [];
  }
  result[domain].push(item);
  return result;
}, {});

//console.log('domain',rearrangedByDomain);


const transformedArray = {};

for (const domain in rearrangedByDomain) {
  const tests = rearrangedByDomain[domain];
  const groupedTestsArray = tests.reduce((acc, test) => {
    if (!acc[test.Descriptor]) {
      acc[test.Descriptor] = [];
    }
    acc[test.Descriptor].push(test);
    return acc;
  }, {});

  transformedArray[domain] = [];

  Object.entries(groupedTestsArray).forEach(([descriptor, testsArray]) => {
    if (testsArray.length > 1) {
      transformedArray[domain].push(testsArray);
    } else {
      transformedArray[domain].push(testsArray[0]);
    }
  });
}

//console.log(transformedArray);

// console.log('domain',rearrangedByDomain);
// console.log(transformedArray);



const anova1 = require('@stdlib/stats-anova1');
const data=rearrangedByDomain;
const testDataWithStats={};
// Calculate mean scores for each domain
const domainAnova = {};
const Mpremorb=outputArray.Premorbid;
for (const domain in data) {

   const domainValues = data[domain].map(entry => parseFloat(entry.T)).filter(value => !isNaN(value));
    const mean = calculateMean(domainValues);
    
   
    domainAnova[domain] = domainValues;
    
    const sd = calculateSD(domainValues, mean);
    const scoreDifferences = calculateScoreDifferences(domainValues, mean);
    const cohenD = calculateCohensD(parseFloat(mean), Mpop, sd, SDpop);
    const n = countTScores(data)[domain];
    const sem = calculateSEM(sd, n);
    const ci95 = calculate95CI(sem);
    const { heterogeneity, pValue } = calculateHeterogeneity(domainValues);
    //const tfromMpremorb = calculateTStatistic(mean,n,Mpremorb);
    const tfromMpop = calculateTStatistic(mean,n);
    // Perform one-sample t-test
    const { t: tPop, p: pPop }  = performOneSampleTTest(domainValues, Mpop);
    const { t: tPremorb, p: pPremorb } = performOneSampleTTest(domainValues, Mpremorb);
  

    testDataWithStats[domain] = data[domain].map((entry, index) => ({
        ...entry,
        Mean: mean,
        SD: sd,
        DifferenceFromMean: scoreDifferences[index],
        n: n,
        tfromMpop:tfromMpop,
        HeteroP: pValue,
        ES: cohenD,
        SEM: sem,
        pPop:pPop,
        pPremorb:pPremorb,
        '95% CI': {
            Lower: mean - ci95,
            Upper: mean + ci95
        },
        //TukeyHSD: tukeyResult,
    }));
}

// Extract means for ANOVA
const scores = Object.values(domainAnova);
// console.log('scores',scores );
// Extract domain names for ANOVA
const domains = Object.keys(domainAnova);
// console.log('domains',domains);

// console.log(domainAnova);

// Flatten the scores and assign group labels
const flattenedScores = [];
const groupLabels = [];
scores.forEach((scoreGroup, i) => {
    scoreGroup.forEach(score => {
        flattenedScores.push(score);
        groupLabels.push(domains[i]);
    });
});

// Perform within-group ANOVA
//if (flattenedScores.length > 1) {
    const anovaresult = anova1(flattenedScores, groupLabels);
    // Further processing with the ANOVA result
//}

//console.log(flattenedScores, groupLabels);

// Output ANOVA result
//console.log('anova',anovaresult);


const kruskalTest = require('@stdlib/stats-kruskal-test');


// Filter out empty arrays
const domainAnovanonEmptyData = Object.fromEntries(
  Object.entries(domainAnova).filter(([_, scores]) => scores.length > 0)
);

// Prepare the arguments for kruskalTest
const args = Object.values(domainAnovanonEmptyData);

// Perform Kruskal-Wallis test
const kruresult = kruskalTest(...args);

// console.log('Kruskal-Wallis Test Result:');
// console.log(kruresult);


////tukey test

const groups = {};
groupLabels.forEach((label, index) => {
    if (!groups[label]) {
        groups[label] = [];
    }
    groups[label].push(flattenedScores[index]);
});

// Calculate group means
const groupMeans = {};
for (const label in groups) {
    groupMeans[label] = jStat.mean(groups[label]);
}

// Total number of observations
const totalObservations = flattenedScores.length;

// Degrees of freedom for error
const dfError = totalObservations - Object.keys(groupMeans).length;

// Calculate Tukey's HSD
const criticalValue = jStat.tukey.inv(0.05, Object.keys(groupMeans).length, dfError);

// Calculate pairwise differences and check if they exceed the critical value
const significantDifferences = [];
const groupLabelsArr = Object.keys(groupMeans);
for (let i = 0; i < groupLabelsArr.length; i++) {
    for (let j = i + 1; j < groupLabelsArr.length; j++) {
        const groupLabel1 = groupLabelsArr[i];
        const groupLabel2 = groupLabelsArr[j];
        const difference = Math.abs(groupMeans[groupLabel1] - groupMeans[groupLabel2]);
        if (difference >= criticalValue) {
            significantDifferences.push({
                groups: [groupLabel1, groupLabel2],
                difference: difference
            });
        }
    }
}

// Output significant differences
 // console.log("Significant Differences:");
 // console.log(significantDifferences);
//console.log('stat',testDataWithStats);

const domainData = {};

for (const domain in testDataWithStats) {
  const entry = testDataWithStats[domain][0]; // Select the first entry for each domain
  //console.log('entrydomain',entry);
  domainData[domain] = {
    Domain: entry.Domain,
    Mean: entry.Mean,
    SD: entry.SD,
    n: entry.n,
    HeteroP: entry.HeteroP,
    ES: entry.ES,
    SEM: entry.SEM,
    pPop:entry.pPop,
    pPremorb:entry.pPremorb,
    '95% CI': entry['95% CI']
  };
}
// console.log('output',outputArray);
    res.render('dynamicoutput', {outputArray,anovaresult,kruresult,rearrangedByDomain,transformedArray,domainData,significantDifferences,title: 'Client Result' });
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // No need to close the client here since it's already closed in the try block
  }
});

// Function to calculate Cohen's d
function calculateCohensD(mean1, mean2, sd1, sd2) {
    const pooledSD = Math.sqrt((Math.pow(sd1, 2) + Math.pow(sd2, 2)) / 2);
    return (mean1 - mean2) / pooledSD;
}

// Function to calculate mean
function calculateMean(values) {
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

// Function to calculate standard deviation
function calculateSD(values, mean) {
  const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
  const variance = calculateMean(squaredDifferences);
  return Math.sqrt(variance);
}

// Function to calculate the difference from the mean
function calculateScoreDifferences(values, mean) {
  return values.map(val => val - mean);
}

// Function to count the number of non-empty T scores in each domain
function countTScores(data) {
    const domainCounts = {};
    for (const domain in data) {
        domainCounts[domain] = data[domain].filter(entry => entry.T !== undefined && entry.T !== '' && !isNaN(entry.T)).length;
    }
    return domainCounts;
}

// Function to calculate the t-statistic
function calculateTStatistic(sampleMean, n) {
    return (sampleMean - Mpop) / (SDpop / Math.sqrt(n));
}

// Function to calculate 95% CI
function calculate95CI(sem) {
    return 1.96 * sem; // 1.96 is the Z-score for 95% CI
}
// Function to calculate SEM
function calculateSEM(sd, n) {
    return sd / Math.sqrt(n);
}
// Function to calculate the sample mean
function calculateSampleMean(data) {
    let sum = 0;
    let count = 0;
    for (const domain in data) {
        data[domain].forEach(subtest => {
            sum += subtest.T;
            count++;
        });
    }
    return sum / count;
}

const { mean, standardDeviation } = require('simple-statistics');

// Function to calculate heterogeneity
function calculateHeterogeneity(values) {
    // Filter out non-numeric values
    const numericValues = values.filter(value => typeof value === 'number' && !isNaN(value));

    // Check if there are at least two numeric values
    if (numericValues.length < 2) {
        return {
            heterogeneity: 'N/A',
            pValue: 'N/A'
        };
    }

    // Calculate the standard deviation of the numeric values
    const sd = standardDeviation(numericValues);

    // Calculate the mean of the numeric values
    const avg = mean(numericValues);

    // Calculate the coefficient of variation (CV)
    const cv = (sd / avg) * 100;

    // Calculate the degrees of freedom (n - 1)
    const df = numericValues.length - 1;

    // Calculate the chi-square statistic
    const chiSquare = Math.pow(sd, 2) / Math.pow(avg, 2) * df;

    // Calculate the p-value using the chi-square distribution
    const pValue = 1 - Math.abs(jStat.chisquare.cdf(chiSquare, df));

    return {
        heterogeneity: cv.toFixed(2),
        pValue: pValue.toFixed(4)
    };
}



// Function to perform one-sample t-test
function performOneSampleTTest(sample, populationMean) {
 // console.log('sampmple',sample);
    const n = sample.length;
    const sampleMean = sample.reduce((acc, val) => acc + val, 0) / n;
    const sampleVariance = sample.reduce((acc, val) => acc + Math.pow(val - sampleMean, 2), 0) / (n - 1);
    const standardError = Math.sqrt(sampleVariance / n);
    const tValue = (sampleMean - populationMean) / standardError;
    const degreesOfFreedom = n - 1;
    // Calculate p-value using t-distribution
    const pValue = require('jstat').ttest(tValue, degreesOfFreedom);
//console.log(tValue, pValue);
    return { t:tValue, p:pValue };
}



function calculateTukeyHSD(meanScores, groupArray) {
    // Flatten mean scores and group array
    const flattenedMeanScores = meanScores.flat();
    const flattenedGroupArray = groupArray.flat();

    // Perform Tukey's HSD test
    const result = tukeyhsd(flattenedMeanScores, flattenedGroupArray);

    return result;
}

app.post('/processrci', async (req, res) => {
 // console.log('post to rci process');

  try {
    const clientId = req.body.clientid;
    const allVariables = req.body;
    const semValues = req.body.SEM;
    //console.log(semValues);
    const measures = { ...allVariables};
    delete measures.clientid;
    delete measures.SEM;
    //console.log(measures);

    //const semArray = Object.values(measures);

    const semArray = Object.entries(measures).map(([key, value]) => ({
      measure: value[0],
      subtest: value[1],
      sem: value[2]
    }));


    const rowsWithSemNotNull = semArray.filter(row => row.sem.trim() !== "" && row.sem !== null && row.sem !== undefined);

//console.log('sem not null',rowsWithSemNotNull);

    const rcisArray = [];

    for (const row of rowsWithSemNotNull) {
      const rcis = await getRCIs(clientId, row.measure,row.subtest,row.sem);
     // console.log('rcis',rcis)
      rcisArray.push({ rcis });
    }
    const outputArray = rcisArray.map(item => {
      const { rcis } = item;
      if (rcis && rcis.length > 0) {
        const { measure, subtest, score1, score2, diff, sed, rci } = rcis[0];
        return { measure, subtest, score1, score2, diff, sed, rci };
      }
  return null; // or handle the case where rcis is empty
});

   //console.log('ouputArray at processrci',outputArray);
    res.render('rcioutput', { outputArray, clientId, title: 'RCI Result'});

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
// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
