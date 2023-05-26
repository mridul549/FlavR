const express    = require('express');
const mongoose   = require('mongoose');
const bodyParser = require('body-parser');
const morgan     = require('morgan');
const fileUpload = require('express-fileupload');

const app = express();
mongoose.connect("mongodb+srv://mridul549:xTKgkDyitxpKcOY7@cluster0.iuoe1mb.mongodb.net/?retryWrites=true&w=majority")

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles: true
}))

 
// implementing CORS security mechanism
app.use((req,res,next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if(req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
})

app.use('/', require('./routes/home'));

app.listen(process.env.PORT || 3000, (req,res) => {
    console.log('Server Started');
})