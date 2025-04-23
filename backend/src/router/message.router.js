import { 
    getAllMessages,
    getAllUsers,
    sendMessage
} from "../controllers/message.controller.js";
import { Router} from 'express'
import {upload} from '../middleware/multer.middleware.js'
import auth from "../middleware/auth.middleware.js";

const router = Router()

// Authenticated request
router.route('/all-users').get(auth, getAllUsers)
router.route('/messages').get(auth, getAllMessages)
router.route('/send-message').post(auth, upload.single('file'),sendMessage)


export default router