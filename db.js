// const { MongoClient } = require('mongodb');
// const uri = 'mongodb://localhost:27017/test';
// const client = new MongoClient(uri, {});

// real server
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://npscoreuseradmin:Hp4Fj9nQ9zYfb2fl@npscoresheet.iz2w8nw.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


let database;

async function connectToDatabase() {
  try {
    await client.connect();
   // console.log('Connected to the database');
    database = client.db('test');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}

async function closeDatabaseConnection() {
  try {
    await client.close();
   // console.log('Connection closed');
  } catch (error) {
    console.error('Error closing the database connection:', error);
    throw error;
  }
}

function getDatabase() {
  if (!database) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return database;
}

function databaseConnectionMiddleware(req, res, next) {
  connectToDatabase()
    .then(() => next())
    .catch((error) => {
      console.error('Error connecting to the database:', error);
      res.status(500).send('Internal Server Error');
    });
}

module.exports = {
  connectToDatabase,
  closeDatabaseConnection,
  getDatabase,
  databaseConnectionMiddleware,
  closeConnection: closeDatabaseConnection,
  getClient: () => client,
};
