import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import HomeSliderModel from '../models/homeSlider.model.js';

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


export async function addHomeSlide(request, response) {
    try {
        let slide = new HomeSliderModel({
            images: imagesArr,
        });

        if (!slide) {
            return response.status(500).json({
                message: "Slide Not created",
                error: true,
                success: false
            });
        }
        slide = await slide.save();
        imagesArr = [];

        return response.status(200).json({
            message: "Slide created Successfully!!",
            error: false,
            success: true,
            slide: slide
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getHomeSlides(request, response) {
    try {
        const slides = await HomeSliderModel.find();

        if (!slides) {
            return response.status(404).json({
                message: "slides Images not found",
                error: true,
                success: false
            })
        }
        return response.status(200).json({
            error: false,
            success: true,
            data: slides
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getSlide(request, response) {
    try {
        const slide = await HomeSliderModel.findById(request.params.id);

        if (!slide) {
            response.status(500)
                .json({
                    message: "The slide with the given ID was not found.",
                    error: true,
                    success: false
                })
        }

        return response.status(200).json({
            error: false,
            success: true,
            slide: slide
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function removeImageFromCloudinary(request, response) {
    const imgUrl = request.query.img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    if (imageName) {
        try {
            const result = await cloudinary.uploader.destroy(imageName);

            if (result.result === "ok") {
                return response.status(200).json({
                    error: false,
                    success: true,
                    message: "Image deleted successfully",
                });
            }

            return response.status(400).json({
                error: true,
                success: false,
                message: "Image not found on Cloudinary",
            });

        } catch (error) {
            console.error(error);
            return response.status(500).json({
                error: true,
                success: false,
                message: "Cloudinary delete failed",
            });
        }
    }

}



export async function deleteSlides(request, response) {
    try {
        // 1. Find the category and get the images array
        const slide = await HomeSliderModel.findById(request.params.id);

        if (!slide) {
            return response.status(404).json({ message: "Slide not found." });
        }

        const images = slide.images;

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

        const deletedSlide = await HomeSliderModel.findByIdAndDelete(request.params.id);
        if (!deletedSlide) {
            return response.status(404).json({
                message: "Slides not found!",
                success: false,
                error: true
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            message: "Slides images deleted successfully."
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


export async function updatedSildes(request, response) {
    try {
        const slide = await HomeSliderModel.findByIdAndUpdate(
            request.params.id,
            {
                images: imagesArr.length > 0 ? imagesArr[0] : request.body.images,
            },
            { new: true } // Returns the updated document
        );

        if (!slide) {
            return response.status(500).json({
                message: "Slide not found", // Or: "Category not found!"
                success: false,
                error: true
            });
        }

        // Clear the images array (assuming this is necessary global/scoped state cleanup)
        imagesArr = [];

        return response.status(200).json({
            error: false,
            success: true,
             message: "Slide updated successfully",
            slide: slide
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}

export async function deleteMultipleSlides(request, response) {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return response.status(400).json({
            error: true,
            success: false,
            message: 'Invalid input. Please provide an array of IDs.'
        });
    }

    try {
        // First, fetch all products and delete their images from Cloudinary
        for (let i = 0; i < ids.length; i++) {
            const slides = await HomeSliderModel.findById(ids[i]);

            if (!slides) {
                console.log(`Slide with ID ${ids[i]} not found`);
                continue; // Skip if product doesn't exist
            }

            const images = slides.images;

            // Delete each image from Cloudinary
            for (const img of images) {
                try {
                    const imgUrl = img;
                    const urlArr = imgUrl.split("/");
                    const image = urlArr[urlArr.length - 1];
                    const imageName = image.split(".")[0];

                    if (imageName) {
                        // Make this await to ensure images are deleted
                        await new Promise((resolve, reject) => {
                            cloudinary.uploader.destroy(imageName, (error, result) => {
                                if (error) {
                                    console.log("Error deleting image:", error);
                                    resolve(); // Continue even if image deletion fails
                                } else {
                                    console.log("Image deleted:", result);
                                    resolve();
                                }
                            });
                        });
                    }
                } catch (imgError) {
                    console.log("Error processing image:", imgError);
                    // Continue with other images even if one fails
                }
            }
        }

        // After all images are deleted, delete the products from database
        const deleteResult = await HomeSliderModel.deleteMany({ _id: { $in: ids } });

        return response.status(200).json({
            message: `${deleteResult.deletedCount} Slides(s) deleted successfully`,
            error: false,
            success: true,
            deletedCount: deleteResult.deletedCount
        });

    } catch (error) {
        console.error("Error in deleteMultipleSlides:", error);
        return response.status(500).json({
            message: error.message || "An error occurred while deleting slides",
            error: true,
            success: false
        });
    }
}
