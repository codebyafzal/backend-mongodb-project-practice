import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  //Validation
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Field Are Required!");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User With Email or Username is Already Exist!");
  }

  const avatarLocalpath = req.files?.avatar?.[0]?.path;
  const coverLocalpath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar is Required!");
  }

  // const avatar = await uploadOnCloudinary(avatarLocalpath);
  // let coverImage = "";

  // if (coverLocalpath) {
  //   coverImage = await uploadOnCloudinary(coverLocalpath);
  // }

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalpath);
    console.log("Avatar Uploaded Successfully!", avatar);
  } catch (error) {
    console.log("Error Uploading Avatar", error);
    throw new ApiError(500, "Failed to Upload Avatar");
  }

  let coverImage;
  try {
    coverImage = await uploadOnCloudinary(coverLocalpath);
    console.log("Cover Image Uploaded Successfully!", avatar);
  } catch (error) {
    console.log("Error Uploading Cover Image", error);
    throw new ApiError(500, "Failed to Upload Cover Image");
  }

  try {
    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      new ApiError(500, "Somethig Went Wrong While Registering A User!");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, createdUser, "User Registered Successfully!"));
  } catch (error) {
    console.log("User Creation Failed");

    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }

    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }

    throw new ApiError(
      500,
      "Something Went Wrong While Registering A User! And Images were deleted"
    );
  }
});

export { registerUser };
