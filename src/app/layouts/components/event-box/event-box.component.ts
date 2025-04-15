import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material/material/material.module';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { daysUntilDate, getMonthNameForDate, yearsSinceDate } from 'src/app/shared/functions/date.function';
import { environment } from 'src/environments/environment';
import { DialogEventEditComponent } from '../dialog-event-edit/dialog-event-edit.component';
import { ButtonFollowComponent } from '../button-follow/button-follow.component';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-event-box',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ButtonFollowComponent
  ],
  templateUrl: './event-box.component.html',
  styleUrl: './event-box.component.scss'
})
export class EventBoxComponent implements OnInit, OnChanges {

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
  currentUrl: string = '';
  shareMessage: string = '';

  constructor(
    private _api: ApiService,
    private _router: Router,
    private _auth: AuthService,
    private _dialog: MatDialog,
    private _notify: NotificationService
  ) { }

  ngOnInit() {
    this.userData = JSON.parse(this.getUserData());
    const baseUrl = window.location.origin;
    const eventUrl = `${baseUrl}/event/${this.eventId}`;
    this.currentUrl = eventUrl;
  }

  getEncodedUrl(url: string): string {
    return encodeURIComponent(url);
  }
  
  getEncodedMessage(message: string): string {
    return encodeURIComponent(message);
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
    this._api.postTypeRequest('profile/get-event', { eventId }).subscribe({
      next: (response: any) => {
        this.loading = false;
        if(response.status == 1 && response.data.length) {
          this.eventData = response.data[0];
          this.isUser = this.userData ? (this.userData.profileId === this.eventData.profileId) : false;
          // 👉 Generar URL y mensaje solo después de tener eventData
          this.shareMessage = `¡Mirá el evento de ${this.eventData.userName || this.eventData.email.split('@')[0]}! Podés regalarle algo especial 🎁`;
  
          if(this.eventData.goal > 0) {
            this.getGoal(eventId, this.eventData.goal);
            this.hasGoal = true;
          }
          this.getAcumulatted(this.eventData.date);
          this.daysUntil(this.eventData.date);
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

  copyLink() {
    navigator.clipboard.writeText(this.currentUrl).then(() => {
      this._notify.showSuccess('Enlace copiado');
    });
  }

  doneFollow(event: any) {
    //Acción terminada
  }

}
