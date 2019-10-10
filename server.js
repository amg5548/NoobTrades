const express = require('express');
const secure = require('express-force-https');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(secure);
app.use(bodyParser.json());
app.use(express.static('./'));
app.use('/api', require('./js/routes/api'));
app.listen(8081, function() {
	console.log('Express server listening on port 8081');
});

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(`mongodb+srv://amg5548:${process.env.MONGO_PASS}@cluster0-wmxr5.mongodb.net/NoobTrades?retryWrites=true`);
mongoose.Promise = global.Promise;
