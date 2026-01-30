import express from 'express';
import { getSignedUrls } from '../s3.js';

const router = express.Router();

router.post('/upload', getSignedUrls);

export default router;