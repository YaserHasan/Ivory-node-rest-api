require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const auth = require('./api/routes/auth_route');
const products = require('./api/routes/products_route');
const cart = require('./api/routes/cart_route');
const orders = require('./api/routes/orders_route');


// Connect to Database
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))


const app = express();
app.use(cors());
app.use(express.json());
app.use('/images/products/categories', express.static('./images/product_categories'));

app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/cart', cart);
app.use('/api/orders', orders);


const port = process.env.PORT || 3000;
console.log(`server up and running on port: ${port}`);
app.listen(port);