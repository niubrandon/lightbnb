const database = require('./database');
const apiRoutes = require('./apiRoutes');
const userRoutes = require('./userRoutes');

const path = require('path');

const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');

const app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// /api/endpoints
const apiRouter = express.Router();
apiRoutes(apiRouter, database);
app.use('/api', apiRouter);

// /user/endpoints
const userRouter = express.Router();
userRoutes(userRouter, database);
app.use('/users', userRouter);

app.use(express.static(path.join(__dirname, '../public')));

//modify later
app.post('/reservations/:id', (req, res) => {
  const userId = req.session.userId;
  console.log("printout the reservation body", req.params.id);
  database.addReservation({...req.body, owner_id: userId, prop_id: req.params.id})
    .then((reservation) => {
      res.send(reservation);
    }
    ).catch(e => {
      console.error(e);
      res.send(e);
    });
});

app.get("/test", (req, res) => {
  res.send("🤗");
});

const port = process.env.PORT || 3030;
app.listen(port, (err) => console.log(err || `listening on port ${port} 😎`));