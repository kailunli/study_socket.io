'use strict'
const socketio = require('socket.io');
const cluster = require('cluster');
const sticky  = require('sticky-session');
const socketredis = require('socket.io-redis');

const serverConf = {
	port: 3000,
};
const server = require('http').createServer((req, res)=>{
	console.log(cluster.worker.id + ' ' + cluster.worker.process.pid);
});
server.setMaxListeners(0);
if (!sticky.listen(server, serverConf.port)) {
	// Master code
	server.once('listening', () => {
		console.log(`Server started on ${serverConf.port} port.`)
	});
	server.on('error', (err) => {
		console.log(err)
	});
} else {
	// Worker code
	process.setMaxListeners(0);
	const io = socketio(server, {
		transports: ['websocket', 'polling'],
		pingTimeout: 60000,
		pingInterval: 30000,
	});
	let socketredisConf = {
		host: '127.0.0.1',
		port: 6379,
		requestsTimeout: 5000		
	};
	io.adapter(socketredis(socketredisConf));
	
	/* 在此将io传递给其他文件，实现WS命令发送, Eg：require('./chat/private')(io) */
	
	console.log(`Worker ${process.pid} started!`)
}
