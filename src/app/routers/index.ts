import express, { Router } from 'express';
import { authRoute } from '../modules/auth/auth.routes';
import { projectRoute } from '../modules/projects/product.routes';
import { taskRoute } from '../modules/tasks/task.routes';
import { requestRouters } from '../modules/requests/request.routes';
import { submissionRoutes } from '../modules/submissions/submission.routes';


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
{
  path: '/tasks',
  route: taskRoute
},
{
  path: '/requests',
  route: requestRouters
},
{path:'/submissions',
  route:submissionRoutes
}

];


moduleRoutes.forEach(route => {
  routers.use(route.path, route.route);
});

export default routers;
