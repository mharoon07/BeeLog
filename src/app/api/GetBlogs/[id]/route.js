 
import { NextResponse } from 'next/server';
import connectDb from '../../../../lib/db';
import BlogModel from "../../../../schema/BlogSchema"

export async function GET(request, { params }) {
    try {
        await connectDb(); // Connect to your database

        const { id } = params; // Destructure params (safe in async function)

        if (!id) {
            return NextResponse.json(
                { message: 'Blog ID is required' },
                { status: 400 }
            );
        }

        const blog = await BlogModel.findById(id);

        if (!blog) {
            return NextResponse.json(
                { message: 'Blog not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(blog, { status: 200 });
    } catch (error) {
        console.error('Error fetching blog:', error);
        return NextResponse.json(
            { message: 'Error fetching blog', error: error.message },
            { status: 500 }
        );
    }
}