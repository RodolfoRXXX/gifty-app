import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer.component';
import { is_eddla_main } from 'src/app/guards/operation.guard';
import { CustomerListComponent } from './children/customer-list/customer-list.component';

const routes: Routes = [
  { 
    path: '', component: CustomerComponent,
      children: [
        { 
          path: '', 
          redirectTo: 'customer-list', 
          pathMatch: 'full' 
        },
        {
          path: 'customer-list',
          component: CustomerListComponent
        },
        { 
          path: '**',
          redirectTo: 'customer-list',
          pathMatch: 'full' }
      ]
   }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
