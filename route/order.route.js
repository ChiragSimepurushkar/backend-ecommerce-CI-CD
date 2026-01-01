import { Router } from 'express';
import auth from '../middlewares/auth.js';
import { captureOrderPaypalController, createOrderController, createOrderPaypalController, getOrderCountController, getOrderDetailsController, totalSalesController, totalUsersController, updateOrderStatusController } from '../controllers/order.controller.js';

const orderRouter = Router();

orderRouter.post('/create', auth, createOrderController);
orderRouter.get('/order-list', auth, getOrderDetailsController);
orderRouter.get('/count', auth, getOrderCountController);

orderRouter.get('/create-order-paypal', auth, createOrderPaypalController);
orderRouter.post('/capture-order-paypal', auth, captureOrderPaypalController);
orderRouter.put('/order-status/:id', auth, updateOrderStatusController);

orderRouter.get('/sales', auth, totalSalesController);
orderRouter.get('/users', auth, totalUsersController);

export default orderRouter;