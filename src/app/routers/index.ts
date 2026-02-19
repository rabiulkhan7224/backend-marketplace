import express, { Router } from 'express';
import { authRoute } from '../modules/auth/auth.routes';
import { projectRoute } from '../modules/projects/product.routes';


const routers: Router = express.Router();


const moduleRoutes = [
 
  {
    path: '/auth',
    route: authRoute
  },
  {
    path: '/projects',
    route: projectRoute
  },
];


moduleRoutes.forEach(route => {
  routers.use(route.path, route.route);
});

export default routers;
