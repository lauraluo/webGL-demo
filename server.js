/**
 * Module dependencies.
 */

var express = require('express');

// Path to our public directory
var pub = __dirname + '/public';
var app = express();

app.use(express.static(pub));
app.set('views', __dirname + '/views');

app.set('view engine', 'jade');


function User(name, email) {
    this.name = name;
    this.email = email;
}

var users = [
    new User('tj', 'tj@vision-media.ca'), new User('ciaran', 'ciaranj@gmail.com'), new User('aaron', 'aaron.heckmann+github@gmail.com')
];

app.get('/', function(req, res) {
    res.render('index', {
        data: null
    });
});

app.get('/login', function(req, res) {
    res.render('login', {
        data: null
    });
});

app.get('/todo', function(req, res) {
    res.render('todo', {
        data: null
    });
});

app.get('/dialogDemo', function(req, res) {
    res.render('dialogdemo', {
        data: null
    });
});


app.use(function(err, req, res, next) {
    res.send(err.stack);
});

/* istanbul ignore next */
if (!module.parent) {
    app.listen(3002, function() {
        console.log('port:3002');
    });
}