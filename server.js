// require is the import syntax for node -- imports and stores into var
const http = require('http'); // default node package
const debug = require('debug')('node-angular');
const app = require('./backend/app');

// makes sure when we set up theport that it's a valid number
const normalizePort = val => {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    return val; // named pipe
  }
  if (port >= 0) {
    return port; // port number
  }
  return false;
};

// will check what error occured
const onError = error => {
 if (error.syscall !== "listen") {
   throw error;
 }
 const bind = typeof addr === "string" ? "pipe" + addr : "port" + port;
 switch (error.code) {
   case "EACCES":
     console.error(bind + " requires elevated privileges");
     process.exit(1);
     break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
 }
};

// we log that we are now listening to incoming req
const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe" + addr : "port" + port;
  debug("Listening on " + bind);
};

// setting up the port on the express app
const port = normalizePort(process.env.PORT || "3000)");
app.set("port", port);

// creating the server and2 listeners to errors and when we're listening
// tells us if something went wrong when starting the server
const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
server.listen(port);























/*

// BASIC CODE WE REPLACED

const port = process.env.PORT || 3000;

app.set('port', port);
const server = http.createServer(app); // want to use app as a listener for incoming req
  // res.end("This is my first response!"); // end writing to response stream


server.listen(port); // env varibales are dynamically injected variables

*/
