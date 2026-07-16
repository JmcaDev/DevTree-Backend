import { Router } from 'express'
import { body } from 'express-validator'
import { createAccount, loginAccount } from './handlers/index.js'
import { handleInputErrors } from './middleware/validation.js'

const router = Router()

/** Auth & Register */
router.post('/auth/register', 
  body('handle').notEmpty().withMessage('El handle no puede ir vacio'),
  body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
  body('email').isEmail().withMessage('No es un correo válido'),
  body('password').isLength({min: 8}).withMessage('La contraseña debe ser minimo 8 caracteres'),
  handleInputErrors,
  createAccount
)

router.post('/auth/login', 
  body('email').isEmail().withMessage('El correo electronico es obligatorio'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  handleInputErrors,
  loginAccount
)

export default router