const mongoose = require('mongoose');

const otpSchema = mongoose.Schema({
    code: {
        type: Number,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    expiry: {
        type: Date,
        default: function() {
            const currentDate = new Date();

            // Add 15 minutes to the current date and time
            currentDate.setMinutes(currentDate.getMinutes() + 15);  
            return currentDate;
        },
    },
    role: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Otp', otpSchema);