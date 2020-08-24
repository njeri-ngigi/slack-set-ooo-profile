const express = require('express');
const bodyParser = require('body-parser');
const { setOOOProfile, helloOOOProfile } = require('./controller');
const { PORT } = require('./env');

const app = express(); 
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.post('/', helloOOOProfile);
app.post('/slack-interactive', urlencodedParser, setOOOProfile);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
