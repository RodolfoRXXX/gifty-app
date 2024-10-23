import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-gift-message-box',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './gift-message-box.component.html',
  styleUrl: './gift-message-box.component.scss'
})
export class GiftMessageBoxComponent {

  @Input() gift!: any;
  uriImg = environment.SERVER;

}
