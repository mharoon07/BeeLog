 
import { NextResponse } from "next/server";
import connectDb from "../../../lib/db"; 
import BlogModel from "../../../schema/BlogSchema";

export async function GET(request) {
    try {
        await connectDb();  

        const blogs = await BlogModel.find();  

        if (!blogs || blogs.length === 0) {
            return NextResponse.json(
                { message: "No blogs found" },
                { status: 404 }
            );
        }

        return NextResponse.json(blogs, { status: 200 });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return NextResponse.json(
            { message: "Error fetching blogs", error: error.message },
            { status: 500 }
        );
    }
}