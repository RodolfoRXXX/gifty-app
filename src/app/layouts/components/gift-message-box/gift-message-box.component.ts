import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-gift-message-box',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './gift-message-box.component.html',
  styleUrl: './gift-message-box.component.scss'
})
export class GiftMessageBoxComponent {

  @Input() gift!: any;
  uriImg = environment.SERVER;

}
