import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material/material/material.module';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { daysUntilDate, getMonthNameForDate } from 'src/app/shared/functions/date.function';
import { environment } from 'src/environments/environment';

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

  constructor(
    private _api: ApiService,
    private _router: Router,
    private _auth: AuthService
  ) { }

  ngOnInit() {
    this.userData = JSON.parse(this.getUserData());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventId'].currentValue !== undefined) {
      this.loading = true;
      this.getEvent(changes['eventId'].currentValue)
    }
  }

  getEvent(eventId: string) {
    // Llamar a la API para obtener los datos del evento
    this._api.postTypeRequest('profile/get-event', { eventId }).subscribe({
      next: (response: any) => {
        if(response.status == 1 && response.data.length) {
          this.eventData = response.data[0]; // Almacenar los datos del evento
          this.isUser = (this.userData.profileId === this.eventData.profileId);
          if(this.eventData.goal > 0) {
            this.getGoal(eventId, this.eventData.goal);
            this.hasGoal = true;
          }
          this.loading = false; // Desactivar el estado de carga
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

  getGoal(eventId: string, goal: number) {
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

  getUserData() {
    return this._auth.getDataFromLocalStorage();
  }

  getMonth(date: string) {
    return getMonthNameForDate(date)
  }

  daysUntil(date: string) {
    return daysUntilDate(date)
  }

}
