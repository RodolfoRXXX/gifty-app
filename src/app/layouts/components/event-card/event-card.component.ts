import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
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
export class EventCardComponent {

  @Input() event!: any;
  uriImg = environment.SERVER;
  hasGoal!: boolean;
  goal: number = 0;
  isUser!: boolean;

  constructor(
    private _api: ApiService,
    private _auth: AuthService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'].currentValue !== undefined) {
      this.isUser = (JSON.parse(this._auth.getDataFromLocalStorage()).profileId === this.event.profileId);
      if(changes['event'].currentValue.goal > 0) {
        this.getGoal(changes['event'].currentValue.eventId, changes['event'].currentValue.goal);
        this.hasGoal = true;
      }
    }
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

  getMonth(date: string) {
    return getMonthNameForDate(date)
  }

  daysUntil(date: string) {
    return daysUntilDate(date)
  }

}
