const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const fs         = require('fs')
const ejs        = require('ejs')

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

const template = fs.readFileSync('/Users/starship/Desktop/Developer stuff/Projects/Nescafe/mail/template.ejs', 'utf8')

const data = {
    otp: "4731"
}

const renderedHTML = ejs.render(template, data)

oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

async function sendMail() {
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
            to: 'vermavishu9999@gmail.com',
            subject: 'OTP Verification Mail',
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
    sendMail()
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