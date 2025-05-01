import { Message } from "../models/message.model.js";
import { cloudinaryUploader } from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import removeImageFromServer from "../utils/removeImagesFromServer.js";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Picture } from "../models/image.model.js";
import { maxImageSize } from "../constant.js";
import { io, isUserOnline } from "../socket.js";
import { encryptData } from "../utils/CryptoEncrypt.js";

const getAllUsers = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;
    const { page = 1, limit = 10 } = req.query;

    const options = {
        page: Number(page),
        limit: Number(limit),
    };

    // Validate user Id
    if (!isValidObjectId(userId))
        return res.status(400).json(new ApiError(400, "Invalid user id."));

    //  Find all users except current user
    let allUsers = User.aggregate([
        {
            $match: {
                _id: { $ne: userId },
            },
        },
        {
            $project: {
                fullName: 1,
                email: 1,
                profilePicture: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);

    let allUsersDetail = await User.aggregatePaginate(allUsers, options);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                data: allUsersDetail?.docs,
                meta: {
                    totalDocs: allUsersDetail?.totalDocs,
                    totalPages: allUsersDetail?.totalPages,
                    currentPage: allUsersDetail?.page,
                    limit: allUsersDetail?.limit,
                },
            },
            "All users info fetched successfully."
        )
    );
});
const getAllMessages = asyncHandler(async (req, res) => {
    const { _id: senderId } = req.user;
    const { page = 1, limit = 10, receiverId } = req.query;

    const options = {
        page: Number(page),
        limit: Number(limit),
    };

    // Validate user id and receiver id
    if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
        return res.status(400).json(new ApiError(400, "Invalid user id."));
    }

    const messagesInfo = Message.aggregate([
        {
            $match: {
                $or: [
                    {
                        $and: [
                            {
                                receiverId: new mongoose.Types.ObjectId(
                                    receiverId
                                ),
                            },
                            { senderId: new mongoose.Types.ObjectId(senderId) },
                        ],
                    },
                    {
                        $and: [
                            {
                                receiverId: new mongoose.Types.ObjectId(
                                    senderId
                                ),
                            },
                            {
                                senderId: new mongoose.Types.ObjectId(
                                    receiverId
                                ),
                            },
                        ],
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "pictures",
                localField: "image",
                foreignField: "_id",
                as: "image",
            },
        },
        {
            $addFields: {
                image: {
                    $first: "$image.secureUrl",
                },
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
    ]);

    let getAllMessageInfo = await Message.aggregatePaginate(
        messagesInfo,
        options
    );

    if (!getAllMessageInfo) {
        return res
            .status(500)
            .json(new ApiError(500, "Failed to fetch messages, try later."));
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                data: getAllMessageInfo?.docs,
                meta: {
                    totalDocs: getAllMessageInfo?.totalDocs,
                    totalPages: getAllMessageInfo?.totalPages,
                    currentPage: getAllMessageInfo?.page,
                    limit: getAllMessageInfo?.limit,
                },
            },
            "Messages fetched successfully."
        )
    );
});
const sendMessage = asyncHandler(async (req, res) => {
    const { _id: senderId } = req.user;
    const { receiverId, message } = req.body;

    const file = req.file;

    // Validate user id and receiver id
    if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
        if (file?.path) {
            removeImageFromServer(file?.path);
        }
        return res.status(400).json(new ApiError(400, "Invalid user id."));
    }

    // Validate image file size (lessThan 2 MB)
    if (file?.size) {
        if (file?.size / (1024 * 1024) > maxImageSize) {
            removeImageFromServer(file?.path);
            return res.status(400).json(new ApiError(400, "File too large."));
        }
    }

    // Validate message length (lessThan 300 char)
    if (message && message?.length) {
        if (message?.length > 300) {
            removeImageFromServer(file?.path);
            return res
                .status(400)
                .json(
                    new ApiError(400, "Message too long. Max 300 characters.")
                );
        }
    }

    if (!file?.path && !message?.trim()) {
        return res
            .status(400)
            .json(new ApiError(400, "Message or image field is required."));
    }

    if (file && !file?.mimetype?.includes("image/")) {
        removeImageFromServer(file?.path);
        return res.status(400).json(new ApiError(400, "Image file required."));
    }

    // Upload image file to cloudinary
    let pictureId;

    if (file?.path) {
        const cloudinaryResponse = await cloudinaryUploader(file?.path);

        if (!cloudinaryResponse) {
            removeImageFromServer(file?.path);
            return res
                .status(500)
                .json(new ApiError(500, "Failed to upload image, try later."));
        }

        // Encrypts Image
        let encryptedImageUrl = encryptData(
            cloudinaryResponse?.secureUrl,
            process.env.IMAGE_ENCRYPTION_KEY
        );

        if (!encryptedImageUrl?.success) {
            removeImageFromServer(file?.path);
            return res
                .status(500)
                .json(new ApiError(500, "Failed to encrypt image, try later."));
        }

        const newImage = await Picture.create({
            secureUrl: encryptedImageUrl?.data,
            publicImageId: cloudinaryResponse?.publicId,
        });

        if (!newImage) {
            removeImageFromServer(file?.path);
            return res
                .status(500)
                .json(new ApiError(500, "Failed to upload image, try later."));
        }

        pictureId = newImage?._id;
        removeImageFromServer(file?.path);
    }

    // Encrypts Message
    let encryptedMessage;
    if (message) {
        encryptedMessage = encryptData(
            message,
            process.env.MESSAGE_ENCRYPTION_KEY
        );
    }

    if (encryptedMessage && !encryptedMessage?.success) {
        return res
            .status(500)
            .json(new ApiError(500, "Failed to encrypt message, try later."));
    }

    const newMessage = await Message.create({
        receiverId,
        senderId,
        message: encryptedMessage?.data,
        image: pictureId,
    });

    if (!newMessage)
        return res
            .status(500)
            .json(new ApiError(500, "Failed to send message, try later."));

    const messageInfo = await Message.findById(newMessage._id)
        .populate({
            path: "image",
            select: "secureUrl",
        })
        .lean();

    if (!messageInfo) {
        return res
            .status(500)
            .json(new ApiError(500, "Failed to send message, try later."));
    }
    res.status(201).json(
        new ApiResponse(
            201,
            { ...messageInfo, image: messageInfo?.image?.secureUrl },
            "Message send successfully."
        )
    );

    // RealTime message logic
    const userStatus = isUserOnline(receiverId);
    if (userStatus?.userId === receiverId) {
        io.to(userStatus?.socketId).emit("newMessage", {
            ...messageInfo,
            image: messageInfo?.image?.secureUrl,
        });
    }
});

export { getAllMessages, getAllUsers, sendMessage };
