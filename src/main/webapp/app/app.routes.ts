import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Authority } from 'app/shared/jhipster/constants';
import { ProductosComponent } from './productos/productos.component';
import { DespensaComponent } from './despensa/despensa.component';
import { CompraComponent } from './compra/compra.component';
import { PanelComponent } from './panel/panel.component';
import { AdministrarComponent } from './administrar/administrar.component';

import { errorRoute } from './layouts/error/error.route';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home'),
    title: 'home.title',
  },
  {
    path: 'compra',
    component: CompraComponent,
    title: 'compra.title',
  },
  {
    path: 'productos',
    component: ProductosComponent,
    title: 'productos.title',
  },
  {
    path: 'despensa',
    component: DespensaComponent,
    title: 'despensa.title',
  },
  {
    path: '',
    loadComponent: () => import('./layouts/navbar/navbar'),
    outlet: 'navbar',
  },
  {
    path: 'administrar',
    component: AdministrarComponent,
    title: 'administrar.title',
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'admin',
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [UserRouteAccessService],
    loadChildren: () => import('./admin/admin.routes'),
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.route'),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login'),
    title: 'login.title',
  },
  {
    path: 'panel',
    component: PanelComponent,
    title: 'panel.title',
  },
  {
    path: '',
    loadChildren: () => import('./entities/entity.routes'),
  },
  ...errorRoute,
];

export default routes;
