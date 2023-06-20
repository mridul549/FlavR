const express    = require('express');
const mongoose   = require('mongoose');
const bodyParser = require('body-parser');
const morgan     = require('morgan');
const fileUpload = require('express-fileupload');

const app = express();
const http = require('http').Server(app)
const io   = require('socket.io')(http)

io.on('connection', (socket) => {
    console.log('A client connected');
  
    socket.on('disconnect', () => {
      console.log('A client disconnected');
    });
});
  
module.exports = { io }

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING)

mongoose.connection.on('connected', function() {
    console.log("Connected to MongoDB")
});

app.use(fileUpload({
    useTempFiles: true
}))

// For the cashfree webhook
app.use(
    express.json({
        limit: '1mb',
        verify: (req, res, buf) => {
            req.rawBody = buf.toString();
        },
    })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Require bull queue processor for orders
require('./queue/index')

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