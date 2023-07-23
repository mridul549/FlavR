const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");
const Outlet = require("../models/outlet");
const Owner = require("../models/owner");
const User = require("../models/user");

module.exports.testing = (req, res) => {
    const outletid = req.query.outletid;
    const monthIn = 7
    const yearIn = 2023

    const dateObject = new Date();
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObject.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const today = new Date(formattedDate)

    Order.aggregate([
        {
            $match: {
                outlet: new mongoose.Types.ObjectId(outletid),
                status: "COMPLETED",
                createdAt: {
                    $gte: new Date(yearIn, monthIn-1, 1),
                    $lt: new Date(yearIn, monthIn)
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%d", date: "$createdAt" }
                },
                totalPrice: { $sum: "$totalPrice"}
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ])
    .exec()
    .then(result => {
        return res.status(200).json({
            result: result,
            xLabel: "Date",
            yLabel: "Revenue generated"
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
    
};

module.exports.getRevenueByDay = (req,res) => {
    const outletid = req.query.outletid;
    const monthIn = req.query.month
    const yearIn = req.query.year

    Order.aggregate([
        {
            $match: {
                outlet: new mongoose.Types.ObjectId(outletid),
                status: "COMPLETED",
                createdAt: {
                    $gte: new Date(yearIn, monthIn-1, 1),
                    $lt: new Date(yearIn, monthIn)
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%d", date: "$createdAt" }
                },
                totalPrice: { $sum: "$totalPrice"}
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ])
    .exec()
    .then(result => {
        return res.status(200).json({
            result: result,
            xLabel: "Date",
            yLabel: "Revenue generated"
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

module.exports.getRevenueByMonth = (req,res) => {
    const outletid = req.query.outletid;
    const yearIn = req.query.year

    Order.aggregate([
        {
            $match: {
                outlet: new mongoose.Types.ObjectId(outletid),
                status: "COMPLETED",
                createdAt: {
                    $gte: new Date(yearIn, 0, 1),
                    $lt: new Date(yearIn+1, 0, 1)
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%m", date: "$createdAt" }
                },
                totalPrice: { $sum: "$totalPrice"}
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ])
    .exec()
    .then(result => {
        return res.status(200).json({
            result: result,
            xLabel: "Month",
            yLabel: "Revenue generated"
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

module.exports.getRevenueByYear = (req,res) => {
    const outletid = req.query.outletid;

    const dateObject = new Date();
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObject.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const today = new Date(formattedDate)

    Order.aggregate([
        {
            $match: {
                outlet: new mongoose.Types.ObjectId(outletid),
                status: "COMPLETED",
                createdAt: {
                    $gte: new Date(today.getFullYear()-10, 0, 1),
                    $lt: new Date(today.getFullYear()+1, 0, 1)
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y", date: "$createdAt" }
                },
                totalPrice: { $sum: "$totalPrice"}
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ])
    .exec()
    .then(result => {
        return res.status(200).json({
            result: result,
            xLabel: "Year",
            yLabel: "Revenue generated"
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

// make sure to pass extra 2 in date
module.exports.compareOutletsByDay = (req,res) => {
    const ownerid = req.userData.ownerid
    const date = req.query.date
    const monthIn = req.query.month
    const yearIn = req.query.year
    
    const gtd = new Date(yearIn, monthIn - 1, date-1)
    gtd.setUTCHours(0,0,0,0)
    const ltd = new Date(yearIn, monthIn - 1, date)
    ltd.setUTCHours(0,0,0,0)

    Outlet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(ownerid)
            }
        },
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'outlet',
                as: 'orders'
            }
        },
        {
            $unwind: '$orders'
        },
        {
            $match: {
                "orders.status": "COMPLETED",
                "orders.createdAt": {
                    $gte: gtd,
                    $lt: ltd
                }
            }
        },
        {
            $group: {
                _id: {
                    outlet: '$outletName',
                    date: { $dateToString: { format: "%m-%d", date: "$orders.createdAt" }}
                },
                totalPrice: { $sum: '$orders.totalPrice' }
            }
        }
    ])
    .exec()
    .then(result => {
        return res.status(200).json({
            result: result
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

module.exports.compareOutletsByMonth = (req,res) => {
    const ownerid = req.userData.ownerid
    const monthIn = req.query.month
    const yearIn = req.query.year

    Outlet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(ownerid)
            }
        },
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'outlet',
                as: 'orders'
            }
        },
        {
            $unwind: '$orders'
        },
        {
            $match: {
                "orders.status": "COMPLETED",
                "orders.createdAt": {
                    $gte: new Date(yearIn, monthIn - 1, 1),
                    $lt: new Date(yearIn, monthIn, 1)
                }
            }
        },
        {
            $group: {
                _id: {
                    outlet: '$outletName',
                    date: { $dateToString: { format: "%m", date: "$orders.createdAt" }}
                },
                totalPrice: { $sum: '$orders.totalPrice' }
            }
        }
    ])
    .exec()
    .then(result => {
        return res.status(200).json({
            result: result
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

module.exports.compareOutletsByYear = (req,res) => {
    const ownerid = req.userData.ownerid
    const yearIn = req.query.year

    Outlet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(ownerid)
            }
        },
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'outlet',
                as: 'orders'
            }
        },
        {
            $unwind: '$orders'
        },
        {
            $match: {
                "orders.status": "COMPLETED",
                "orders.createdAt": {
                    $gte: new Date(yearIn, 0, 1),
                    $lt: new Date(yearIn+1, 0, 1)
                }
            }
        },
        {
            $group: {
                _id: {
                    outlet: '$outletName',
                    date: { $dateToString: { format: "%Y", date: "$orders.createdAt" }}
                },
                totalPrice: { $sum: '$orders.totalPrice' }
            }
        }
    ])
    .exec()
    .then(result => {
        return res.status(200).json({
            result: result
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

module.exports.productCountByDay = (req,res) => {
    const outletid = req.query.outletid
    const date = req.query.date
    const monthIn = req.query.month
    const yearIn = req.query.year
    
    const gtd = new Date(yearIn, monthIn - 1, date-1)
    gtd.setUTCHours(0,0,0,0)
    const ltd = new Date(yearIn, monthIn - 1, date)
    ltd.setUTCHours(0,0,0,0)

    Order.aggregate([
        {
            $match: {
                outlet: new mongoose.Types.ObjectId(outletid),
                status: "COMPLETED",
                createdAt: {
                    $gte: gtd,
                    $lt: ltd
                }
            }
        },
        {
            $unwind: "$products",
        },
        {
            $lookup: {
                from: "products",
                localField: "products.item",
                foreignField: "_id",
                as: "products.item"
            }
        },
        {
            $unwind: "$products.item"
        },
        {
            $project: {
                "products.item.productName": 1
            }
        },
        {
            $group: {
                _id: "$products.item.productName",
                count: { $sum: 1 }
            }
        }
        
    ])
    .exec()
    .then(result => {
        return res.status(200).json({
            result: result
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })

}

module.exports.productCountByMonth = (req,res) => {
    const outletid = req.query.outletid
    const monthIn = req.query.month
    const yearIn = req.query.year
    
    Order.aggregate([
        {
            $match: {
                outlet: new mongoose.Types.ObjectId(outletid),
                status: "COMPLETED",
                createdAt: {
                    $gte: new Date(yearIn, monthIn - 1, 1),
                    $lt: new Date(yearIn, monthIn, 1)
                }
            }
        },
        {
            $unwind: "$products",
        },
        {
            $lookup: {
                from: "products",
                localField: "products.item",
                foreignField: "_id",
                as: "products.item"
            }
        },
        {
            $unwind: "$products.item"
        },
        {
            $project: {
                "products.item.productName": 1
            }
        },
        {
            $group: {
                _id: "$products.item.productName",
                count: { $sum: 1 }
            }
        }
        
    ])
    .exec()
    .then(result => {
        return res.status(200).json({
            result: result
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })

}

module.exports.productCountByYear = (req,res) => {
    const outletid = req.query.outletid
    const yearIn = req.query.year
 
    Order.aggregate([
        {
            $match: {
                outlet: new mongoose.Types.ObjectId(outletid),
                status: "COMPLETED",
                createdAt: {
                    $gte: new Date(yearIn, 0, 1),
                    $lt: new Date(yearIn+1, 0, 1)
                }
            }
        },
        {
            $unwind: "$products",
        },
        {
            $lookup: {
                from: "products",
                localField: "products.item",
                foreignField: "_id",
                as: "products.item"
            }
        },
        {
            $unwind: "$products.item"
        },
        {
            $project: {
                "products.item.productName": 1
            }
        },
        {
            $group: {
                _id: "$products.item.productName",
                count: { $sum: 1 }
            }
        }
        
    ])
    .exec()
    .then(result => {
        return res.status(200).json({
            result: result
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })

}





/**
    
    {
            $match: {
                "orders.status": "COMPLETED",
                "orders.createdAt": {
                    $gte: new Date(yearIn, monthIn-1, 1),
                    $lt: new Date(yearIn, monthIn)
                }
            }
        },
        {
            $group: {
                // _id: {
                //     outlet: '$outletName',
                //     $dateToString: { format: "%Y-%m-%d", date: "orders.createdAt" }
                // },
                // totalPrice: { $sum: '$orders.totalPrice' }
                _id: null,
                array: { $push: "$$ROOT"}
            }
        }

    ###########  Get revenue by month ###########
    
    const outletid = req.body.outletid;
    const monthIn = 7
    const yearIn = 2023

    const dateObject = new Date();
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObject.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const today = new Date(formattedDate)
    
    Order.aggregate([
        {
            $match: {
                outlet: new mongoose.Types.ObjectId(outletid),
                status: "COMPLETED",
                createdAt: {
                    $gte: new Date(yearIn, monthIn-1, 1),
                    $lt: new Date(yearIn, monthIn)
                }
            }
        },
        {
            $group: {
                _id: null,
                totalPrice: { $sum: "$totalPrice"}
            }
        }
    ])

    ###########  Get revenue for each day of a month and year ###########

    Order.aggregate([
        {
            $match: {
                outlet: new mongoose.Types.ObjectId(outletid),
                status: "COMPLETED",
                createdAt: {
                    $gte: new Date(yearIn, monthIn-1, 1),
                    $lt: new Date(yearIn, monthIn)
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                totalPrice: { $sum: "$totalPrice"}
            }
        },
        {
            $sort: {
                _id: -1
            }
        }
    ])

    ###########  Get revenue for each month of a year  ###########

    Order.aggregate([
        {
            $match: {
                outlet: new mongoose.Types.ObjectId(outletid),
                status: "COMPLETED",
                createdAt: {
                    $gte: new Date(yearIn, 0, 1),
                    $lt: new Date(yearIn+1, 0, 1)
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%m", date: "$createdAt" }
                },
                totalPrice: { $sum: "$totalPrice"}
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ])
    .exec()
    .then(result => {
        return res.status(200).json({
            result
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })

    ###########  Get revenue for past 10 years  ###########

    Order.aggregate([
        {
            $match: {
                outlet: new mongoose.Types.ObjectId(outletid),
                status: "COMPLETED",
                createdAt: {
                    $gte: new Date(today.getFullYear()-10, 0, 1),
                    $lt: new Date(today.getFullYear()+1, 0, 1)
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y", date: "$createdAt" }
                },
                totalPrice: { $sum: "$totalPrice"}
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ])

    ###########  Get count of all distinct items by status completed  ###########

    Order.aggregate([
        {
            $match: {
                outlet: new mongoose.Types.ObjectId(outletid),
                status: "COMPLETED",
            }
        },
        {
            $unwind: "$products",
        },
        {
            $lookup: {
                from: "products",
                localField: "products.item",
                foreignField: "_id",
                as: "products.item"
            }
        },
        {
            $unwind: "$products.item"
        },
        {
            $project: {
                "products.item.productName": 1
            }
        },
        {
            $group: {
                _id: "$products.item.productName",
                count: { $sum: 1 }
            }
        }
        
    ])
 */