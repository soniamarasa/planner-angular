import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { UserGuard } from '../guards/user.guard';
import { AccountComponent } from './account/account.component';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PagesComponent } from './pages.component';
import { PasswordRecoverComponent } from './password-recover/password-recover.component';
import { RegistrationComponent } from './registration/registration.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: HomeComponent,
      },
      {
        path: 'account',
        component: AccountComponent,
      },
    ],
  },

  {
    path: 'auth',
    // canActivate: [UserGuard],
    component: AuthComponent,
  },
  {
    path: 'password-reset/:token',
    // canActivate: [UserGuard],
    component: PasswordRecoverComponent,
  },
  {
    path: 'signup',
     // canActivate: [UserGuard],
    component: RegistrationComponent,
  },
  {
    path: 'password',
    component: PasswordRecoverComponent,
  },
  {
    path: '**',
    component: NotFoundComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
