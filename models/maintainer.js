const mongoose = require('mongoose');

const maintainerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    maintainerName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    },
    password: {
        type: String,
    },
    authMethod: {
        type: String,
        required: true
    },
    verification: {
        type: Boolean,
        default: false
    },
    mobile: {
        type: Number
    },
    maintainerPic: {
        url: {
            type: String,
            default: "null"
        },
        id: {
            type: String,
            default: "null"
        }
    },
    outlets: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Outlet'
        }
    ],
    role: {
        type: String,
        default: "Maintainer"
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Maintainer', maintainerSchema);