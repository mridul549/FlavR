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
    pendingConfOrders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        }
    ],
    activeOrders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        }
    ],
    readyOrders: [
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
    maintainers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Maintainer'
        }
    ],
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
    },
    revenues: [
        {
            date: {
                type: Date,
                // get: function (date) {
                //     return date.toISOString().split('T')[0]; // Get the date in YYYY-MM-DD format
                // },
                // set: function (dateString) {
                //     const [year, month, day] = dateString.split('-');
                //     return new Date(year, month - 1, day); // Subtract 1 from month as it is 0-based index
                // }
            },
            revenue: {
                type: Number,
                default: 0
            }

        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model('Outlet', outletSchema);
