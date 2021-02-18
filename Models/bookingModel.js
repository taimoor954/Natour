const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tours',
        required: [true, 'Booking requires tour'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking requires user'],
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    paid: {
        //incase if someone want to pay on cash rather than card
        type: Boolean,
        default: true,
    },
});


//populate tour and user automativally whenever there is a query 
bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    })
    next()
})

const Booking = mongoose.model('Booking', bookingSchema)
exports.Booking = Booking