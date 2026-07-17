import 'dotenv/config'
import express from 'express';
import cors from 'cors';

import { connectDB } from './config/db.js';

import router from './router.js';
import { corsConfig } from './config/cors.js';

connectDB()

const app = express()

//Cors
app.use(cors(corsConfig))

//Conexion a la base de datos

//Habilitar datos JSON
app.use(express.json())

app.use('/', router)


export default app