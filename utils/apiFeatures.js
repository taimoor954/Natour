class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    //SIMPLE QUERING
    var queryObject = { ...this.queryString };

    const excludedFields = ['sort', 'page', 'limit', 'fields'];
    excludedFields.forEach((e) => delete queryObject[e]);
    //The JavaScript delete operator removes a property from an object;
    //if no more references to the same property are held, it is eventually released automatically
    // console.log(queryObject);
    // const query =  Tour.find(queryObject); //1ST WAY OF QUERING DOCUMENT //returns query

    // const tours = await Tour.find()
    // .where('difficulty').
    // equals('easy')///ANOTHER WAY OF QUERING DOCUMENT

    //1 ADVANCE QUERY
    var queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(lte|lt|gte|gt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
    // let query = Tour.find(JSON.parse(queryStr)); //1ST WAY OF QUERING DOCUMENT //returns query
    //{duration : {$gte : '5'}, difficulty : 'easy'} //WAY OF WRIITNG A QUERY
    // { duration: { gte: '5' }, difficulty: 'easy' }//WHAT WE GOT FROM REQUEST.QUERY
  }
  sort() {
    if (this.queryString.sort) {
      // http://localhost:8000/api/v1/tours?sort=-price for descending sorting
      // http://localhost:8000/api/v1/tours?sort=price,maxGroupSize for more than 1 params
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this; // this return entire object
  }
  filedLimiting() {
    if (this.queryString.fields) {
      var fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); //SELECTING LIMITED FIELDS IS CALLED PROJECTING
    } else {
      this.query = this.query.select('-__v ');
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
exports.APIFeatures = APIFeatures;
