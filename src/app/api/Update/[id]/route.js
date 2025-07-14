import { NextResponse } from 'next/server';
import connectDb from '../../../../lib/db';
import BlogModel from "../../../../schema/BlogSchema";
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function PATCH(req, { params }) {
    try {
        await connectDb();
        const { id } = await params;

        const formData = await req.formData();
        const postString = formData.get('post');
        const imageFile = formData.get('image');
        if (!postString) {
            return NextResponse.json({ message: 'Blog post data is missing' }, { status: 400 });
        }

        let postData;
        try {
            postData = JSON.parse(postString);
        } catch (err) {
            return NextResponse.json({ message: 'Invalid JSON format for post data' +err }, { status: 400 });
        }

        let imageUrlForDb = postData.imageUrl;


        if (imageFile instanceof File && imageFile.size > 0) {

            if (imageFile.size > 5 * 1024 * 1024) {
                return NextResponse.json({ message: 'File size must be less than 5MB' }, { status: 400 });
            }
            if (!['image/jpeg', 'image/png'].includes(imageFile.type)) {
                return NextResponse.json({ message: 'Only JPEG and PNG files are allowed' }, { status: 400 });
            }


            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const dataUri = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

            try {

                const uploadResult = await cloudinary.uploader.upload(dataUri, {
                    folder: 'blogspace_uploads',
                });

                imageUrlForDb = uploadResult.secure_url;
                if (postData.imageUrl && postData.imageUrl.includes('res.cloudinary.com')) {

                    const parts = postData.imageUrl.split('/');
                    const filenameWithExtension = parts[parts.length - 1];
                    const publicId = 'blogspace_uploads/' + filenameWithExtension.split('.')[0];

                    try {
                        await cloudinary.uploader.destroy(publicId);
                        console.log(`Deleted old Cloudinary image: ${publicId}`);
                    } catch (deleteError) {
                        console.warn(`Could not delete old Cloudinary image ${publicId}:`, deleteError);
                    }
                }

            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return NextResponse.json({ message: 'Image upload failed', error: uploadError.message }, { status: 500 });
            }
        } else if (postData.imageUrl === "") {

            if (postData.imageUrl && postData.imageUrl.includes('res.cloudinary.com')) {
                const parts = postData.imageUrl.split('/');
                const filenameWithExtension = parts[parts.length - 1];
                const publicId = 'blogspace_uploads/' + filenameWithExtension.split('.')[0];

                try {
                    await cloudinary.uploader.destroy(publicId);
                    console.log(`Deleted old Cloudinary image due to removal: ${publicId}`);
                } catch (deleteError) {
                    console.warn(`Could not delete old Cloudinary image on removal ${publicId}:`, deleteError);
                }
            }
            imageUrlForDb = null;
        }

        const fieldsToUpdate = {
            title: postData.title,
            content: postData.content,
            author: postData.author,
            publishDate: postData.publishDate,
            tags: postData.tags,
            category: postData.category,
            imageUrl: imageUrlForDb,
        };

        const blog = await BlogModel.findByIdAndUpdate(id, fieldsToUpdate, {
            new: true,
            runValidators: true,
        });

        if (!blog) {
            return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
        }
        return NextResponse.json(blog, { status: 200 });
    } catch (error) {
        console.error('Error updating blog:', error);
        return NextResponse.json(
            { message: 'Error updating blog', error: error.message },
            { status: 500 }
        );
    }
}