const http = require('http');
const fs = require("fs");
const mysql_package = require('mysql');


const hostname = '127.0.0.1';
const port = 3000;

//establishing database connection
const connection_data = mysql_package.createConnection({ 
  host: "localhost", 
  user: "root", 
  password: "" ,
  database:"robotinfo"

}); 

function insert(temp,moisture){
  
  connection_data.connect(function(err) {
    connection_data.query(`INSERT INTO robotinfo (temperature, moisture) VALUES (${temp},${moisture});`, function (err, result) {
      if(err){
        console.log("error, couldnt insert data")
        console.log(err);
      }
    });
  });
}

//handeling /retrive request by getting the registered input from the database and sending it as simple text
function retrieve(res){
  connection_data.connect(function(err) {
    connection_data.query("SELECT * FROM robotinfo;", function (err, result) {
      if(err){
        console.log("error, couldnt retrieve data")
        console.log(err);
      }
      else{
        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 200;
        res.write(JSON.stringify(result));
        res.end()
      }
    });
  });
}

const server = http.createServer((req, res) => {

  //basic routing
  if (req.method == 'POST') {
    var body = '';

    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {
      var path = JSON.parse(body);
      console.log(path);
      insert(path)
        
    });

    res.statusCode = 200
    res.end();
    return;
  }

  if(req.url.startsWith("/robotinfo?")){
    let temp = req.url.substring(16,req.url.indexOf('&'));
    let moisture = req.url.substring(req.url.indexOf('&')+10);
    console.log("temperature = " + temp)
    console.log("moisture = " + moisture)
    insert(temp,moisture);
  }
  else if(req.url.startsWith("/retrieve")){
    retrieve(res);
  }
  else{
    res.statusCode = 404;
    res.end();
  }
  

});


server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});



