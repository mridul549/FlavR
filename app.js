const express  = require('express');

const app = express();

app.use('/', require('./routes/home'));

app.listen(process.env.PORT || 3000, (req,res) => {
    console.log('Server Started');
})