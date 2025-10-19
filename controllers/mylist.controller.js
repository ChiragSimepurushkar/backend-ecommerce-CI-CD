import MyListModel from "../models/myList.model.js";

export const addToMyListController = async (request, response) => {
  try {
    const userId = request.userId; // Retrieved from auth middleware
    const { 
        productId,
        productTitle,
        image,
        rating,
        price,
        oldPrice,
        brand,
        discount 
    } = request.body;

    // --- 1. Check for Duplicate Item ---
    const item = await MyListModel.findOne({
      userId: userId,
      productId: productId
    });

    if (item) {
      return response.status(400).json({
        message: "Item already in my list",
        error: true, // Added error flag for consistency
        success: false
      });
    }

    // --- 2. Create and Save New MyList Document ---
    const myList = new MyListModel({
        productId,
        productTitle,
        image,
        rating,
        price,
        oldPrice,
        brand,
        discount,
        userId // Assign the authenticated user ID
    });

    const save = await myList.save();

    // --- 3. Send Success Response ---
    return response.status(200).json({
      error: false,
      success: true,
      message: "The product saved in the my list",
      data: save // Optionally return the saved document
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

export const deleteToMyListController = async (request, response) => {
  try {
    const myListId = request.params.id; // Assuming ID is passed in URL params

    // 1. Check if item exists (Optional pre-check for better error message)
    const myListItem = await MyListModel.findById(myListId);

    if (!myListItem) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "The item with this given id was not found"
      });
    }

    // 2. Attempt to delete the item
    const deletedItem = await MyListModel.findByIdAndDelete(myListId);

    // 3. Final check after deletion attempt (Should be redundant if initial check passed, 
    // but useful if findById failed for other reasons)
    if (!deletedItem) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "The item is not deleted"
      });
    }

    // 4. Send Success Response
    return response.status(200).json({
      error: false,
      success: true,
      message: "The item removed from My List Successfully!!"
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

export const getMyListController = async (request, response) => {
  try {
    const userId = request.userId; // Retrieved from auth middleware

    const myListItems = await MyListModel.find({
      userId: userId
    });

    return response.status(200).json({
      error: false,
      success: true,
      data: myListItems
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

