const cloudinary   = require('cloudinary').v2;
const CategoryIcon = require('../models/categoryicon')

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

module.exports.addIcon = (req,res) => {
    if(req.files && req.files.categoryIcon) {
        const file = req.files.categoryIcon
        cloudinary.uploader.upload(file.tempFilePath, (err, image) => {
            if(err) {
                return res.status(201).json({
                    error: "image upload failed"
                })
            }

            iconProp = {
                url: image.url,
                iconid: image.public_id
            }

            const categoryIcon = new CategoryIcon({
                _id: new mongoose.Types.ObjectId(),
                icon: iconProp
            })
        })
    }
}