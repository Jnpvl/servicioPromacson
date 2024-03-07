
const express = require('express');
const cors = require('cors');
const userRoutes = require('./api/userRoutes'); 
const loginRoute = require('./api/loginRoute')
const orderRoutes = require('./api/orderRoutes');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());


app.use('/api/users', userRoutes);
app.use('/api/login', loginRoute);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

