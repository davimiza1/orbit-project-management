import mongoose from 'mongoose';import { app } from './app.js';import { config } from './config.js';
mongoose.connect(config.MONGODB_URI).then(()=>app.listen(config.PORT,()=>console.log(`Orbit API listening on http://localhost:${config.PORT}`))).catch(error=>{console.error('MongoDB connection failed:',error.message);process.exit(1)});
