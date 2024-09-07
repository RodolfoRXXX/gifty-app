import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from './product.component';
import { ProductListComponent } from './children/product-list/product-list.component';
import { ProductEditComponent } from './children/product-edit/product-edit.component';
import { MaterialModule } from 'src/app/material/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { CategoryListComponent } from './children/category-list/category-list.component';
import { CategoryEditComponent } from './children/category-edit/category-edit.component';
import { ProductInformationComponent } from './children/product-edit/children/product-information/product-information.component';
import { ProductFiltersComponent } from './children/product-edit/children/product-filters/product-filters.component';
import { ProductImageComponent } from './children/product-edit/children/product-image/product-image.component';
import { ProductPriceComponent } from './children/product-edit/children/product-price/product-price.component';
import { ProductProviderDataComponent } from './children/product-edit/children/product-provider-data/product-provider-data.component';
import { ProductStockComponent } from './children/product-edit/children/product-stock/product-stock.component';
import { ProductStorageComponent } from './children/product-edit/children/product-storage/product-storage.component';


@NgModule({
  declarations: [
    ProductComponent,
    ProductListComponent,
    ProductEditComponent,
    ProductInformationComponent,
    ProductImageComponent,
    ProductProviderDataComponent,
    ProductStockComponent,
    ProductPriceComponent,
    ProductStorageComponent,
    CategoryListComponent,
    CategoryEditComponent,
    ProductFiltersComponent
  ],
  imports: [
    CommonModule,
    ProductRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule
  ]
})
export class ProductModule { }
