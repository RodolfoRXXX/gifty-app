import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { SecurityComponent } from 'src/app/layouts/settings/children/security/security.component';
import { VerifyAccountComponent } from './children/verify-account/verify-account.component';

const routes: Routes = [
  { path: '', component: SettingsComponent,
    children: [
      { 
        path: '',
        redirectTo: 'verify-account',
        pathMatch: 'full' 
      },
      { 
        path: 'verify-account/:id',
        component: VerifyAccountComponent
      },
      { 
        path: 'security/:id',
        component: SecurityComponent 
      },
      { 
        path: '**',
        redirectTo: 'verify-account',
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
