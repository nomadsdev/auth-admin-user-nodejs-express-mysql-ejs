const express = require('express');
const bodyParser = require('express');
const session = require('express-session');
const mysql = require('mysql');

const app = express();
const port = 3000;

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'login_register_admin_user'
});

db.connect((err) => {
    if (err) {
        console.error('Error connection to database');
    } else {
        console.log('Connected to database');
    }
});

app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    if (username && password) {
        db.query(sql, [username, password], (err, results, fields) => {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/home');
            } else {
                res.send('Incorrect Username and/or Password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});

app.get('/home', (req, res) => {
    if (req.session.loggedin) {
      res.render('home', { username: req.session.username });
    } else {
      res.send('Please login to view this page!');
    }
    res.end();
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
    if (username && password && role) {
        db.query(sql, [username, password, role], (err, results, fields) => {
            if (err) throw err;
            res.redirect('/');
        });
    } else {
        res.send('Please enter Username, Password, and Role!');
        res.end();
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        } else {
            res.redirect('/');
        }
    });
});

app.listen(port, () => {
    console.log('Server is running');
});