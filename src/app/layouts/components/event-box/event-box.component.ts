import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';

@Component({
  selector: 'app-event-box',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ],
  templateUrl: './event-box.component.html',
  styleUrl: './event-box.component.scss'
})
export class EventBoxComponent {

}
