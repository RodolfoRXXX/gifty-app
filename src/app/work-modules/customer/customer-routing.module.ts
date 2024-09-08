import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer.component';
import { CustomerListComponent } from './children/customer-list/customer-list.component';
import { CustomerEditComponent } from './children/customer-edit/customer-edit.component';
import { CustomerDetailComponent } from './children/customer-detail/customer-detail.component';

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
          path: 'customer-edit',
          component: CustomerEditComponent
        },
        {
          path: 'customer-detail',
          component: CustomerDetailComponent
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
