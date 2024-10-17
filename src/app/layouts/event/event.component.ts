import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { EventBoxComponent } from '../components/event-box/event-box.component';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    EventBoxComponent
  ],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent {

}
