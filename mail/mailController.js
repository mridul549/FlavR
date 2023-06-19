const mongoose   = require('mongoose')
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const fs         = require('fs')
const ejs        = require('ejs')
const Otp        = require('../models/otp')

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

const template = fs.readFileSync('/Users/starship/Desktop/Developer stuff/Projects/Nescafe/mail/template.ejs', 'utf8')

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
    const nanoid = customAlphabet(alphabet, 6);
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
            { upsert: true, new: true}
        )
        return nano
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error
        })
    }
}

async function sendMail(key) {
    const otpnew = await generateOTP(key)

    const data = {
        otp: otpnew
    }
    
    const renderedHTML = ejs.render(template, data)
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
            from: 'Mridul Verma <mridulverma478@gmail.com>',
            to: key,
            subject: 'FlavR OTP Verification',
            html: renderedHTML
        }

        const result = await transport.sendMail(mailOptions)
        return result
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Error while sending the mail"
        })
    }
}

module.exports.sendMail = (req,res) => {
    sendMail('mridulv.it.21@nitj.ac.in')
    .then(result => {
        return res.status(200).json({
            message: "Mail Sent"
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}