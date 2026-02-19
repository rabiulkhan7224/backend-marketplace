import express, { Router } from 'express';
import { authRoute } from '../modules/auth/auth.routes';


const routers: Router = express.Router();


const moduleRoutes = [
 
  {
    path: '/auth',
    route: authRoute
  },
];


moduleRoutes.forEach(route => {
  routers.use(route.path, route.route);
});

export default routers;
