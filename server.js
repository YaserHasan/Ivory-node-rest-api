require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const auth = require('./api/routes/auth_route');
const products = require('./api/routes/products_route');
const orders = require('./api/routes/orders_route');


// Connect to Database
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))


const app = express();
app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/orders', orders);

app.listen(3000);