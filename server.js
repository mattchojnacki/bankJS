var fs = require('fs'); // operowanie na plikach
var http = require('http'); // obsługa http
var path = require('path'); // składanie ścierzek
var mime = require('mime'); // zamienia rozszerzenie plików na content type

var debugLog = true; // turning on logging to the console

function serveFile(rep, fileName, errorCode, message) {
	
	if(debugLog) console.log('Serving file ' + fileName + (message ? ' with message \'' + message + '\'': ''));
	
    fs.readFile(fileName, function(err, data) {
		if(err) {
            serveError(rep, 404, 'Document ' + fileName + ' not found');
        } else {
			rep.writeHead(errorCode, message, { 'Content-Type': mime.getType(path.basename(fileName)) });
			if(message) {
				data = data.toString().replace('{errMsg}', rep.statusMessage).replace('{errCode}', rep.statusCode);
			}
			rep.end(data);
        }
      });
}

function serveError(rep, error, message) {
	serveFile(rep, 'html/error.html', error, message);
}

var listeningPort = 8888;
var konto ={saldo: 500,limit : -100}
http.createServer().on('request', function (req, rep) {
	
	if(debugLog) console.log('HTTP request URL: ' + req.url);
	
	switch(req.url) {
		case '/':
			serveFile(rep, 'html/index.html', 200, '');
			break;
		case '/favicon.ico':
			serveFile(rep, 'img/favicon.ico', 200, '');
			break;
		case '/konto':
			switch (req.method){
				case 'GET':
					rep.writeHead(200,'OK',{'Content-type':'application/json'});
					rep.end(JSON.stringify(konto));
					break;
                case 'POST':
                    var data = '';
                    req.on('data', function (part) {
                        data += part;
                    }).on('end', function () {
                        var arg = JSON.parse(data);
                        konto.saldo += arg.kwota;
                        rep.writeHead(200, 'OK', {'Content-type': 'application/json'});
                        rep.end(JSON.stringify(konto));
                    });
                    break;
				default:
					rep.writeHead(501,'Not implemeted',{'Content-type':'application/json'});
					rep.end(JSON.stringify({error : "Not implemented"}));
			}
			break;
		default:
			if(/^\/(html|css|js|fonts|img)\//.test(req.url)) {
				var fileName = path.normalize('./' + req.url)
				serveFile(rep, fileName, 200, '');
			} else {	
				serveError(rep, 403, 'Access denied');
			}
		}
	}
).listen(listeningPort);