const mongoose = require('mongoose')
const validator = require('validator')
const mongodbErrorHandler = require('mongoose-mongodb-errors')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        default: 'No Name'
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        required: 'Please supply an email address'
    },
    password: { // (hashed)
        type: String,
        trim: false,
        default: ''
    },
    // You don't need this.
    // You can calculate the created date based on Object ID
    // But in case that's too complex, just uncomment below
    /*
    created: {
        type: Date,
        default: () => Date.now()
    }
    */
})

userSchema.plugin(mongodbErrorHandler)

module.exports = mongoose.model('User', userSchema)