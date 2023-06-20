const mongoose   = require('mongoose')
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const fs         = require('fs')
const ejs        = require('ejs')
const Otp        = require('../models/otp')
const User       = require('../models/user')
const Owner      = require('../models/owner')
const Maintainer = require('../models/maintainer')
const path       = require('path')
const Queue      = require('bull');

const mailQueue = new Queue('mailQueue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME
    }
})

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

const template = fs.readFileSync(path.join(__dirname, 'template.ejs'), 'utf8')

/**
 * Process to send and verify otp
 * 
 * 1. take details of the user
 * 2. on submission, send mail
 * 3. now in send mail function, first generate new otp
 * 4. put it in the html file
 * 5. send this further
 * 6. on submission of otp, verify the otp saved in the database
 * 7. if otp match, create a new user
 * 8. else, throw error
 * 
 * 
 * the role determines whether it's a user, owner or maintainer
 * user -> 0
 * owner -> 1
 * maintainer -> 2
 */
async function generateOTP (key,role) {
    const { customAlphabet } = await import('nanoid');
    const alphabet = '0123456789';
    const nanoid = customAlphabet(alphabet, 4);
    const nano = nanoid()
    let date = new Date()
    date = date.setMinutes(date.getMinutes()+15)

    try {
        await Otp.findOneAndUpdate(
            { 
                $and: [
                    { createdBy: key },
                    { role: role }
                ]
            },
            {
                $set: {
                    code: nano,
                    createdBy: key,
                    expiry: date,
                    role: role
                }, 
            },
            { upsert: true, new: true }
        )
        return nano
    } catch (error) {
        console.log(error);
        throw error
    }
}

module.exports.sendMail = async (key,role) => {
    const otpnew = await generateOTP(key,role)

    const renderedHTML = ejs.render(template, { otp: otpnew })
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'mridulverma478@gmail.com',
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                accessToken: accessToken
            }
        })

        const mailOptions = {
            from: 'FlavR <mridulverma478@gmail.com>',
            to: key,
            subject: `${otpnew} is your FlavR OTP Verification code`,
            html: renderedHTML
        }

        const result = await transport.sendMail(mailOptions)
        
    } catch (error) {
        console.log(error);
        throw error
    }
}

module.exports.reSendOTP = async (req,res) => {
    const key = req.body.key
    const role = req.body.role
    
    try {
        await mailQueue.add({ key, role })
        return res.status(201).json({
            action: "OTP Sent",
            message: "Please check your mailbox for the OTP."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error
        })
    }
}

module.exports.verifyOTP = (req,res) => {
    const otp = req.body.otp
    const key = req.body.key
    const role = req.body.role

    Otp.find({ 
        $and: [
            { createdBy: key },
            { role: role }
        ]
    })
    .exec()
    .then(async result => {
        if(result.length>0){
            const otpStored = result[0].code
            const expiry    = result[0].expiry
            const date      = new Date()

            if(otp===otpStored) {
                if(date<=expiry) {
                    switch (role) {
                        case 0:
                            verifyUser(key,req,res)
                            break;
                        case 1:
                            verifyOwner(key,req,res)
                            break;
                        case 2:
                            verifyMaintainer(key,req,res)
                            break;
                        default:
                            break;
                    }
    
                    await Otp.deleteOne({ createdBy: key })
                    
                    return res.status(200).json({
                        message: "OTP Verified, you can log in now."
                    })
                } else {
                    return res.status(400).json({
                        message: "OTP has expired, please request for a new one."
                    })
                }
            } else {
                return res.status(400).json({
                    message: "Invalid OTP, please try again."
                })
            }
        } else {
            return res.status(404).json({
                error: "Wrong key provided"
            })
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

const verifyUser = async (key,req,res) => {
    try {
        if(typeof key === 'string'){
            await User.updateOne({ email: key }, {
                $set: { verification: true }
            })
        } else {
            await User.updateOne({ mobile: key }, {
                $set: { verification: true }
            })
        }

    } catch (error) {
        return res.status(500).json({
            error: "Error while updating user"
        })
    }
}

const verifyOwner = async (key,req,res) => {
    try {
        if(typeof key === 'string'){
            await Owner.updateOne({ email: key }, {
                $set: { verification: true }
            })
        } else {
            await Owner.updateOne({ mobile: key }, {
                $set: { verification: true }
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: "Error while updating Owner"
        })
    }
}

const verifyMaintainer = async (key,req,res) => {
    try {
        if(typeof key === 'string'){
            await Maintainer.updateOne({ email: key }, {
                $set: { verification: true }
            })
        } else {
            await Maintainer.updateOne({ mobile: key }, {
                $set: { verification: true }
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: "Error while updating Maintainer"
        })
    }
}