import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material/material.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { InterceptorService } from './services/interceptor.service';
import { SpinnerComponent } from './shared/spinner.component';
import { HeaderLoginComponent } from './layouts/init/header/header-login/header-login.component';
import { HeaderRechargeComponent } from './layouts/init/header/header-recharge/header-recharge.component';

@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent,
    HeaderLoginComponent,
    HeaderRechargeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    
  ],
  exports: [
    
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
