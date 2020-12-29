//FILE CONTAIN NOT RELATED TO EXPRESS
const mongoose = require('mongoose');
const dotenv = require('dotenv');
process.on('uncaughtException', (e) => {
  console.log(`Error: ${e.name}!! ${e.message}`);

})
const app = require('./index');

dotenv.config({
  path: `${__dirname}/config.env`,
});

// console.log(process.env.NODE_ENV)
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATA_BASE_PASSWORD
);
const localDB = process.env.DATABASE_LOCAL;
//DATABASE CONNECTION WITH LOCAL/CLOUD DB
var connectionDatabase = async (con) => {
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
    console.log('APPLICATION CRASHEDD 🔥🔥');
    process.exit(1);
  }
};
connectionDatabase();
//CREATING SCHEMA
//SAVING DOCUMENT IN MONGODB COMPASS

// console.log(app.get('env')) //by default development set by express
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});

//UNHANDELED REJECTIONS
process.on('unhandledRejection', (e) => {
  //handle uncaught rejections or async code
  console.log(`Error: ${e.name}!! ${e.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// console.log(x)