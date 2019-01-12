const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {
    return new User({
        googleId: 'dummy_id',
        displayName: 'Test User'
    }).save();
};
