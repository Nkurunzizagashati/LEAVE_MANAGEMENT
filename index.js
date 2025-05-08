import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import createDBConnection from './utils/db.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();

const app = express();
const server = http.createServer(app);
const origin2 = 'http://localhost:5173';
const origin = 'http://localhost:5173';

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('dev'));

// Socket.io setup
const io = new Server(server, {
	cors: {
		origin: origin,
		methods: ['GET', 'POST'],
		credentials: true,
	},
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// CORS configuration
app.use(
	cors({
		origin: origin,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
	})
);

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});



// API routes
app.use('/api', routes);

app.get('/api', async (req, res) => {
	res.send('HELLO FROM WEBWALLET BACKEND');
});

// Socket.io connection handling
io.on('connection', (socket) => {
	console.log('A user connected:', socket.id);

	socket.on('disconnect', () => {
		console.log('A user disconnected:', socket.id);
	});
});

// Attach `io` to `app` so it can be used in controllers
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(err.status || 500).json({
		error: {
			message: err.message || 'Something went wrong!',
			status: err.status || 500
		}
	});
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		error: {
			message: 'Route not found',
			status: 404
		}
	});
});

// Connect to the Database
createDBConnection();

const PORT = process.env.PORT || 3002;

// Graceful shutdown
const gracefulShutdown = () => {
	console.log('Received shutdown signal');
	server.close(() => {
		console.log('Server closed');
		process.exit(0);
	});

	// Force close after 10s
	setTimeout(() => {
		console.error('Could not close connections in time, forcefully shutting down');
		process.exit(1);
	}, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

try {
	server.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
} catch (error) {
	console.error(
		`ERROR OCCURED WHILE INITIALIZING THE SERVER CONNECTION: ${error.message}`
	);
	process.exit(1);
}
