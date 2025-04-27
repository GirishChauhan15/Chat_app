import { cloudinaryUploader } from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import isDataValid from "../utils/isDataValid.js";
import { User } from "../models/user.model.js";
import { isValidObjectId } from "mongoose";
import removeImageFromServer from "../utils/removeImagesFromServer.js";
import jwt from "jsonwebtoken";
import { maxImageSize } from "../constant.js";
import { encryptData } from "../utils/CryptoEncrypt.js";

const options = {
    httpOnly: true,
    secure: true,
    sameSite : 'None'
};

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

// Returns new Refresh token, Access token and updates user info
const generateNewRefreshToken = async (userId) => {
    const userInfo = await User.findById(userId).exec();

    const refreshTokenData = await userInfo.generateRefToken();
    const accessTokenData = await userInfo.generateAccToken();

    if (!refreshTokenData?.trim() || !accessTokenData?.trim()) return false;

    const updateUser = await User.findByIdAndUpdate(
        userInfo?._id,
        {
            $set: {
                refreshTokens: refreshTokenData,
            },
        },
        {
            new: true,
        }
    )
        .select("-password -refreshTokens -publicImageId")
        .lean()
        .exec();

    if (!updateUser) {
        await User.findByIdAndUpdate(
            userInfo?._id,
            {
                $unset: {
                    refreshTokens: 1,
                },
            },
            {
                new: true,
            }
        );
        return false;
    }
    return { refreshTokenData, accessTokenData, updateUser };
};

// Register new user and set a JWT
const registerNewUser = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    // Validate info
    const dataValid = isDataValid(fullName, email, password);

    if (!dataValid)
        return res
            .status(400)
            .json(new ApiError(400, "All fields are required."));

    if (!emailRegex?.test(email))
        return res
            .status(400)
            .json(new ApiError(400, "Invalid Email address."));
    if (!passwordRegex?.test(password))
        return res.status(400).json(new ApiError(400, "Password must be 8+ characters with uppercase, lowercase, number, and special character."));

    // Check if user exists
    const isUserPresent = await User.findOne({ email });

    if (isUserPresent)
        return res
            .status(409)
            .json(
                new ApiError(
                    409,
                    "An account with this email already exists. Please log in."
                )
            );

    const newUser = await User.create({
        fullName,
        email,
        password,
    });

    if (!newUser)
        return res
            .status(500)
            .json(new ApiError(500, "Failed to register. Please try later."));

    let { refreshTokenData, accessTokenData, updateUser } =
        await generateNewRefreshToken(newUser?._id);

    if (!refreshTokenData || !accessTokenData)
        return res
            .status(500)
            .json(
                new ApiError(500, "Failed to generate token. Please try later.")
            );
    
    // return user info and set a JWT
    return res
        .status(201)
        .cookie("chat_app_jwt", refreshTokenData, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json(
            new ApiResponse(
                201,
                { ...updateUser, accessToken: accessTokenData },
                "Your account has been successfully created!"
            )
        );
});

// Login user and set a JWT
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate info
    const dataValid = isDataValid(email, password);

    if (!dataValid)
        return res
            .status(400)
            .json(new ApiError(400, "All fields are required."));

    if (!emailRegex?.test(email))
        return res
            .status(400)
            .json(new ApiError(400, "Invalid Email address."));

    // Check if user exists
    const isUserPresent = await User.findOne({ email });

    if (!isUserPresent)
        return res.status(400).json(new ApiError(400, "Invalid credential."));

    // Compare password
    const comparePasswordResult = await isUserPresent.comparePassword(password);

    if (!comparePasswordResult)
        return res.status(400).json(new ApiError(400, "Invalid credential."));

    let { refreshTokenData, accessTokenData, updateUser } =
        await generateNewRefreshToken(isUserPresent?._id);

    if (!refreshTokenData || !accessTokenData)
        return res
            .status(500)
            .json(
                new ApiError(500, "Failed to generate token. Please try later.")
            );

    // return user info and set a JWT
    return res
        .status(200)
        .cookie("chat_app_jwt", refreshTokenData, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json(
            new ApiResponse(
                200,
                { ...updateUser, accessToken: accessTokenData },
                "Login successfully!"
            )
        );
});

// Get current User info
const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        const { chat_app_jwt } = req.cookies;

        if (!chat_app_jwt)
            return res.status(400).json(new ApiError(400, "No Token found."));

        const decodedInfo = await jwt.verify(
            chat_app_jwt,
            process.env.REF_TOKEN_SECRET
        );

        if (!decodedInfo) {
            res.clearCookie("chat_app_jwt", options);
            return res
                .status(400)
                .json(new ApiError(400, "Token is expired or used."));
        }

        // Validate token
        let userInfo = await User.findOne({
            $and: [
                { _id: decodedInfo?.userId },
                { refreshTokens: chat_app_jwt },
            ],
        });
        if (!userInfo) {
            res.clearCookie("chat_app_jwt", options);
            return res.status(404).json(new ApiError(404, "Invalid token."));
        }
        const userData = await User.findById(userInfo?._id)
            .select("-password -refreshTokens -publicImageId")
            .lean()
            .exec();

        if (!userData) {
            res.clearCookie("chat_app_jwt", options);
            return res.status(400).json(new ApiError(400, "Invalid token."));
        }

        const accessToken = await userInfo.generateAccToken();

        // return user info and set a JWT
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { ...userData, accessToken },
                    "User data fetched successfully."
                )
            );
    } catch (error) {
        return res.status(400).json(new ApiError(400, "Invalid token."));
    }
});


// Refresh old token
const refreshToken = asyncHandler(async (req, res) => {
    try {
        const { chat_app_jwt } = req.cookies;

        if (!chat_app_jwt)
            return res.status(400).json(new ApiError(400, "No Token found."));

        const decodedInfo = await jwt.verify(
            chat_app_jwt,
            process.env.REF_TOKEN_SECRET
        );

        if (!decodedInfo) {
            res.clearCookie("chat_app_jwt", options);
            return res
                .status(400)
                .json(new ApiError(400, "Token is expired or used."));
        }

        // Validate token
        let userInfo = await User.findOne({
            $and: [
                { _id: decodedInfo?.userId },
                { refreshTokens: chat_app_jwt },
            ],
        });

        if (!userInfo) {
            res.clearCookie("chat_app_jwt", options);
            return res.status(404).json(new ApiError(404, "Invalid token."));
        }

        const { refreshTokenData, accessTokenData } =
            await generateNewRefreshToken(userInfo?._id);

        // return user info and set a JWT
        return res
            .status(200)
            .cookie("chat_app_jwt", refreshTokenData, {
                ...options,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .json(
                new ApiResponse(
                    200,
                    { accessToken: accessTokenData },
                    "Token refreshed!"
                )
            );
    } catch (error) {
        return res.status(400).json(new ApiError(400, "Invalid token."));
    }
});

// Logout user and clear JWT
const logoutUser = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;

    let userInfo = await User.findById(userId);

    if (!userInfo) {
        res.clearCookie("chat_app_jwt", options);
        return res.status(404).json(new ApiError(404, "Invalid user."));
    }

    // Remove refresh token from user's database
    const updateUserInfo = await User.findByIdAndUpdate(
        { _id: userInfo?._id },
        {
            $unset: {
                refreshTokens: 1,
            },
        },
        { new: true }
    );
    // clear JWT
    res.status(200)
        .clearCookie("chat_app_jwt", options)
        .json(new ApiResponse(200, {}, "Logout successfully."));
});

// Update User profile
const updateUserProfilePic = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;
    const file = req.file;

    // Validate info
    if (!isValidObjectId(userId))
        return res.status(400).json(new ApiError(400, "Invalid user id"));
    if (!file?.path) {
        return res
            .status(400)
            .json(new ApiError(400, "Image file is missing."));
    }

    if (file && !file?.mimetype?.includes("image/")) {
        removeImageFromServer(file?.path);
        return res.status(400).json(new ApiError(400, "Image file required."));
    }

    // Validate image file size (lessThan 2 MB)
    if (file?.size) {
        if (file?.size / (1024 * 1024) > maxImageSize) {
            removeImageFromServer(file?.path);
            return res.status(400).json(new ApiError(400, "File too large."));
        }
    }

    // Upload image file to cloudinary
    const cloudinaryResponse = await cloudinaryUploader(file?.path);

     // Encrypts Image
    let encryptedImageUrl = encryptData(cloudinaryResponse?.secureUrl, process.env.PROFILE_PIC_ENCRYPTION_KEY)
        
    if(!encryptedImageUrl?.success) {
        removeImageFromServer(file?.path)
        return res.status(500).json(new ApiError(500, "Failed to encrypt Profile picture, try later."))
    }

    if (!cloudinaryResponse) {
        removeImageFromServer(file?.path);
        return res
            .status(500)
            .json(new ApiError(500, "Failed to upload image, try later."));
    }


    const updateUserInfo = await User.findByIdAndUpdate(
        { _id: userId },
        {
            $set: {
                profilePicture: encryptedImageUrl?.data,
                publicImageId: cloudinaryResponse?.publicId,
            },
        },
        { new: true }
    );

    if (!updateUserInfo)
        return res
            .status(500)
            .json(new ApiError(500, "Failed to upload image, try later."));


    // Clean up leftovers image file
    removeImageFromServer(file?.path);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { profilePicture: updateUserInfo?.profilePicture },
                "Profile Picture updated successfully."
            )
        );
});

export {
    registerNewUser,
    loginUser,
    updateUserProfilePic,
    refreshToken,
    logoutUser,
    getCurrentUser,
};
