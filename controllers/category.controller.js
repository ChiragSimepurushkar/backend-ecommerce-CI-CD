import CategoryModel from '../models/category.model.js'
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

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

//create category
export async function createCategory(request, response) {
    try {
        let category = new CategoryModel({
            name: request.body.name,
            images: imagesArr,
            parentId: request.body.parentId,
            parentCatName: request.body.parentCatName,
        });

        if (!category) {
            return response.status(500).json({
                message: "Category Not created",
                error: true,
                success: false
            });
        }
        category = await category.save();
        imagesArr = [];

        return response.status(200).json({
            message: "Category created Successfully!!",
            error: false,
            success: true,
            category: category
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//get categories
export async function getCategories(request, response) {
    try {
        const categories = await CategoryModel.find();
        const categoryMap = {};

        categories.forEach(cat => {
            categoryMap[cat._id] = { ...cat._doc, children: [] };
        });

        const rootCategories = [];
        categories.forEach(cat => {
            if (cat.parentId) {
                categoryMap[cat.parentId].children.push(categoryMap[cat._id]);
            } else {
                rootCategories.push(categoryMap[cat._id]);
            }
        });

        return response.status(200).json({
            error: false,
            success: true,
            data: rootCategories
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//get category count
export async function getCategoriesCount(request, response) {
    try {
        const categoryCount = await CategoryModel.countDocuments({ parentId: undefined });

        if (!categoryCount) {
            response.status(500).json({ success: false, error: true });
        } else {
            response.send({
                categoryCount: categoryCount,
            });
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//get sub category count
export async function getSubCategoriesCount(request, response) {
    try {
        const categories = await CategoryModel.find();

        if (!categories) {
            response.status(500).json({ success: false, error: true });
        } else {
            const subCatList = [];
            for (let cat of categories) {
                if (cat.parentId !== undefined) {
                    subCatList.push(cat);
                }
            }

            response.send({
                SubCategoryCount: subCatList.length,
            });
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//get single category
export async function getCategory(request, response) {
    try {
        const category = await CategoryModel.findById(request.params.id);

        if (!category) {
            return response.status(500).json({
                message: "The category with the given ID was not found.",
                error: true,
                success: false
            });
        }
        return response.status(200).json({
            error: false,
            success: true,
            category: category
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

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

export async function deleteCategory(request, response) {
    try {
        // 1. Find the category and get the images array
        const category = await CategoryModel.findById(request.params.id);

        if (!category) {
            return response.status(404).json({ message: "Category not found." });
        }

        const images = category.images;

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

        const subCategory = await CategoryModel.find({
            parentId: request.params.id
        });

        for (let i = 0; i < subCategory.length; i++) {
            const thirdSubCategory = await CategoryModel.find({
                parentId: subCategory[i]._id
            });

            for (let j = 0; j < thirdSubCategory.length; j++) {
                const deletedThirdSubCat = await CategoryModel.findByIdAndDelete(thirdSubCategory[j]._id);
            }

            const deletedSubCat = await CategoryModel.findByIdAndDelete(subCategory[i]._id);
        }
        const deletedCat = await CategoryModel.findByIdAndDelete(request.params.id);
        if (!deletedCat) {
            return response.status(404).json({
                message: "Category not found!",
                success: false,
                error: true
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            message: "Category and associated images deleted successfully."
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function updatedCategory(request, response) {
  try {
    const category = await CategoryModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
        images: imagesArr.length>0? imagesArr[0]:request.body.images,
        parentId: request.body.parentId,
        parentCatName: request.body.parentCatName
      },
      { new: true } // Returns the updated document
    );

    if (!category) {
      return response.status(500).json({
        message: "Category cannot be updated!", // Or: "Category not found!"
        success: false,
        error: true
      });
    }
    
    // Clear the images array (assuming this is necessary global/scoped state cleanup)
    imagesArr = []; 

    return response.status(200).json({
      error: false,
      success: true,
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