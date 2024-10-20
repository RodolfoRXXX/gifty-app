import { NgModule } from '@angular/core';
import { isNot_active, isNot_authenticated, isNot_logged, is_logged } from './guards/auth.guard';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './layouts/home/home.component';
import { ProfileComponent } from './layouts/profile/profile.component';
import { EventComponent } from './layouts/event/event.component';

const routes: Routes = [
        { 
          path: '', 
          redirectTo: 'recharge', 
          pathMatch: 'full' 
        },
        {
          path: 'home',
          component: HomeComponent
        },
        {
          path: 'profile/:profileId',
          component: ProfileComponent
        },
        {
          path: 'event/:eventId',
          component: EventComponent
        },
        {
          path: 'settings',
          loadChildren: () => import('./layouts/settings/settings.module').then(m => m.SettingsModule),
          canActivate: [is_logged]
        },
        { 
          path: 'login', 
          loadChildren: () => import('./layouts/auth/login/login.module').then(m => m.LoginModule), 
          canActivate: [isNot_logged, isNot_authenticated] 
        },
        { 
          path: 'register', 
          loadChildren: () => import('./layouts/auth/register/register.module').then(m => m.RegisterModule), 
          canActivate: [isNot_logged, isNot_authenticated] 
        },
        { 
          path: 'recharge', 
          loadChildren: () => import('./layouts/auth/recharge/recharge.module').then(m => m.RechargeModule), 
          canActivate: [is_logged, isNot_authenticated] 
        },
        { 
          path: 'forget', 
          loadChildren: () => import('./layouts/auth/forget/forget.module').then(m => m.ForgetModule), 
          canActivate: [isNot_logged, isNot_authenticated] 
        },
        { 
          path: 'logoff', 
          loadChildren: () => import('./layouts/auth/logoff/logoff.module').then(m => m.LogoffModule), 
          canActivate: [is_logged] 
        },
        { 
          path: 'page-not-found', 
          loadChildren: () => import('./layouts/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) 
        },
        { 
          path: '**',
          redirectTo: 'page-not-found',
          pathMatch: 'full' 
        }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
