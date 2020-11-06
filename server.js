const app = require('express')();

app.get('/', (req, res) => res.send('InviteManager'));

module.exports = () => {
  app.listen(7000);
}