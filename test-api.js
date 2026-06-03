const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:4000/api/roadmap/generate', {
      career: 'react', currentLevel: 'beginner'
    });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    console.error('ERROR STATUS:', err.response?.status);
    console.error('ERROR DATA:', err.response?.data);
  }
}
test();
