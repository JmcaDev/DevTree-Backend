import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import slug from 'slug'
import colors from 'colors'
import User from '../models/User.js'
import { checkPassword, hashPassword } from '../utils/auth.js'

export const createAccount = async (req: Request, res: Response) => {
  
  //Manejar Errores
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

export const loginAccount = async (req: Request, res: Response) => {

  //Manejar Errores
  let errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }

  const { email, password } = req.body

  //Revisar si el usuario esta registrado
  const user = await User.findOne({email})
  if(!user){
    const error = new Error('El usuario no existe')
    return res.status(404).json({error: error.message})
  }

  //Comprobar la contraseña
  const isPasswordCorrect = await checkPassword(password, user.password)

  if(!isPasswordCorrect){
    const error = new Error('Contraseña incorrecta')
    return res.status(401).json({error: error.message})
  }

  res.status(200).json({mensaje: 'Autenticado'})
}