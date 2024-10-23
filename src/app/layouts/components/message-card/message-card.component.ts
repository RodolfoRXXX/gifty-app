import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { daysSinceDate } from 'src/app/shared/functions/date.function';

@Component({
  selector: 'app-message-card',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ],
  templateUrl: './message-card.component.html',
  styleUrl: './message-card.component.scss'
})
export class MessageCardComponent {

  @Input() message!: any;

  daysSince(date: string) {
    return daysSinceDate(date);
  }

}
