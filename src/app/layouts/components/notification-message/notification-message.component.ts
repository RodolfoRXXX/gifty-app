import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { hoursSinceDate } from 'src/app/shared/functions/date.function';

@Component({
  selector: 'app-notification-message',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './notification-message.component.html',
  styleUrl: './notification-message.component.scss'
})
export class NotificationMessageComponent {

  @Input() notification: any;

  constructor(
    private _api: ApiService
  ) {}

  isBeen(date: string) {
    const hour = hoursSinceDate(date)
    return (hour < 48)?`Hace ${hour} horas`:`Hace ${Math.floor(hour/24)} días`
  }

}
