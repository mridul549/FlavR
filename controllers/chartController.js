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
            result
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
    
    
    
    // const currentYear = new Date().getFullYear();
    // const currentMonth = new Date().getMonth() + 1;
    // Order.aggregate([
    //     {
    //         $match: {
    //             outlet: new mongoose.Types.ObjectId(outletid),
    //             createdAt: {
    //                 $gte: new Date(currentYear, currentMonth - 1, 1),
    //                 $lt: new Date(currentYear, currentMonth, 1),
    //             },
    //         },
    //     },
    //     {
    //         $unwind: "$products",
    //     },
    //     {
    //         $group: {
    //             _id: "$products.item",
    //             count: { $sum: 1 },
    //         },
    //     },
    //     {
    //         $lookup: {
    //             from: "Product",
    //             localField: "_id",
    //             foreignField: "_id",
    //             as: "productDetails",
    //         },
    //     },
    //     {
    //         $project: {
    //             item: { $arrayElemAt: ["$productDetails.productName", 0] },
    //             count: 1,
    //             _id: 0,
    //         },
    //     },
    // ]);

    
};

/**
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