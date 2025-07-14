import { NextResponse } from "next/server";
import mongoose from "mongoose";
import BlogModel from "../../../schema/BlogSchema"
import { v2 as cloudinary } from "cloudinary";
import connectDb from "@/lib/db";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
export const config = {
    api: {
        bodyParser: false,
    },
};
export async function POST(req) {
    await connectDb();
    try {
        const formData = await req.formData();
        const title = formData.get("title");
        const content = formData.get("content");
        const author = formData.get("author");
        const tagsString = formData.get("tags");
        const category = formData.get("category");
        const imageFile = formData.get("image");
        if (!title || !content || !author || !category) {
            return NextResponse.json({ message: "Missing required fields (title, content, author, category)" }, { status: 400 });
        }
        let tagsArray = [];
        if (tagsString) {
            try {
                tagsArray = JSON.parse(tagsString);

                if (!Array.isArray(tagsArray) || !tagsArray.every(tag => typeof tag === 'string')) {
                    console.warn("Parsed tags are not a valid array of strings:", tagsArray);
                    tagsArray = [];
                }
            } catch (parseError) {
                console.error("Error parsing tags JSON:", parseError);
                return NextResponse.json({ message: "Invalid tags format" }, { status: 400 });
            }
        }
        let imageUrl = null;
        if (imageFile instanceof File && imageFile.size > 0) {
            if (imageFile.size > 5 * 1024 * 1024) {
                return NextResponse.json({ message: 'File size must be less than 5MB' }, { status: 400 });
            }
            if (!['image/jpeg', 'image/png'].includes(imageFile.type)) {
                return NextResponse.json({ message: 'Only JPEG and PNG files are allowed' }, { status: 400 });
            }
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const dataUri = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
            try {
                const uploadResult = await cloudinary.uploader.upload(dataUri, {
                    folder: "blogspace_posts",
                });
                imageUrl = uploadResult.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
                return NextResponse.json({ message: "Image upload failed", error: uploadError.message }, { status: 500 });
            }
        } else if (imageFile === "") {

            imageUrl = null;
        }
        const newPost = new BlogModel({
            title,
            content,
            author,
            tags: tagsArray,
            category,
            imageUrl,
            publishDate: Date.now(),
        });

        await newPost.save();
        return NextResponse.json({
            success: true,
            message: "Post created successfully",
            data: newPost,
        }, { status: 201 });
    } catch (error) {
        console.error("API Error:", error);
        if (error instanceof mongoose.Error.ValidationError) {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            return NextResponse.json({ message: "Validation Error", errors }, { status: 400 });
        }
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
