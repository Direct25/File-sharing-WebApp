

// import bodyParser from 'body-parser';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import express from 'express';
// import routes from './routes/route.js';

// dotenv.config(
//  {
//      path: "./.env"
//  }
// );

// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware

// app.use(cors({
//     origin: [
//         'https://client-5114w5ond-direct25s-projects.vercel.app',
//         'http://localhost:3000'
//     ],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // API Routes
// app.use('/api', routes);

// // Root Route
// app.get('/', (req, res) => {
//     res.send('Welcome to FileTransferHub backend');
// });

// // Error Handling Middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ error: 'Something went wrong!' });
// });

// // Start Server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// }).on('error', (err) => {
//     console.error('Failed to start server:', err);
// });


import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import routes from './routes/route.js';

dotenv.config(
 {
     path: "./.env"
 }
);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// app.use(cors({
//     origin: [
//         'https://file-sharing-frontend-4g1z.onrender.com', // ← Add this line
//         'https://client-p7ybcxo24-direct25s-projects.vercel.app',
//         'http://localhost:3000',
//         '*'
//     ],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(cors({
  origin: true, // allow all origins
  credentials: true
}));


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