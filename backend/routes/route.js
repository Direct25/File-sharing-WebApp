// import express from 'express';
// // import { getSignedUrls } from '../controller/image-controller.js';
// import{ getSignedUrls} from '../s3.js';

// const router = express.Router();

// // Change the route to handle POST requests for multiple file uploads
// router.post('/file-urls', getSignedUrls);

// export default router;

import express from 'express';
import { getSignedUrls } from '../s3.js';

const router = express.Router();

// CHANGED: Path is now '/upload' to match the frontend code
router.post('/upload', getSignedUrls);

export default router;