import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { GiftMessageBoxComponent } from '../gift-message-box/gift-message-box.component';

@Component({
  selector: 'app-gift-box',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    GiftMessageBoxComponent
  ],
  templateUrl: './gift-box.component.html',
  styleUrl: './gift-box.component.scss'
})
export class GiftBoxComponent {

}
