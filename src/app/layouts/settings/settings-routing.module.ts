import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { IndexComponent } from '../init/children/settings/children/index/index.component';
import { SecurityComponent } from 'src/app/layouts/settings/children/security/security.component';
import { is_eddle_settings } from 'src/app/guards/settings.guard';
import { is_employee } from 'src/app/guards/auth.guard';

const routes: Routes = [
  { path: '', component: SettingsComponent,
    children: [
      { 
        path: '',
        redirectTo: 'index',
        pathMatch: 'full' 
      },
      { 
        path: 'index',
        component: IndexComponent
      },
      { 
        path: 'profile', 
        loadChildren: () => import('../init/children/settings/children/profile/profile.module').then(m => m.ProfileModule),
        canActivate: [is_employee] 
      },
      { 
        path: 'enterprise-info',
        loadChildren: () => import('../init/children/settings/children/enterprise-info/enterprise-info.module').then(m => m.EnterpriseInfoModule),
        canActivate: [is_eddle_settings]
      },
      { 
        path: 'security',
        component: SecurityComponent 
      },
      { 
        path: 'configuration',
        loadChildren: () => import('../init/children/settings/children/configuration/configuration.module').then(m => m.ConfigurationModule)
      },
      { 
        path: '**',
        redirectTo: 'index',
        pathMatch: 'full' 
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
