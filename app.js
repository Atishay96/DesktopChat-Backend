const express = require('express');
const app = express();
const http = require('http');
let io = require('socket.io');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cluster = require('cluster');
const mongoSanitize = require('express-mongo-sanitize');
const expressSession = require('express-session');
const chalk = require('chalk');
const helmet = require('helmet');
const sockets = require('./helper/sockets');
const sticky = require('sticky-session');
//production mode
const mongoose = require('mongoose');
const numWorkers = require('os').cpus().length;

//development mode
// const mongoose = require('mongoose').set('debug', true);

//routes variables
const UserRoutes = require('./routes/UserRoutes');
const webRoutes = require('./routes/webRoutes');

mongoose.Promise = global.Promise;
//connect mongoose

require('dotenv').config();
if(process.env.mode === 'development'){
    process.env.port = process.env.devPort;
    process.env.database = process.env.devDatabase;
}else{
    process.env.port = process.env.prodPort;
    process.env.database = process.env.prodDatabase;
}

mongoose.connect(process.env.database).catch((err)=>{
  if(err){
    console.log(chalk.white.bgBlack.bold(err));
  }else{
    console.log(chalk.green("MongoDB up and running"));
  }
});

app.use(expressSession({secret: process.env.secretKey, resave:false, saveUninitialized: true}));
// view engine setup
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//CORS ISSUE
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,     Content-Type, Accept");
    next();
});
// to protect code from mongo injection
app.use(mongoSanitize());
app.use(helmet())

//routes
app.use('/api', UserRoutes);
app.use('/chat', webRoutes);

// catch 404 and render not found page
app.use((req, res, next)=>{
  res.status(404).send({message:"Not Found"});
});
// const server = http.listen(process.env.port, ()=>{
//     console.log(chalk.green('Process ' + process.pid + ' is listening to all incoming requests'));
// });


if(cluster.isMaster) {

    console.log(chalk.green('Master cluster setting up ' + numWorkers + ' workers...'));

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }
    var i = 0;

    if (!process.env.mode) process.env.mode = 'production';

    cluster.on('online', (worker)=>{
        console.log(chalk.yellow('Worker ' + worker.process.pid + ' is online'));
    });
    // consoling enviorment variables
    console.log(chalk.green('Port :'+ process.env.port));
    console.log(chalk.green('Database :'+ process.env.database));
    console.log(chalk.green('Mode :'+ process.env.mode));
    cluster.on('exit', (worker, code, signal)=>{
        console.log(chalk.red('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal));
        console.log(chalk.yellow('Starting a new worker'));
        cluster.fork();
    });
} else {        
    start();
}

function start() {
    var httpServer = http.createServer( app );
    var server = httpServer.listen( process.env.port );
    io = io.listen(server);
    app.set('server', server);
    io.on('connection', (socket) => {
        app.set('socketio', io);
        socket.on('disconnect',()=>{
            console.log('disconnected');
        })        
        sockets.init(io, socket);
    })
    module.exports = server;
}