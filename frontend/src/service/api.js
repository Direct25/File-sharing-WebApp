// import axios from 'axios';


// const API_URL = "https://serve-l8lriyooc-direct25s-projects.vercel.app/api" || 'http://localhost:3001/api'; // vercel ka backend link

// export const getSignedUrls = async (files) => {
//     try {
//         const response = await axios.post(`${API_URL}/file-urls`, { files });
//         return response.data;
//     } catch (error) {
//         console.error('Error while calling the API', error.message);
//         return error.response.data;
//     }
// }

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";


export const getSignedUrls = async (files) => {
    try {
        const response = await axios.post(`${API_URL}/file-urls`, { files });
        return response.data;
    } catch (error) {
        console.error('Error while calling the API', error.message);
        if (error.response) {
            return error.response.data;
        }
        throw error;
    }
}