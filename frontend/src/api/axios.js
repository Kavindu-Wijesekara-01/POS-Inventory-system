import axios from 'axios';

// Backend එක run වෙන Port එක මෙතනට දෙන්න (අපි කලින් හැදුවේ port 5000)
const instance = axios.create({
    baseURL: 'http://localhost:5000/api' 
});

export default instance;