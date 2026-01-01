import { Router } from 'express'
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import { createBlog, deleteBlog, getBlog, getBlogs, updatedBlog, uploadImages } from '../controllers/blog.controller.js';

const blogRouter = Router();

blogRouter.post('/uploadImages', auth, upload.array('blogImages'), uploadImages);
blogRouter.post('/add', auth, createBlog);
blogRouter.get('/', getBlogs);
blogRouter.get('/:id', getBlog);
blogRouter.delete('/:id', auth, deleteBlog);
blogRouter.put('/:id', auth, updatedBlog);

export default blogRouter;