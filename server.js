import injectRoutes from './routes';

const express = require('express');

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json({ limit: '200mb' }));
injectRoutes(app); // Add routes to app

app.listen(PORT);

module.exports = app;
