import {Request, Response} from 'express'
import slug from 'slug'
import colors from 'colors'
import User from '../models/User.js'
import { hashPassword } from '../utils/auth.js'

export const createAccount = async (req: Request, res: Response) => {
  
  const {email, password, handle} = req.body

  const userExists = await User.findOne({email})
  if(userExists){
    const error = new Error('El correo ya fue usado')
    return res.status(409).json({error: error.message})
  }

  const currentHandle = slug(handle, '-')
  const handleExists = await User.findOne({handle: currentHandle})
  if(handleExists){
    const error = new Error('Nombre de usuario no disponible')
    return res.status(409).json({error: error.message})
  }

  const user = new User(req.body)
  user.password = await hashPassword(password)
  user.handle = currentHandle

  try {
    await user.save()
    res.status(201).json({mensaje: 'Usuario creado correctamente'})
  } catch (error) {
    console.log(colors.red(`Error: ${error}`))
  }
}