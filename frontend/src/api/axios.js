import axios from 'axios';

// Microservice Architecture: API Gateway (Nginx) එකට point කරනවා
// Docker Compose එකේදී port 3000 එකෙන් Nginx Gateway එක run වෙනවා
// Local dev (without Docker) - use http://localhost:3000/api
const instance = axios.create({
    baseURL: 'http://localhost:3000/api' 
});

export default instance;