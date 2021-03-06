const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const {
//   User
// } = require('./userModel');

var tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name of tour is must'], //VALIDATOR:if name is not given then 1 pos of array will work
    unique: true,
    validate: {
      validator: validator.isAlpha,
      message: 'Your name must be unique with only alphabets init',
    },
    maxlength: [40, 'a tour name must have less or equal than 40 charcaters'],
    minlength: [
      10,
      'a tour name must have greater than 10 or equal than 40 charcaters',
    ],
  },
  slug: String,
  price: {
    type: Number,
    required: [true, 'price of tour is must'],
  },

  duration: {
    type: Number,
    required: [true, 'Duration is required'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Mention the maximum group size '],
  },
  difficulty: {
    type: String,
    required: [true, 'Mention the difficulty as well'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Error in difficulty ',
    },
  },
  ratingAverage: {
    type: Number,
    min: [1, 'somee issue with min'],
    max: [5, 'somee issue with max'],
    set: val => Math.round(val * 10 / 10) //round will give int so 4.6 will be round to 4,7 therfore 4.6*10 i.e 46 then 46/10 i.e 4.6 
  },
  ratingQuantity: {
    type: Number,
    default: 0,
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (
        v //custom validator, false returns validation error
      ) {
        //this will point to current doc so can be use with post but cant with update
        if (v < this.price) return true;
        else return false;
      },
      message: 'Discount price ({VALUE}) should be below the regular price',
      //({VALUE}) MAY v pass hosakta hai
    },
  },
  summary: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have cover image'],
  },
  images: {
    type: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //this property wont be displayed to client but can be use in other stuff
    },
  },
  startDates: {
    type: [Date],
  },
  //EMBEDDED DATABASE
  startLocation: {
    //For location create like this
    //GEOJSON FOR LONGITUDE AND LATITUDE HANDELING OR LOCATION HANDELING
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    description: String,
  },
  locations: [{
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    description: String,
    day: Number,
  }, ],

  guides: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User' //refrence the collecition
  }],

  secretTour: {
    type: Boolean,
    default: false,
  },
}, {
  toJSON: {
    virtuals: true,
  },
}, {
  toObject: {
    virtuals: true,
  },
});

// tourSchema.index({price : 1}) // SINGLE INDEXING BELOW ONE IS COMPUND INDEX
tourSchema.index({
  slug: 1
})
tourSchema.index({
  price: 1,
  ratingAverage: -1
}) //INDEX ARE USE TO QUERY FASTER IDS ARE BY DEFAULT INDEXED BUT AESI FIELDS
//JINKAY BASIS PER QUERY HOSAKTI HAI WO JALD SAY JALD WORK KARNI CHAIYA LIKE PRICE AND FOR THAT WE USE INDEX FUNC
//1 MEANS ASCEDNING CAN ALSO USE -1 FOR DESCENDING
tourSchema.index({
  startLocation: '2dsphere'
})

//RESPONSIBLE FOR PERFORMING EMBEDDING 
// tourSchema.pre('save', async function (next) { //middleware to retrive user document by help of id 
//   const getGuideUserPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(getGuideUserPromises) //store all promises then run them all together
//   next()

// })

//VIRTUAL POPULATE 
//HUMNAY REVIW SCHEMA MAY TOUR TOU REF KARA DIA THA LEKIN TOUR KAY SATH USKAY REVIEW BHI TOU KARANAY THAY
//SO FOR THAT CHILD REFRENCING EK OPTION THA LEKIN ARRAY INDEFINITE INCREMENT KI WAJA SYA NAHI KARAYA 
//ALSO CHIL REF KI WAJA SAY ALL TOUR MAY BHI REVIEWS SHOW HONA SHURU HOJATAY WHICH IS JUST A OVERVIEW PAGE
//TOU HUMNAY REVIEW VIRTUAL POPULATE KARAYE WHEN TOUR GET BY ID IS USED
//HUMNAY REVIEW MODEL KO TOUR MODEL IS ATTACH KARAYA BUT JUST FOR TOUR BY ID BY SUSING POPULATE
//FOREIGN FIELD FOREIGN MODEL REVIEW KI FIELD TOUR KO REFER KARI HAI
//AND LOCAL FIED TOUR MODEL KAY ID KO REFER KARI HAI
//FORIEGN AND LOCAL KAY THRU YE DONU MODEL CONNECT HOYE HEN
tourSchema.virtual('review', { //virtual field, and an object for virrual populate
  ref: 'reviews', //pointng at Model
  foreignField: 'tour',
  localField: '_id'
})

//lecture 23 sec 8
tourSchema.virtual('durationWeek').get(function () {
  //properties of scema like name duration but not
  //included in database will not be shown in response. To display it use toJSON as above and toObject

  return this.duration / 7;
});

// ********DOCUMENT-MIDDLEWARE**************

//DOCUMENT MIDDLEWARE: RUN BEFORE SAVE() AND .CREATE()
//pre and post ye 2 hooks hotay hen
//pre save or create say pehlay chalay ga

tourSchema.pre('save', function (next) //'save' is hook pre hook
  {
    //here this will target the schema properries
    this.slug = slugify(this.name, {
      lower: true
    })
    next()
  })
// //POST save or create KAY BAD  chalay ga

// tourSchema.post('save', function(doc, next) //saave here is post hook
// {
//   //this wont target anything
// console.log(doc)
// console.log(this)
// next()
// })

// ********QUERIES-MIDDLEWARE**************
//ALLOW middleware to run before and after quiery
// pre
tourSchema.pre(/^find/, function (next) {
  this.find({
    secretTour: {
      $ne: true
    }
  })
  //here this points the object of queries like find, insertMany, update , delete
  this.start = Date.now()
  console.log(`${this.start*1}ms`)
  next()
})
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides review', //path tells which field to include
    select: '-__v -passwordChangedAt -passwordResetToken ' //wont be showed when displaying
  })
  next()
})


//POST QUERIES MIDWARE
// tourSchema.post(/^find/, (doc, next)=> {
//   console.log(`${Date.now()-this.start*1} ms`)
//   next()
// })

// ********AGGREGATION-MIDDLEWARE**************
// tourSchema.pre('aggregate', function(next){
//   this.pipeline().unshift({$match : {
//     secretTour : {$ne:true}
//   }})
//   next()
// })

var Tour = mongoose.model("Tours", tourSchema);
exports.Tour = Tour;

//there are middleware in mognoose as well
//Document middleware
//query middleware
//aggregate middleware
//model middleware

//DOCUMENT MIDDLEWARE