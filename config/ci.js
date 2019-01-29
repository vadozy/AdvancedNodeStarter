module.exports = {
    googleClientID: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    mongoURI: 'mongodb://localhost:27017/blog_ci', // first time mongoose will auto create it
    cookieKey: 'CI Secret 123',
    redisUrl: 'redis://localhost:6379'
  };
  