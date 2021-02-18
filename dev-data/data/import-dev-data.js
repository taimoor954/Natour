// IMPORTING JSON FILE AND EXPORTING TO DATABASE
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs')
const {
  Tour
} = require('../../Models/tourModel')
const {
  User
} = require('../../Models/userModel')
const {
  Review
} = require('../../Models/reviewModel')

dotenv.config({
  path: `${__dirname}../../../config.env`
});
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATA_BASE_PASSWORD
);
// console.log(DB)
var connectionDatabase = async () => {
  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log('Database has been connected!....');
  } catch (e) {
    console.log(`Error:${e}`);
  }
};
connectionDatabase();

//IMPORT JSON DATA INTO DB
const toursFromJSON = fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
const importData = async () => {
  try {
    await Tour.create(JSON.parse(toursFromJSON))
    'data succesfully loaded')
  } catch (e) {
    console.log(e)
  }
}

//DELETE ALL EXISITING IN DB

const deleteDataFromDB = async () => {
  try {
    await Tour.deleteMany() //DELETE ALL DATA FROM DATABASE
    console.log('data succesfully deleted')
  } catch (e) {
    console.log(e)
  }
}
if (process.argv[2] == '--import') //CHECK ARG AT 2ND POSITION
{
  importData()
} else if (process.argv[2] == '--delete') {
  deleteDataFromDB()
}
console.log(process.argv)