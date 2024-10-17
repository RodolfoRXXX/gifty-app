import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { EventBoxComponent } from '../components/event-box/event-box.component';
import { GiftBoxComponent } from '../components/gift-box/gift-box.component';
import { MessageCardComponent } from '../components/message-card/message-card.component';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    EventBoxComponent,
    GiftBoxComponent,
    MessageCardComponent
  ],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent {

}
