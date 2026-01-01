import { Router } from 'express';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoriesCount,
  getSubCategoriesCount,
  removeImageFromCloudinary,
  updatedCategory,
  uploadImages,
  getCategory
} from '../controllers/category.controller.js';

const categoryRouter = Router();

/* -------- UPLOAD -------- */
categoryRouter.post(
  '/uploadImages',
  auth,
  upload.array('images'),
  uploadImages
);

/* -------- CREATE -------- */
categoryRouter.post('/create', auth, createCategory);

/* -------- READ -------- */
categoryRouter.get('/', getCategories);
categoryRouter.get('/get/count', getCategoriesCount);
categoryRouter.get('/get/count/subCat', getSubCategoriesCount);
categoryRouter.get('/:id', getCategory);   // ✅ always last in GET

/* -------- DELETE -------- */
categoryRouter.delete('/deleteImage', auth, removeImageFromCloudinary);
categoryRouter.delete('/:id', auth, deleteCategory);

/* -------- UPDATE -------- */
categoryRouter.put('/:id', auth, updatedCategory);

export default categoryRouter;
