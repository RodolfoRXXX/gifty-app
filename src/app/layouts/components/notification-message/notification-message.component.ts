import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notification-message',
  standalone: true,
  imports: [
    RouterModule
  ],
  templateUrl: './notification-message.component.html',
  styleUrl: './notification-message.component.scss'
})
export class NotificationMessageComponent {

  @Input() notification: any;

  constructor(

  ) {}



}
