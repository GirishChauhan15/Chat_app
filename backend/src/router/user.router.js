import { 
    registerNewUser,
    loginUser,
    updateUserProfilePic,
    refreshToken,
    logoutUser,
    getCurrentUser 
} from "../controllers/user.controller.js";
import { Router} from 'express'
import {upload} from '../middleware/multer.middleware.js'
import auth from "../middleware/auth.middleware.js";

const router = Router()

// No Authentication needed
router.route('/register').post(registerNewUser)
router.route('/login').post(loginUser)

// Authenticated request
router.route('/update-profile-pic').patch(auth, upload.single('file'),updateUserProfilePic)
router.route('/logout').patch(auth, logoutUser)

// Auto access refresh token
router.route('/get-current-user').get(getCurrentUser)
router.route('/refresh-token').get(refreshToken)

export default router