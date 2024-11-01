import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material/material/material.module';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { daysUntilDate, getMonthNameForDate, yearsSinceDate } from 'src/app/shared/functions/date.function';
import { environment } from 'src/environments/environment';
import { DialogEventEditComponent } from '../dialog-event-edit/dialog-event-edit.component';

@Component({
  selector: 'app-event-box',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule
  ],
  templateUrl: './event-box.component.html',
  styleUrl: './event-box.component.scss'
})
export class EventBoxComponent implements OnInit {

  @Input() eventId!: string | null;
  eventData!: any;
  userData!: any;
  isUser!: boolean;
  hasGoal!: boolean;
  uriImg = environment.SERVER;
  goal: number = 0;
  loading!: boolean;
  yearsSince!: number;
  isFollowed: boolean = false;
  daysLeft!: number;
  displayMessage: string = '';

  constructor(
    private _api: ApiService,
    private _router: Router,
    private _auth: AuthService,
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
    this.userData = JSON.parse(this.getUserData());
  }

  getLocalStorageData() {
    return JSON.parse(this._auth.getDataFromLocalStorage())
  }

  getUserData() {
    return this._auth.getDataFromLocalStorage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventId'].currentValue !== undefined) {
      this.loading = true;
      this.getEvent(changes['eventId'].currentValue)
    }
  }

  getEvent(eventId: string | null) {
    // Llamar a la API para obtener los datos del evento
    this._api.postTypeRequest('profile/get-event', { eventId }).subscribe({
      next: (response: any) => {
        this.loading = false;
        if(response.status == 1 && response.data.length) {
          this.eventData = response.data[0]; // Almacenar los datos del evento
          this.isUser = this.userData?(this.userData.profileId === this.eventData.profileId):false;
          if(this.eventData.goal > 0) {
            this.getGoal(eventId, this.eventData.goal);
            this.hasGoal = true;
          }
          this.getAcumulatted(this.eventData.date)
          this.daysUntil(this.eventData.date)
        } else {
          this._router.navigate(['../page-not-found']);
        }
      },
      error: (err) => {
        this._router.navigate(['../page-not-found']);
        this.loading = false;
      }
    });
  }

  //Abrir el modal de edición de evento
  editEvent(profileId: string | null, eventId: string) {
    const editEventDialog = this._dialog.open(DialogEventEditComponent, { data: { profileId: profileId, eventId: eventId }});
    editEventDialog.afterClosed().subscribe(result => {
      if(result) {
        this.getEvent(this.eventId)
      }
    });
  }

  getGoal(eventId: string | null, goal: number) {
    this._api.postTypeRequest('profile/get-gift-event', { eventId }).subscribe({
      next: (response: any) => {
        let sub = 0;
        if(response.status == 1 && response.data.length) {
          response.data.forEach((element: any) => {
            sub += element.qty
          });
          this.goal = Math.floor((sub/goal)*100)
        } else {
          this.goal = 0;
        }
      },
      error: (err) => {
        this.goal = 0;
      }
    });
  }

  getAcumulatted(targetDate: string) {
    this.yearsSince = yearsSinceDate(targetDate)
  }

  getMonth(date: string) {
    return getMonthNameForDate(date)
  }

  daysUntil(date: string) {
    this.daysLeft = daysUntilDate(date);
    this.displayMessage = this.daysLeft < 365 
    ? (this.daysLeft > 0 ? 'Faltan ' + this.daysLeft + ' días' : 'Hace ' + (-1) * this.daysLeft + ' días') 
    : 'Es hoy!';
  }

  follow(status: boolean, profileId: string) {
    let data = this.getLocalStorageData()
    if(data) {
      //debe verificar si el array de followers esta vacío o no
        //si esta vacío, agrega el profileId
        console.log(JSON.parse(data.followers))
    } else {
      this._router.navigate(['../login']);
    }
  }

}
