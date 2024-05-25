const express = require('express');
const cors = require('cors');
const userRoutes = require('./api/userRoutes');
const loginRoute = require('./api/loginRoute');
const orderRoutes = require('./api/orderRoutes');

const app = express();
const port = 3002;

app.use(express.json());
app.use(cors());

app.use(express.static('public'));

// Rutas API
app.use('/api/users', userRoutes);
app.use('/api/login', loginRoute);
app.use('/api/orders', orderRoutes);



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening at http://192.168.1.72:${port}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});
