import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from '../middlewares/multer.js';
import { addBanner, deleteBanners,updateBanners, getBanner, getBanners, uploadImages } from "../controllers/bannerV1.controller.js";
import { removeImageFromCloudinary } from "../controllers/category.controller.js";

const bannerV1Router = Router();

bannerV1Router.post('/uploadImages', auth, upload.array('images'), uploadImages);
bannerV1Router.post('/add', auth, addBanner);
bannerV1Router.get('/', getBanners);
bannerV1Router.get('/:id', getBanner);
bannerV1Router.delete('/deleteImage', auth, removeImageFromCloudinary);
bannerV1Router.delete('/:id', auth, deleteBanners);
bannerV1Router.put('/:id', auth, updateBanners);

export default bannerV1Router;