const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxLength: 12,
    },
    lastName: {
        type: String,
        required: true,
        maxLength: 12
    },
    contactNumber: {
        type: String,
        required: true
    },
    emailAddress: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: v => {
                const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                return pattern.test(v);
            },
            message: props => `${props.value} is not a valid email`
        }
    },
    password: {
        type: String,
        required: true,
    },
    profilePhoto: {
        type: String,
    },

    // Super-Admin (super_admin), Admin (admin), User (user)
    role: {
        type: String,
        required: true,
        default: () => 'user'
    },

    contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
});

module.exports = mongoose.model('User', userSchema);