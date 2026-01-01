import { Router } from 'express';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import {
  addHomeSlide,
  deleteMultipleSlides,
  deleteSlides,
  getHomeSlides,
  getSlide,
  removeImageFromCloudinary,
  updatedSildes,
  uploadImages
} from '../controllers/homeSlider.controller.js';

const homeSlidesRouter = Router();

/* --------- UPLOAD --------- */
homeSlidesRouter.post(
  '/uploadImages',
  auth,
  upload.array('images'),
  uploadImages
);

/* --------- CREATE --------- */
homeSlidesRouter.post('/create', auth, addHomeSlide);

/* --------- READ --------- */
homeSlidesRouter.get('/', getHomeSlides);
homeSlidesRouter.get('/:id', getSlide);

/* --------- DELETE --------- */
homeSlidesRouter.delete('/deleteMultipleSlides', auth, deleteMultipleSlides);
homeSlidesRouter.delete('/deleteImage', auth, removeImageFromCloudinary);
homeSlidesRouter.delete('/:id', auth, deleteSlides);

/* --------- UPDATE --------- */
homeSlidesRouter.put('/:id', auth, updatedSildes);

export default homeSlidesRouter;
