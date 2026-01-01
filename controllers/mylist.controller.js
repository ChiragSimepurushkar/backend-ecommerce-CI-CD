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

    // Validate userId exists
    if (!userId) {
      return response.status(401).json({
        message: "User not authenticated",
        error: true,
        success: false
      });
    }

    // --- 1. Check for Duplicate Item ---
    const item = await MyListModel.findOne({
      userId: userId,
      productId: productId
    });

    if (item) {
      return response.status(400).json({
        message: "Item already in my list",
        error: true,
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
      data: save
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
    const myListId = request.params.id;
    const userId = request.userId; // Get authenticated user

    // Validate userId exists
    if (!userId) {
      return response.status(401).json({
        message: "User not authenticated",
        error: true,
        success: false
      });
    }

    // 1. Find the item and verify it belongs to this user
    const myListItem = await MyListModel.findOne({
      _id: myListId,
      userId: userId // CRITICAL: Ensure user owns this item
    });

    if (!myListItem) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "The item with this given id was not found or you don't have permission"
      });
    }

    // 2. Delete the item
    const deletedItem = await MyListModel.findByIdAndDelete(myListId);

    if (!deletedItem) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "The item is not deleted"
      });
    }

    // 3. Send Success Response
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

    // Validate userId exists
    if (!userId) {
      return response.status(401).json({
        message: "User not authenticated",
        error: true,
        success: false
      });
    }

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