import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { EventCardComponent } from '../components/event-card/event-card.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogProfileEditComponent } from '../components/dialog-profile-edit/dialog-profile-edit.component';
import { DialogEventEditComponent } from '../components/dialog-event-edit/dialog-event-edit.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    EventCardComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  constructor(
    private _dialog: MatDialog
  ) {}

  //Abrir el modal de edición de perfíl
  editProfile(id: string) {
    console.log(id)
    this._dialog.open(DialogProfileEditComponent, { data: { id:id }});
  }
  //Abrir el modal de edición de evento
  editEvent(id: string) {
    console.log(id)
    this._dialog.open(DialogEventEditComponent, { data: { id:id }});
  }

}
