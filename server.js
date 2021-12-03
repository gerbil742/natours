const dotenv = require('dotenv');
dotenv.config({ path: './config.env' }); // This has to happen before we require the app file. otherwise, when we read the app file, the environment vars will be undefined.

const app = require('./app');

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
