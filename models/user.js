const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type:String,
        required: true,
        unique: true,
        index: true,
        validate: {
            validator: function(value) {
                const mailPattern = /.+@.+\..+/i;
                const mailRegExp = new RegExp(mailPattern);
                return value.match(mailRegExp);
            },
            message: props => `${props.value} is not a valid Email`
        }
    },
    password: {
        type:String,
        required: true,
    },
    name: {
        type:String,
        required: true,
    },
    surname: {
        type:String,
        required: true,
    },
    phone: {
        type:String,
        required: true,
        unique: true,
        validate: {
            validator: function(value) {
                const phonePattern = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/;
                const phoneRegExp = new RegExp(phonePattern);
                return value.match(phoneRegExp);
            },
            message: props => `${props.value} is not a valid Phone`
        }
    },
    admin: {
        type:Boolean,
        default: false,
    },
  },
  {collection: 'users'}
);

const User = mongoose.model('User', UserSchema);

module.exports = User;