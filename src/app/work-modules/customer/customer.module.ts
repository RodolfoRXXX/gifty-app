import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from 'src/app/material/material/material.module';
import { CustomerListComponent } from './children/customer-list/customer-list.component';
import { CustomerEditComponent } from './children/customer-edit/customer-edit.component';


@NgModule({
  declarations: [
    CustomerComponent,
    CustomerListComponent,
    CustomerEditComponent
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
