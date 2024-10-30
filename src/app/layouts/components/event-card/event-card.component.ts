import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material/material/material.module';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { daysUntilDate, getMonthNameForDate } from 'src/app/shared/functions/date.function';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule
  ],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.scss'
})
export class EventCardComponent implements OnInit {

  @Input() event!: any;
  uriImg = environment.SERVER;
  goal: number = 0;
  messages: number = 0;
  gifts: number = 0;
  isUser!: boolean;
  daysLeft!: number;
  displayMessage: string = '';
  isFollowed: boolean = false;

  constructor(
    private _api: ApiService,
    private _auth: AuthService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.daysLeft = daysUntilDate(this.event.date);
    this.displayMessage = this.daysLeft < 365 
    ? (this.daysLeft > 0 ? 'Faltan ' + this.daysLeft + ' días' : 'Hace ' + (-1) * this.daysLeft + ' días') 
    : 'Es hoy!';

    this.isFollowed = Array.isArray(JSON.parse(this.getLocalStorageData().followers)) && 
                  JSON.parse(this.getLocalStorageData().followers).some(
                    (value: any) => value == this.event.profileId
                  );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'].currentValue !== undefined) {
      this.isUser = (JSON.parse(this._auth.getDataFromLocalStorage()).profileId === this.event.profileId);
      if(changes['event'].currentValue.goal > 0) {
        this.getGoal(changes['event'].currentValue.eventId, changes['event'].currentValue.goal);
        this.countMessages(changes['event'].currentValue.eventId);
        this.countGifts(changes['event'].currentValue.eventId);
      }
    }
  }

  getLocalStorageData() {
    return JSON.parse(this._auth.getDataFromLocalStorage())
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

  countMessages(eventId: string) {
    this._api.postTypeRequest('profile/count-messages-event', { eventId }).subscribe({
      next: (response: any) => {
        if(response.status == 1 && response.data.length) {
           this.messages = response.data[0].total;
        } else {
          this.messages = 0;
        }
      },
      error: (err) => {
        this.messages = 0;
      }
    });
  }

  countGifts(eventId: string) {
    this._api.postTypeRequest('profile/count-gifts-event', { eventId }).subscribe({
      next: (response: any) => {
        if(response.status == 1 && response.data.length) {
           this.gifts = response.data[0].total;
        } else {
          this.gifts = 0;
        }
      },
      error: (err) => {
        this.gifts = 0;
      }
    });
  }

  getEvent(eventId: string) {
    this._router.navigate(['./event', eventId]);
  }

  getMonth(date: string) {
    return getMonthNameForDate(date)
  }

  onLinkClick(event: MouseEvent): void {
    // Detener la propagación del evento de clic hacia la caja
    event.stopPropagation();
  }

  follow(status: boolean) {
    console.log(status)
  }

}
