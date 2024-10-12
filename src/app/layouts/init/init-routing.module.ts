import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InitComponent } from './init.component';
import { InitResolver } from 'src/app/resolver/init.resolver';
import { isNot_active, isNot_active_enterprise, is_active, is_active_enterprise, is_employee } from 'src/app/guards/auth.guard';

const routes: Routes = [
  { path: '', component: InitComponent,
      children: [
        { 
          path: '', 
          redirectTo: 'main', 
          pathMatch: 'full' 
        },
        { 
          path: 'main',
          loadChildren: () => import('./children/main/main.module').then(m => m.MainModule), 
          canActivate: [is_active, is_active_enterprise, is_employee],
          resolve: { employee: InitResolver } 
        },
        { 
          path: 'verify', 
          loadChildren: () => import('./children/verify/verify.module').then(m => m.VerifyModule), 
          canActivate: [isNot_active]
        },
        { 
          path: 'blocked', 
          loadChildren: () => import('./children/blocked/blocked.module').then(m => m.BlockedModule), 
          canActivate: [is_active, isNot_active_enterprise]
        },
        { 
          path: 'settings', 
          loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule),
          resolve: { employee: InitResolver } 
        }
      ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InitRoutingModule {}
