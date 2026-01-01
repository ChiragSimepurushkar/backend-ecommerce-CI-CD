import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import BlogModel from '../models/blog.model.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true,
});

// image upload
var imagesArr = [];
export async function uploadImages(request, response) {
    try {
        imagesArr = [];
        const image = request.files;

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < request?.files?.length; i++) {

            const img = await cloudinary.uploader.upload(
                request.files[i].path,
                options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);
                }
            );
        }

        return response.status(200).json({
            images: imagesArr
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function createBlog(request, response) {
    try {
        let blog = new BlogModel({
            title: request.body.title,
            images: imagesArr,
            description: request.body.description,
        });

        if (!blog) {
            return response.status(500).json({
                message: "Blog Not created",
                error: true,
                success: false
            });
        }
        blog = await blog.save();
        imagesArr = [];

        return response.status(200).json({
            message: "Blog created Successfully!!",
            error: false,
            success: true,
            blog: blog
        });

    } catch (error) {
        return response.status(200).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function getBlogs(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10;
        const totalPosts = await BlogModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);
        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            });
        }

        const blogs = await BlogModel.find()
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        if (!blogs) {
            return response.status(400).json({
                message: "blogs not found",
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            blogs: blogs,
            error: false,
            success: true,  
            totalPages: totalPages,
            page: page,
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function getBlog(request, response) {
    try {
        const blog = await BlogModel.findById(request.params.id);

        if (!blog) {
            return response.status(500).json({
                message: "The Blog with the given ID was not found.",
                error: true,
                success: false
            });
        }
        return response.status(200).json({
            error: false,
            success: true,
            blog: blog
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function deleteBlog(request, response) {
    try {
        // 1. Find the category and get the images array
        const blog = await BlogModel.findById(request.params.id);

        if (!blog) {
            return response.status(404).json({ message: "Blog not found." });
        }

        const images = blog.images;

        // 2. Loop through all images and delete them from Cloudinary
        for (const img of images) {
            const imgUrl = img;
            const urlArr = imgUrl.split("/");
            const image = urlArr[urlArr.length - 1]; // Gets filename with extension (Public ID)
            const imageName = image.split(".")[0]; // Gets Public ID without extension

            if (imageName) {
                // Deletes the image from Cloudinary (using callback method)
                cloudinary.uploader.destroy(imageName, (error, result) => {
                });
            }
        }


        const deletedBlog = await BlogModel.findByIdAndDelete(request.params.id);
        if (!deletedBlog) {
            return response.status(404).json({
                message: "Blog not found!",
                success: false,
                error: true
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            message: "Blog and associated images deleted successfully."
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}



export async function updatedBlog(request, response) {
    try {
        const blog = await BlogModel.findByIdAndUpdate(
            request.params.id,
            {
                images: imagesArr.length > 0 ? imagesArr[0] : request.body.images,
                title: request.body.title,
                description: request.body.description,
            },
            { new: true } // Returns the updated document
        );

        if (!blog) {
            return response.status(500).json({
                message: "Blog cannot be updated!", // Or: "Category not found!"
                success: false,
                error: true
            });
        }

        // Clear the images array (assuming this is necessary global/scoped state cleanup)
        imagesArr = [];

        return response.status(200).json({
            error: false,
            success: true,
            message: "Blog updated successfully",
            blog: blog
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}