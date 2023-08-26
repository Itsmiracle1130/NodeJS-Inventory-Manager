// import modules
const http = require('http');
const path = require('path');
const fs = require('fs');


// declare variables
const html = path.join(__dirname, 'index.html');
const error = path.join(__dirname, '404.html');
const host = 'localhost';
const port = 4000;

       
// create an handler
function requestHandler(req, res){
    if(req.url === '/index.html'){
        try{
            res.setHeader('content-type', 'text-html')
            res.writeHeader(200);
            const htmlFile = fs.readFileSync(html) 
            res.write(htmlFile);
            res.end();
    
        } catch (err){
            res.setHeader('content-type', 'text-html')
            res.writeHeader(404)
            const errFile = fs.readFileSync(error)
            res.write(errFile);
            console.log(err);
            res.end();
        }
       
    }
    else {
        res.setHeader('content-type', 'text-html')
        res.writeHeader(404)
        const errFile = fs.readFileSync(error)
        res.write(errFile)
        res.end();
    }
    
}

// create a server
const server = http.createServer(requestHandler);
server.listen(port, host, ()=>{
    console.log(`Server running at http://${host}:${port}`);

})

