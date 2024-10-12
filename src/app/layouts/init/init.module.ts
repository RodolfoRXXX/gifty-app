import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InitRoutingModule } from './init-routing.module';
import { InitComponent } from './init.component';
import { MaterialModule } from 'src/app/material/material/material.module';


@NgModule({
  declarations: [
    InitComponent
  ],
  imports: [
    CommonModule,
    InitRoutingModule,
    MaterialModule
  ]
})
export class InitModule { }
