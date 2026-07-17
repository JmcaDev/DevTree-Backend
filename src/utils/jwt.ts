import jwt, {JwtPayload} from 'jsonwebtoken';

export const generateJWT = (payload: JwtPayload) => {

  const secret = process.env.JWT_SECRET_KEY

  if(!secret){
    throw new Error('La variable de entorno JWT_SECRET_KEY no esta definida')
  }

  const token = jwt.sign(payload, secret, {
    expiresIn: '180d'
  })
  return token
}