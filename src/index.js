const express = require('express');
const bodyParser = require('body-parser');
const { setOOOProfile, helloOOOProfile } = require('./controller');
const { PORT } = require('./env');

const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/', helloOOOProfile);
app.post('/redirect', (req, res) => {
  res.writeHead(302, {
    location: 'https://slack.com/oauth/v2/authorize?client_id=521383078068.1307261959974&scope=chat:write,commands&user_scope=chat:write,dnd:read,dnd:write,users.profile:read,users.profile:write,users:write',
  });
  res.end();
});
app.post('/slack-interactive', urlencodedParser, setOOOProfile);

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
