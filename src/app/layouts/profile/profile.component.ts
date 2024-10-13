import { Component } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

}
