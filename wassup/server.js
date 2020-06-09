var fs = require('fs');
var Authentication = require('./utilities/Authentication');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
var app = express();
var auth;
var user;

var COMMENTS_FILE = path.join(__dirname, 'comments.json');

app.set('port', (process.env.PORT || 8499));
/*app.use(function(req, res, next) {
    

      
    if (req.headers.authorization) {
      
      auth = new Buffer(req.headers.authorization.substring(6), 'base64').toString().split(':');
    }

    
    if (!auth || auth[1] !== 'testpassword') {
        
        res.statusCode = 401;
        
        res.setHeader('WWW-Authenticate', 'Basic realm=' + req.authRealm);
        
        res.end('Unauthorized');
    } else {
       
        next();
    }
});*/
app.get('/', Authentication.SetRealm('other'));
app.use(function(request, response, next) {

    function unauthorized(response) {
        response.set('WWW-Authenticate', 'Basic realm=' + request.authRealm);
        return response.send(401);
    };

    user = basicAuth(request);

    if (!user  || !user.pass) {
        return unauthorized(response);
    };

    if (user.pass === 'bar') {
        return next();
    } else {
        return unauthorized(response);
    };
    
});
/*app.use(function(request, response, next) {

    function unauthorized(response) {
        response.set('WWW-Authenticate', 'Basic realm=' + request.authRealm);
        return response.send(401);
    };

    var user = basicAuth(request);

    if (!user || !user.name || !user.pass) {
        return unauthorized(response);
    };

    if (user.pass === 'testpassword') {
        return next();
    } else {
        return unauthorized(response);
    };
    
});*/


app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/comments', function(req, res) {
    fs.readFile(COMMENTS_FILE, function(err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/comments', function(req, res) {
    fs.readFile(COMMENTS_FILE, function(err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        var comments = JSON.parse(data);
        // NOTE: In a real implementation, we would likely rely on a database or
        // some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
        // treat Date.now() as unique-enough for our purposes.
        var newComment = {
           // id: Date.now(),
            author: user.name,
            text: req.body.text
        };
        comments.push(newComment);
        fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 4), function(err) {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            res.json(comments);
        });
    });
});

app.listen(app.get('port'), function() {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});