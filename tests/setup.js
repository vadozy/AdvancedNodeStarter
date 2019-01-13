jest.setTimeout(10000); // change default 5 sec to 10 sec (not necessary really)

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.connect(keys.mongoURI, { useNewUrlParser: true });
