import mongoose from 'mongoose';
import colors from 'colors'

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI

    if(!mongoUri){
      throw new Error('La variable de entorno MONGO_URI no esta configurada')
    }

    const {connection} = await mongoose.connect(mongoUri)
    const url = `${connection.host}:${connection.port}`
    console.log(colors.cyan(`MongoDB Conectado en: ${url}`))
    
  } catch (error) {
    console.log(colors.red(`Error: ${error}`))
    process.exit(1)
  }
}