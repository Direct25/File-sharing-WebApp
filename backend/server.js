// import express from 'express';
// import dotenv from 'dotenv';
// import routes from './routes/route.js';
// import cors from 'cors';
// import bodyParser from 'body-parser';

// dotenv.config();

// const app = express();
// app.use(express.json()); // To parse JSON bodies

// app.use(cors());
// // app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/api', routes);

// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// }).on('error', (err) => {
//     console.error('Failed to start server:', err);
// });

import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/route.js';
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to FileTransferHub backend');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('Failed to start server:', err);
});
