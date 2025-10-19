import CategoryModel from '../models/category.model.js'
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ProductModel from '../models/product.model.js';

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

// create product
export async function createProduct(request, response) {
    try {
        let product = new ProductModel({
            name: request.body.name,
            description: request.body.description,
            images: imagesArr,
            brand: request.body.brand,
            price: request.body.price,
            oldPrice: request.body.oldPrice,
            catName: request.body.catName,
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

// get all products
export async function getAllProducts(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage);
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            });
        }

        const products = await ProductModel.find()
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

    let img="";
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