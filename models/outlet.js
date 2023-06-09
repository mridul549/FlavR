const mongoose = require('mongoose');

const outletSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    outletName: {
        type: String,
        required: true
    },
    address: {
        addressLine1: {
            type: String,
            required: true
        },
        addressLine2: {
            type: String
        },
        landmark: {
            type: String
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner',
        required: true
    },
    menu: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    activeOrders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        }
    ],
    completedOrders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        }
    ],
    outletImage: {
        url: {
            type: String
        }, 
        imageid: {
            type: String
        }
    },
    outletqr: {
        url: {
            type: String
        }, 
        qrid: {
            type: String
        }
    },
    currentOrderNumber: {
        type: Number,
        default: 0
    },
    timings: {
        monday: {
            open: {
                type: String,
                default: "00:00 AM"
            },
            close: {
                type: String,
                default: "00:00 AM"
            }
        },
        tuesday: {
            open: {
                type: String,
                default: "00:00 AM"
            },
            close: {
                type: String,
                default: "00:00 AM"
            }
        },
        wednesday: {
            open: {
                type: String,
                default: "00:00 AM"
            },
            close: {
                type: String,
                default: "00:00 AM"
            }
        },
        thursday: {
            open: {
                type: String,
                default: "00:00 AM"
            },
            close: {
                type: String,
                default: "00:00 AM"
            }
        },
        friday: {
            open: {
                type: String,
                default: "00:00 AM"
            },
            close: {
                type: String,
                default: "00:00 AM"
            }
        },
        saturday: {
            open: {
                type: String,
                default: "00:00 AM"
            },
            close: {
                type: String,
                default: "00:00 AM"
            }
        },
        sunday: {
            open: {
                type: String,
                default: "00:00 AM"
            },
            close: {
                type: String,
                default: "00:00 AM"
            }
        }
    },
    daysOpen: {
        monday: {
            type: Boolean,
            default: true
        },
        tuesday: {
            type: Boolean,
            default: true
        },
        wednesday: {
            type: Boolean,
            default: true
        },
        thursday: {
            type: Boolean,
            default: true
        },
        friday: {
            type: Boolean,
            default: true
        },
        saturday: {
            type: Boolean,
            default: true
        },
        sunday: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Outlet', outletSchema);
