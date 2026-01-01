import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import BannerV1Model from '../models/bannerV1.model.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true,
});

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


export async function addBanner(request, response) {
    try {
        let banner = new BannerV1Model({
            bannerTitlename: request.body.bannerTitlename,
            images: imagesArr,
            catId: request.body.catId,
            subCatId: request.body.subCatId,
            thirdsubCatId: request.body.thirdsubCatId,
            price: request.body.price,
            alignInfo:request.body.alignInfo,
        });

        if (!banner) {
            return response.status(500).json({
                message: "Banner Not created",
                error: true,
                success: false
            });
        }
        banner = await banner.save();
        imagesArr = [];

        return response.status(200).json({
            message: "Banner created Successfully!!",
            error: false,
            success: true,
            banner: banner
        });

    } catch (error) {
        return response.status(200).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function getBanners(request, response) {
    try {
        const Banners = await BannerV1Model.find();
        if (!Banners) {
            return response.status(500).json({
                error: true,
                success: false,
            });
        }
        return response.status(200).json({
            error: false,
            success: true,
            data: Banners
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function getBanner(request, response) {
    try {
        const banner = await BannerV1Model.findById(request.params.id);

        if (!banner) {
            return response.status(500).json({
                message: "The Banner with the given ID was not found.",
                error: true,
                success: false
            });
        }
        return response.status(200).json({
            error: false,
            success: true,
            banner: banner
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function deleteBanners(request, response) {
    try {
        // 1. Find the category and get the images array
        const banner = await BannerV1Model.findById(request.params.id);

        if (!banner) {
            return response.status(404).json({ message: "Banner not found." });
        }

        const images = banner.images;

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

        const deletedBanner = await BannerV1Model.findByIdAndDelete(request.params.id);
        if (!deletedBanner) {
            return response.status(404).json({
                message: "Banner not found!",
                success: false,
                error: true
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            message: "Banner and associated images deleted successfully."
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


export async function updateBanners(request, response) {
    try {
        const banner = await BannerV1Model.findByIdAndUpdate(
            request.params.id,
            {
                bannerTitlename: request.body.bannerTitlename,
                images: imagesArr.length > 0 ? imagesArr[0] : request.body.images,
                catId: request.body.catId,
                subCatId: request.body.subCatId,
                thirdsubCatId: request.body.thirdsubCatId,
                price: request.body.price,
            alignInfo:request.body.alignInfo,

            },
            { new: true } // Returns the updated document
        );

        if (!banner) {
            return response.status(500).json({
                message: "Banner cannot be updated!", // Or: "Category not found!"
                success: false,
                error: true
            });
        }

        // Clear the images array (assuming this is necessary global/scoped state cleanup)
        imagesArr = [];

        return response.status(200).json({
            error: false,
            success: true,
            message: "Banner updated successfully",
            category: category
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}