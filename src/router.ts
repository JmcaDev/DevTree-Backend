import { Router, Request, Response  } from 'express'

const router = Router()

/** Auth & Register */
router.post('/auth/register', (req: Request, res: Response) => {
  console.log(req.body)
})

export default router