import { Router } from 'express';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import { createProduct, createProductRAMS, createProductSIZE, createProductWEIGHT, deleteMultipleProduct, deleteProduct, deleteProductRAMS, deleteProductSize, deleteProductWEIGHT, filters, getAllFeaturedProducts, getAllProducts, getAllProductsByCatId, getAllProductsByCatName, getAllProductsByPrice, getAllProductsByRating, getAllProductsBySubCatId, getAllProductsBySubCatName, getAllProductsByThirdLevelCatId, getAllProductsByThirdLevelCatName
    , getProduct, getProductRams, getProductRamsById, getProductsCount, getProductSizes, getProductSizesById, getProductWeights, getProductWeightsById, removeImageFromCloudinary, searchProductController, sortBy, updateProduct, updateProductRam, updateProductSize, updateProductWeight, uploadBannerImages, uploadImages } from '../controllers/product.controller.js';

const productRouter = Router();

productRouter.post('/uploadImages', auth, upload.array('images'), uploadImages);
productRouter.post('/uploadBannerImages', auth, upload.array('bannerimages'), uploadBannerImages);
productRouter.post('/create', auth, createProduct); // Added 'auth' middleware here for protection
productRouter.get('/getAllProducts', getAllProducts); 
productRouter.post('/search', searchProductController); 

productRouter.get('/getAllProductsByCatId/:id', getAllProductsByCatId); 
productRouter.get('/getAllProductsByCatName', getAllProductsByCatName); 
productRouter.get('/getAllProductsBySubCatId/:id', getAllProductsBySubCatId); 
productRouter.get('/getAllProductsBySubCatName', getAllProductsBySubCatName); 
productRouter.get('/getAllProductsByThirdLevelCatId/:id', getAllProductsByThirdLevelCatId); 
productRouter.get('/getAllProductsByThirdLevelCatName', getAllProductsByThirdLevelCatName); 
productRouter.get('/getAllProductsByPrice', getAllProductsByPrice); 
productRouter.get('/getAllProductsByRating', getAllProductsByRating); 
productRouter.get('/getAllProductsByCount', getProductsCount); 
productRouter.get('/getAllFeaturedProducts', getAllFeaturedProducts); 
productRouter.get('/productRAMS', getProductRams);
productRouter.get('/productRAMS/:id', getProductRamsById);
productRouter.get('/productWeight', getProductWeights);
productRouter.get('/productWeight/:id', getProductWeightsById); 
productRouter.get('/productSize', getProductSizes);
productRouter.get('/productSize/:id', getProductSizesById);  
productRouter.delete("/deleteMultipleProduct",auth, deleteMultipleProduct);
// productRouter.delete("/productRAMS/deleteMultipleProductRAMS", deleteMultipleProductRAMS);
// productRouter.delete("/productWeight/deleteMultipleProductWeights", deleteMultipleProductWEIGHTS);
// productRouter.delete("/productSize/deleteMultipleProductSizes", deleteMultipleProductSIZES);
productRouter.delete("/productRAMS/:id",auth, deleteProductRAMS);
productRouter.delete("/productWeight/:id",auth, deleteProductWEIGHT);
productRouter.delete("/productSize/:id",auth, deleteProductSize);
productRouter.delete('/deleteImage', auth, removeImageFromCloudinary);
productRouter.delete('/:id',auth,deleteProduct ); 
productRouter.post('/productRAMS/create', auth, createProductRAMS);
productRouter.post('/productWeight/create', auth, createProductWEIGHT);
productRouter.post('/productSize/create', auth, createProductSIZE);
productRouter.put('/updateProduct/:id', auth, updateProduct);
productRouter.put('/productRAMS/:id', auth, updateProductRam);
productRouter.put('/productWeight/:id', auth, updateProductWeight);
productRouter.put('/productSize/:id', auth, updateProductSize);

productRouter.post('/filters', filters);
productRouter.post('/sortBy', sortBy);

productRouter.get('/:id',getProduct ); 

export default productRouter;