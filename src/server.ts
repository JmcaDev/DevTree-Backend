import 'dotenv/config'
import express from 'express';

import { connectDB } from './config/db.js';

import router from './router.js';

const app = express()

//Conexion a la base de datos
connectDB()

//Habilitar datos JSON
app.use(express.json())

app.use('/', router)


export default app