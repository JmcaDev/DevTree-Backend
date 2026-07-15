import { Router } from 'express'

import { createAccount } from './handlers/index.js'

const router = Router()

/** Auth & Register */
router.post('/auth/register', createAccount)

export default router