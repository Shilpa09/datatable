var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/getData', function(req, res) {
    console.log("rest api call");
    fs.readFile('./public/sample_data.json', 'utf8', function(err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        res.send(obj);
    });
});
app.post("/save", function(req, res, cb) {
    //console.log("In post api call");
    fs.readFile('./public/' + req.body.url, 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            obj = JSON.parse(data); //now it an object
            try {
                obj.map(function(record, index) {
                    if (record.id == req.body.id) {
                        if (typeof record[req.body.colName] === 'string') {
                            record[req.body.colName] = req.body.newVal;
                        } else {
                            record[req.body.colName] = parseInt(req.body.newVal);
                        }
                        return record;
                    }
                    return record;
                });
                json = JSON.stringify(obj); //convert it back to json
                fs.writeFile('./public/' + req.body.url, json, 'utf8', cb);
            } catch (exp) {
                console.log("Exception while updating data file", exp);
            }
            // write it back 
            res.sendFile(path.join(__dirname + '/index.html'));
        }
    });
});
app.use(express.static(path.join(__dirname, "public")));
app.listen(3000);