const mongoose   = require('mongoose')
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const fs         = require('fs')
const ejs        = require('ejs')
const Otp        = require('../models/otp')
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
 */
async function generateOTP (key) {
    const { customAlphabet } = await import('nanoid');
    const alphabet = '0123456789';
    const nanoid = customAlphabet(alphabet, 4);
    const nano = nanoid()
    let date = new Date()
    date = date.setMinutes(date.getMinutes()+15)
    try {
        await Otp.findOneAndUpdate(
            { createdBy: key },
            {
                $set: {
                    code: nano,
                    createdBy: key,
                    expiry: date
                }, 
            },
            { upsert: true, new: true, maxTimeMS: 60000 }
        )
        return nano
    } catch (error) {
        console.log(error);
        throw error
    }
}

module.exports.sendMail = async (key) => {
    const otpnew = await generateOTP(key)

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
    const key = req.body.email

    try {
        await mailQueue.add({ key })
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