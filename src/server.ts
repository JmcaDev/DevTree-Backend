import express from 'express';

import router from './router.js';

const app = express()

//Habilitar datos JSON
app.use(express.json())

app.use('/api', router)


export default app