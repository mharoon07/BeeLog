
import { NextResponse } from 'next/server';
import connectDb from '../../../../lib/db';
import BlogModel from "../../../../schema/BlogSchema"

export async function DELETE(request, { params }) {
    try {
        await connectDb();

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: "Blog ID is required" },
                { status: 400 }
            );
        }

        const deletedBlog = await BlogModel.findByIdAndDelete(id);

        if (!deletedBlog) {
            return NextResponse.json(
                { error: "Blog not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Blog deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting blog:", error);
        return NextResponse.json(
            { error: "Failed to delete blog" },
            { status: 500 }
        );
    }
}