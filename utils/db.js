import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_URI = process.env.DB_URI;
console.log(DB_URI)

const createDBConnection = async () => {
	try {
		await mongoose.connect(DB_URI);
		console.log('DB CONNECTED SUCCESSFULLY!!...');
	} catch (error) {
		console.error(
			'AN ERROR OCCURED WHILE CONNECTING TO DB:',
			error.message
		);
		process.exit(1);
	}
};

export default createDBConnection;
