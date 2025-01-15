import axios from 'axios';


const API_URL = 'http://localhost:3001/api';

export const getSignedUrls = async (files) => {
    try {
        const response = await axios.post(`${API_URL}/file-urls`, { files });
        return response.data;
    } catch (error) {
        console.error('Error while calling the API', error.message);
        return error.response.data;
    }
}