const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: '../../config.env' }); // This has to happen before we require the app file. otherwise, when we read the app file, the environment vars will be undefined.

const localDB = process.env.DATABASE_LOCAL;

mongoose.connect(localDB).then(() => {
  console.log('DB Connection successful');
});

const tours = fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8');

// Import data into db
const importData = async () => {
  try {
    await Tour.create(JSON.parse(tours));
    console.log('data successfully loaded');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Delete all data form db
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data successfully deleated');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Use the --import or --delete flag on the command line to run the appropraita function

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
