import CategoryModel from '../models/category.model.js'
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ProductModel from '../models/product.model.js';
import ProductRAMSModel from '../models/productRAMS.model.js';
import ProductWEIGHTModel from '../models/productWEIGHT.model.js';
import ProductSIZEModel from '../models/productSIZE.model.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true,
});

// image upload
var imagesArr = [];
var bannerImage = [];

// export async function uploadImages(request, response) {
//     try {
//         imagesArr = [];
//         const image = request.files;

//         const options = {
//             use_filename: true,
//             unique_filename: false,
//             overwrite: false,
//         };

//         for (let i = 0; i < request?.files?.length; i++) {

//             const img = await cloudinary.uploader.upload(
//                 request.files[i].path,
//                 options,
//                 function (error, result) {
//                     imagesArr.push(result.secure_url);
//                     fs.unlinkSync(`uploads/${request.files[i].filename}`);
//                 }
//             );
//         }

//         return response.status(200).json({
//             images: imagesArr
//         });

//     } catch (error) {
//         return response.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         });
//     }
// }

// Fixed uploadBannerImages function
export async function uploadBannerImages(request, response) {
    try {
        // Use local variable instead of module-level variable
        // const bannerImage = [];

        // Check if files exist
        if (!request.files || request.files.length === 0) {
            return response.status(400).json({
                message: "No files uploaded",
                error: true,
                success: false
            });
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        // Upload all files sequentially
        for (let i = 0; i < request.files.length; i++) {
            try {
                const result = await cloudinary.uploader.upload(
                    request.files[i].path,
                    options
                );

                bannerImage.push(result.secure_url);

                // Delete the temporary file
                fs.unlinkSync(`uploads/${request.files[i].filename}`);
            } catch (uploadError) {
                console.error(`Error uploading file ${i}:`, uploadError);
                // Continue with other files even if one fails
            }
        }

        if (bannerImage.length === 0) {
            return response.status(500).json({
                message: "Failed to upload any images",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            images: bannerImage,
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Upload banner images error:", error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Also fix the uploadImages function the same way
export async function uploadImages(request, response) {
    try {
        // const imagesArr = [];

        if (!request.files || request.files.length === 0) {
            return response.status(400).json({
                message: "No files uploaded",
                error: true,
                success: false
            });
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < request.files.length; i++) {
            try {
                const result = await cloudinary.uploader.upload(
                    request.files[i].path,
                    options
                );

                imagesArr.push(result.secure_url);

                fs.unlinkSync(`uploads/${request.files[i].filename}`);
            } catch (uploadError) {
                console.error(`Error uploading file ${i}:`, uploadError);
            }
        }

        if (imagesArr.length === 0) {
            return response.status(500).json({
                message: "Failed to upload any images",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            images: imagesArr,
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Upload images error:", error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// create product
export async function createProduct(request, response) {
    try {
        let product = new ProductModel({
            name: request.body.name,
            description: request.body.description,
            images: imagesArr,
            bannerimages: bannerImage,
            isDisplayOnHomeBanner: request.body.isDisplayOnHomeBanner,
            bannerTitlename: request.body.bannerTitlename,
            brand: request.body.brand,
            price: request.body.price,
            oldPrice: request.body.oldPrice,
            catName: request.body.catName,
            category: request.body.category,
            catId: request.body.catId,
            subCatId: request.body.subCatId,
            subCat: request.body.subCat,
            thirdSubCat: request.body.thirdSubCat,
            thirdSubCatId: request.body.thirdSubCatId,
            countInStock: request.body.countInStock,
            rating: request.body.rating,
            isFeatured: request.body.isFeatured,
            discount: request.body.discount,
            productRam: request.body.productRam,
            size: request.body.size,
            productWeight: request.body.productWeight,
        });
        product = await product.save();

        if (!product) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Product Not created"
            });
        }

        imagesArr = [];
        bannerImage = [];
        return response.status(200).json({
            message: "Product Created successfully",
            error: false,
            success: true,
            product: product
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// // get all products
// export async function getAllProducts(request, response) {
//     try {
//         const page = parseInt(request.query.page) || 1;
//         const perPage = parseInt(request.query.perPage);
//         const totalPosts = await ProductModel.countDocuments()||4;
//         const totalPages = Math.ceil(totalPosts / perPage);

//         if (page > totalPages) {
//             return response.status(404).json({
//                 message: "Page not found",
//                 success: false,
//                 error: true
//             });
//         }

//         const products = await ProductModel.find()
//             .populate("category")
//             .skip((page - 1) * perPage)
//             .limit(perPage)
//             .exec();

//         if (!products) {
//             return response.status(500).json({
//                 error: true,
//                 success: false
//             });
//         }
//         return response.status(200).json({
//             error: false,
//             success: true,
//             products: products,
//             totalPages: totalPages,
//             page: page,
//             totalPosts:totalPosts
//         });

//     } catch (error) {
//         return response.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         });
//     }
// }

// get all products
export async function getAllProducts(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10; // ✅ Add default value
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages && totalPages > 0) { // ✅ Check totalPages > 0
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            });
        }

        const products = await ProductModel.find()
            .populate("category")
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
            totalPosts: totalPosts
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// get all products by category ID
export async function getAllProductsByCatId(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            });
        }

        const products = await ProductModel.find({
            catId: request.params.id
        })
            .populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// get all products by category Name
export async function getAllProductsByCatName(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            });
        }

        const products = await ProductModel.find({
            catName: request.query.catName
        })
            .populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// get all products by Subcategory ID
export async function getAllProductsBySubCatId(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            });
        }

        const products = await ProductModel.find({
            subCatId: request.params.id
        })
            .populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// get all products by Subcategory Name
export async function getAllProductsBySubCatName(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            });
        }

        const products = await ProductModel.find({
            subCat: request.query.subCat
        })
            .populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// get all products by third Level category ID
export async function getAllProductsByThirdLevelCatId(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            });
        }

        const products = await ProductModel.find({
            thirdSubCatId: request.params.id
        })
            .populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// get all products by third Level category Name
export async function getAllProductsByThirdLevelCatName(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            });
        }

        const products = await ProductModel.find({
            thirdSubCat: request.query.thirdSubCat
        })
            .populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// get all products by price
export async function getAllProductsByPrice(request, response) {
    try {
        let productlist = [];
        // --- 1. Fetch Products based on Category Hierarchy ---
        // Prioritize fetching by the most specific category (third subcategory)
        if (request.query.thirdSubCatId !== "" && request.query.thirdSubCatId !== undefined) {
            const productlistArr = await ProductModel.find({
                thirdSubCatId: request.query.thirdSubCatId,
            }).populate("category");
            productlist = productlistArr;

        }
        // Check if subcategory ID is provided
        else if (request.query.subCatId !== "" && request.query.subCatId !== undefined) {
            const productlistArr = await ProductModel.find({
                subCatId: request.query.subCatId,
            }).populate("category");
            productlist = productlistArr;

        }
        // Check if main category ID is provided
        else if (request.query.catId !== "" && request.query.catId !== undefined) {
            const productlistArr = await ProductModel.find({
                catId: request.query.catId,
            }).populate("category");
            productlist = productlistArr;

        }
        // Fallback: If no category is specified, productlist remains empty (or you would fetch all)
        // NOTE: Based on the snippets, no products are fetched if no query ID is present.
        // --- 2. Filter Products by Price Range (Client-Side Filtering) ---

        const filteredProducts = productlist.filter((product) => {
            // Check Min Price
            if (request.query.minPrice && product.price < parseInt(+request.query.minPrice)) {
                return false; // Exclude if price is LESS than minPrice
            }
            // Check Max Price
            if (request.query.maxPrice && product.price > parseInt(+request.query.maxPrice)) {
                return false; // Exclude if price is GREATER than maxPrice
            }

            return true; // Include if it passes all price checks
        });

        return response.status(200).json({
            error: false,
            success: true,
            products: filteredProducts,
            // NOTE: Pagination logic is skipped in this version, so totals are 0
            totalPages: 0,
            page: 0,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// get all products by ratings
export async function getAllProductsByRating(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            });
        }
        let products = [];
        if (request.query.catId !== undefined) {
            products = await ProductModel.find({
                rating: request.query.rating,
                catId: request.query.catId
            })
                .populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }
        if (request.query.subCatId !== undefined) {
            products = await ProductModel.find({
                rating: request.query.rating,
                subCatId: request.query.subCatId
            })
                .populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }
        if (request.query.thirdSubCatId !== undefined) {
            products = await ProductModel.find({
                rating: request.query.rating,
                thirdSubCatId: request.query.thirdSubCatId
            })
                .populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//get all products count
export async function getProductsCount(request, response) {
    try {
        const productsCount = await ProductModel.countDocuments();
        if (!productsCount) {
            // This checks if the count is 0 or null/undefined, returning a server error.
            // Note: A count of 0 is usually expected, so this should likely be a check for database error.
            return response.status(500).json({
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            productCount: productsCount
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// get all Featured products
export async function getAllFeaturedProducts(request, response) {
    try {

        const products = await ProductModel.find({
            isFeatured: true
        }).populate("category");

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//delete product
export async function deleteProduct(request, response) {
    try {
        // 1. Find the product first to get its image URLs
        const product = await ProductModel.findById(request.params.id).populate("category");

        if (!product) {
            return response.status(404).json({
                message: "Product Not found",
                error: true,
                success: false
            });
        }
        // 2. Extract image URLs
        const images = product.images;

        let img = "";
        // 3. Delete all associated images from Cloudinary (Runs asynchronously)
        for (img of images) {
            const imgUrl = img;
            const urlArr = imgUrl.split("/");
            const image = urlArr[urlArr.length - 1]; // Gets filename with extension
            const imageName = image.split(".")[0]; // Gets Public ID

            if (imageName) {
                // NOTE: This uses the asynchronous callback pattern and is NOT awaited.
                // The deletion runs in the background while the database delete runs.
                cloudinary.uploader.destroy(imageName, (error, result) => {
                    // console.log(error, result);
                });
            }
            // console.log(imageName) // Debug log is commented out
        }

        // 4. Delete the product document from the database
        const deletedProduct = await ProductModel.findByIdAndDelete(request.params.id);

        if (!deletedProduct) {
            // This is a safety check; if the product was found but couldn't be deleted now
            return response.status(404).json({
                message: "Product not deleted!",
                success: false,
                error: true
            });
        }

        // 5. Send Final Success Response
        return response.status(200).json({
            success: true,
            error: false,
            message: "Product Deleted!",
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// delete multiple products
// export async function deleteMultipleProduct(request, response) {
//     const { ids } = request.body;

//     if (!ids || !Array.isArray(ids)) {
//         return response.status(400).json({ error: true, success: false, message: 'Invalid input' });
//     }

//     for (let i = 0; i < ids?.length; i++) {
//         const product = await ProductModel.findById(ids[i]);

//         const images = product.images;
//         let img = "";

//         for (img of images) {
//             const imgUrl = img;
//             const urlArr = imgUrl.split("/");
//             const image = urlArr[urlArr.length - 1];

//             const imageName = image.split(".")[0];

//             if (imageName) {
//                 cloudinary.uploader.destroy(imageName, (error, result) => {
//                     // console.log(error, result);
//                 });
//             }
//         }
//     }

//     try {
//         await ProductModel.deleteMany({ _id: { $in: ids } });
//         return response.status(200).json({
//             message: "Product delete successfully",
//             error: false,
//             success: true
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         })
//     }
// }
// delete multiple products
export async function deleteMultipleProduct(request, response) {
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
            const product = await ProductModel.findById(ids[i]);

            if (!product) {
                console.log(`Product with ID ${ids[i]} not found`);
                continue; // Skip if product doesn't exist
            }

            const images = product.images;

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
        const deleteResult = await ProductModel.deleteMany({ _id: { $in: ids } });

        return response.status(200).json({
            message: `${deleteResult.deletedCount} product(s) deleted successfully`,
            error: false,
            success: true,
            deletedCount: deleteResult.deletedCount
        });

    } catch (error) {
        console.error("Error in deleteMultipleProduct:", error);
        return response.status(500).json({
            message: error.message || "An error occurred while deleting products",
            error: true,
            success: false
        });
    }
}

//get single product
export async function getProduct(request, response) {
    try {
        const product = await ProductModel.findById(request.params.id).populate("category");

        if (!product) {
            return response.status(404).json({
                message: "The product is not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            product: product
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//delete image
export async function removeImageFromCloudinary(request, response) {
    const imgUrl = request.query.img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    const res = await cloudinary.uploader.destroy(
        imageName,
        (error, result) => {
            // console.log(error, res)
        }
    );

    if (res) {
        response.status(200).send(res);
    }
}

//update product
export async function updateProduct(request, response) {
    try {
        const product = await ProductModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
                subCat: request.body.subCat,
                description: request.body.description,
                images: request.body.images,
                isDisplayOnHomeBanner: request.body.isDisplayOnHomeBanner,
                bannerimages: request.body.bannerimages,
                bannerTitlename: request.body.bannerTitlename,
                brand: request.body.brand,
                price: request.body.price,
                oldPrice: request.body.oldPrice,
                catId: request.body.catId,
                catName: request.body.catName,
                subCat: request.body.subCat,
                subCatId: request.body.subCatId,
                category: request.body.category,
                thirdSubCat: request.body.thirdSubCat,
                thirdSubCatId: request.body.thirdSubCatId,
                countInStock: request.body.countInStock,
                rating: request.body.rating,
                isFeatured: request.body.isFeatured,
                productRam: request.body.productRam,
                size: request.body.size,
                productWeight: request.body.productWeight,
            },
            { new: true } // Returns the updated document
        );

        if (!product) {
            return response.status(404).json({
                message: "the product can not be updated!",
                status: false,
            });
        }

        // Assuming imagesArr is a temporary array defined in the scope:
        imagesArr = [];

        return response.status(200).json({
            message: "The product is updated",
            error: false,
            success: true,
            product: product, // Added 'product' for completeness, as implied by the update logic
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

export async function createProductRAMS(request, response) {
    try {
        let productRAMS = new ProductRAMSModel({
            name: request.body.name
        })

        productRAMS = await productRAMS.save();

        if (!productRAMS) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Product RAMS Not created"
            });
        }
        return response.status(200).json({
            message: "The product RAMS created successfully",
            error: false,
            success: true,
            product: productRAMS,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function deleteProductRAMS(request, response) {
    try {
        // 1. Find the product first to get its image URLs
        const productRams = await ProductRAMSModel.findById(request.params.id)

        if (!productRams) {
            return response.status(404).json({
                message: "Item Not found",
                error: true,
                success: false
            });
        }
        // 4. Delete the product document from the database
        const deletedProductRams = await ProductRAMSModel.findByIdAndDelete(request.params.id);

        if (!deletedProductRams) {
            // This is a safety check; if the product was found but couldn't be deleted now
            return response.status(404).json({
                message: "Item not deleted!",
                success: false,
                error: true
            });
        }

        // 5. Send Final Success Response
        return response.status(200).json({
            success: true,
            error: false,
            message: "Product RAM Deleted!",
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// export async function deleteMultipleProductRAMS(request, response) {
//     const { ids } = request.body;

//     if (!ids || !Array.isArray(ids) || ids.length === 0) {
//         return response.status(400).json({
//             error: true,
//             success: false,
//             message: 'Invalid input. Please provide an array of IDs.'
//         });
//     }

//     try {

//         // After all images are deleted, delete the products from database
//         const deleteResult = await ProductRAMSModel.deleteMany({ _id: { $in: ids } });

//         return response.status(200).json({
//             message: `${deleteResult.deletedCount} product RAM(s) deleted successfully`,
//             error: false,
//             success: true,
//             deletedCount: deleteResult.deletedCount
//         });

//     } catch (error) {
//         console.error("Error in deleteMultipleProduct:", error);
//         return response.status(500).json({
//             message: error.message || "An error occurred while deleting products",
//             error: true,
//             success: false
//         });
//     }
// }

export async function updateProductRam(request, response) {
    try {
        const productRam = await ProductRAMSModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
            },
            { new: true }
        );
        if (!productRam) {
            return response.status(404).json({
                message: "the product Ram can not be updated!",
                status: false,
            });
        }
        return response.status(200).json({
            message: "The product Ram is updated",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getProductRams(request, response) {

    try {

        const productRam = await ProductRAMSModel.find();

        if (!productRam) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            data: productRam
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getProductRamsById(request, response) {

    try {

        const productRam = await ProductRAMSModel.findById(request.params.id);

        if (!productRam) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }
        return response.status(200).json({
            error: false,
            success: true,
            data: productRam
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//Weight

export async function createProductWEIGHT(request, response) {
    try {
        let productWeight = new ProductWEIGHTModel({
            name: request.body.name
        })

        productWeight = await productWeight.save();

        if (!productWeight) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Product Weight Not created"
            });
        }
        return response.status(200).json({
            message: "The product Weight created successfully",
            error: false,
            success: true,
            product: productWeight,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function deleteProductWEIGHT(request, response) {
    try {
        // 1. Find the product first to get its image URLs
        const productWeight = await ProductWEIGHTModel.findById(request.params.id)

        if (!productWeight) {
            return response.status(404).json({
                message: "Weight Not found",
                error: true,
                success: false
            });
        }
        // 4. Delete the product document from the database
        const deletedProductWeight = await ProductWEIGHTModel.findByIdAndDelete(request.params.id);

        if (!deletedProductWeight) {
            // This is a safety check; if the product was found but couldn't be deleted now
            return response.status(404).json({
                message: "Weight not deleted!",
                success: false,
                error: true
            });
        }

        // 5. Send Final Success Response
        return response.status(200).json({
            success: true,
            error: false,
            message: "Product Weight Deleted!",
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// export async function deleteMultipleProductWEIGHTS(request, response) {
//     const { ids } = request.body;

//     if (!ids || !Array.isArray(ids) || ids.length === 0) {
//         return response.status(400).json({
//             error: true,
//             success: false,
//             message: 'Invalid input. Please provide an array of IDs.'
//         });
//     }

//     try {

//         // After all images are deleted, delete the products from database
//         const deleteResult = await ProductWEIGHTModel.deleteMany({ _id: { $in: ids } });

//         return response.status(200).json({
//             message: `${deleteResult.deletedCount} product Weight(s) deleted successfully`,
//             error: false,
//             success: true,
//             deletedCount: deleteResult.deletedCount
//         });

//     } catch (error) {
//         console.error("Error in deleteMultipleProductWeights:", error);
//         return response.status(500).json({
//             message: error.message || "An error occurred while deleting product weights",
//             error: true,
//             success: false
//         });
//     }
// }

export async function updateProductWeight(request, response) {
    try {
        const productWeight = await ProductWEIGHTModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
            },
            { new: true }
        );
        if (!productWeight) {
            return response.status(404).json({
                message: "the product Weight can not be updated!",
                status: false,
            });
        }
        return response.status(200).json({
            message: "The product Weight is updated",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getProductWeights(request, response) {
    try {
        const productWeight = await ProductWEIGHTModel.find();
        if (!productWeight) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }
        return response.status(200).json({
            error: false,
            success: true,
            data: productWeight
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getProductWeightsById(request, response) {
    try {
        const productWeight = await ProductWEIGHTModel.findById(request.params.id);
        if (!productWeight) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }
        return response.status(200).json({
            error: false,
            success: true,
            data: productWeight
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}





//Size

export async function createProductSIZE(request, response) {
    try {
        let productSize = new ProductSIZEModel({
            name: request.body.name
        })

        productSize = await productSize.save();

        if (!productSize) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Product Size Not created"
            });
        }
        return response.status(200).json({
            message: "The product Size created successfully",
            error: false,
            success: true,
            product: productSize,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function deleteProductSize(request, response) {
    try {
        // 1. Find the product first to get its image URLs
        const productSize = await ProductSIZEModel.findById(request.params.id)

        if (!productSize) {
            return response.status(404).json({
                message: "Size Not found",
                error: true,
                success: false
            });
        }
        // 4. Delete the product document from the database
        const deletedProductSize = await ProductSIZEModel.findByIdAndDelete(request.params.id);

        if (!deletedProductSize) {
            // This is a safety check; if the product was found but couldn't be deleted now
            return response.status(404).json({
                message: "Size not deleted!",
                success: false,
                error: true
            });
        }

        // 5. Send Final Success Response
        return response.status(200).json({
            success: true,
            error: false,
            message: "Product Size Deleted!",
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// export async function deleteMultipleProductSIZES(request, response) {
//     const { ids } = request.body;

//     if (!ids || !Array.isArray(ids) || ids.length === 0) {
//         return response.status(400).json({
//             error: true,
//             success: false,
//             message: 'Invalid input. Please provide an array of IDs.'
//         });
//     }

//     try {

//         // After all images are deleted, delete the products from database
//         const deleteResult = await ProductSIZEModel.deleteMany({ _id: { $in: ids } });

//         return response.status(200).json({
//             message: `${deleteResult.deletedCount} product Size(s) deleted successfully`,
//             error: false,
//             success: true,
//             deletedCount: deleteResult.deletedCount
//         });

//     } catch (error) {
//         console.error("Error in deleteMultipleProductSizes:", error);
//         return response.status(500).json({
//             message: error.message || "An error occurred while deleting product Sizes",
//             error: true,
//             success: false
//         });
//     }
// }

export async function updateProductSize(request, response) {
    try {
        const productSize = await ProductSIZEModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
            },
            { new: true }
        );
        if (!productSize) {
            return response.status(404).json({
                message: "the product Size can not be updated!",
                status: false,
            });
        }
        return response.status(200).json({
            message: "The product Size is updated",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getProductSizes(request, response) {
    try {
        const productSize = await ProductSIZEModel.find();
        if (!productSize) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }
        return response.status(200).json({
            error: false,
            success: true,
            data: productSize
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getProductSizesById(request, response) {
    try {
        const productSize = await ProductSIZEModel.findById(request.params.id);
        if (!productSize) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }
        return response.status(200).json({
            error: false,
            success: true,
            data: productSize
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function filters(request, response) {
    const { catId, subCatId, thirdSubCatId, minPrice, maxPrice, rating, page, limit } = request.body;

    const filters = {};

    if (catId?.length) {
        filters.catId = { $in: catId };
    }

    if (subCatId?.length) {
        filters.subCatId = { $in: subCatId };
    }

    if (thirdSubCatId?.length) {
        filters.thirdsubCatId = { $in: thirdSubCatId };
    }

    if (minPrice || maxPrice) {
        filters.price = {
            $gte: +minPrice || 0,
            $lte: +maxPrice || Infinity
        };
    }

    if (rating?.length) {
        filters.rating = { $in: rating };
    }

    try {
        const products = await ProductModel.find(filters)
            .populate("category")
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await ProductModel.countDocuments(filters);

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

const sortItems = (products, sortBy, order) => {
    return products.sort((a, b) => {
        if (sortBy === 'name') {
            return order === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }

        if (sortBy === "price") {
            return order === 'asc'
                ? a.price - b.price
                : b.price - a.price;
        }

        return 0;
    });
};

export async function sortBy(request, response) {
    const { products, sortBy, order } = request.body;
    const sortedItems = sortItems([...products?.products], sortBy, order);

    return response.status(200).json({
        error: false,
        success: true,
        products: sortedItems,
        page: 0,
        totalPages: 0
    });
}

// export async function searchProductController(request, response) {
//     try {
//         // const query = request.query.q;
//         const { query, page, limit } = request.body;

//         if (!query) {
//             return response.status(400).json({
//                 error: true,
//                 success: false,
//                 message: "Query is required"
//             });
//         }

//         const products = await ProductModel.find({
//             $or: [
//                 { name: { $regex: query, $options: "i" } },
//                 { brand: { $regex: query, $options: "i" } },
//                 { catName: { $regex: query, $options: "i" } },
//                 { subCat: { $regex: query, $options: "i" } },
//                 { thirdsubCat: { $regex: query, $options: "i" } },
//             ],
//         })
//             .populate("category").skip((page - 1) * limit)
//             .limit(parseInt(limit));

//                     const total = await products?.length;

//         return response.status(200).json({
//             error: false,
//             success: true,
//             products: products,
//             total: total,
//             page: parseInt(page),
//             totalPages: Math.ceil(total / limit)
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         })
//     }
// }

export async function searchProductController(request, response) {
    try {
        const { query, page = 1, limit = 25 } = request.body; // ✅ Add defaults

        if (!query) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "Query is required"
            });
        }

        // ✅ Create the search query
        const searchQuery = {
            $or: [
                { name: { $regex: query, $options: "i" } },
                { brand: { $regex: query, $options: "i" } },
                { catName: { $regex: query, $options: "i" } },
                { subCat: { $regex: query, $options: "i" } },
                { thirdsubCat: { $regex: query, $options: "i" } },
            ]
        };

        // ✅ Get total count BEFORE pagination
        const total = await ProductModel.countDocuments(searchQuery);

        // ✅ Get paginated products
        const products = await ProductModel.find(searchQuery)
            .populate("category")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .exec(); // ✅ Add .exec()

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}