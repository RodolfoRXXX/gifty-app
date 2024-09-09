import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from 'src/app/material/material/material.module';
import { CustomerListComponent } from './children/customer-list/customer-list.component';
import { CustomerEditComponent } from './children/customer-edit/customer-edit.component';
import { CustomerEditInfoComponent } from './children/customer-edit/children/customer-edit-info/customer-edit-info.component';
import { CustomerEditImageComponent } from './children/customer-edit/children/customer-edit-image/customer-edit-image.component';
import { CustomerDetailComponent } from './children/customer-detail/customer-detail.component';


@NgModule({
  declarations: [
    CustomerComponent,
    CustomerListComponent,
    CustomerEditComponent,
    CustomerEditInfoComponent,
    CustomerEditImageComponent,
    CustomerDetailComponent
  ],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule
  ]
})
export class CustomerModule { }
