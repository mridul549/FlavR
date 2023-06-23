const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const serviceAccount = require('../flavr-firebase-config.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports = db





// const firebase = require('firebase')

// const firebaseConfig = {
//     apiKey: process.env.FB_API_KEY,
//     authDomain: process.env.FB_AUTH_DOMAIN,
//     projectId: process.env.FB_PROJECT_ID,
//     storageBucket: process.env.FB_STORAGE_BUCKET,
//     messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
//     appId: process.env.FB_APP_ID,
//     measurementId: process.env.FB_MEASUREMENT_ID
// };

// const db = firebase.initializeApp(firebaseConfig)

// module.exports = db