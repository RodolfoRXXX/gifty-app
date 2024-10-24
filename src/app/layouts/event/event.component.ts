import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { EventBoxComponent } from '../components/event-box/event-box.component';
import { GiftBoxComponent } from '../components/gift-box/gift-box.component';
import { MessageCardComponent } from '../components/message-card/message-card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

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
export class EventComponent implements OnInit, OnDestroy {

  private routeSub!: Subscription;
  eventId!: string | null;
  messageList: any[] = [];
  isUser!: boolean;

  constructor(
    private _actRoute: ActivatedRoute,
    private _api: ApiService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.routeSub = this._actRoute.paramMap.subscribe(paramMap => {
      this.eventId = paramMap.get('eventId');
      this.getmessages(this.eventId);
      if (!this.eventId) {
        this._router.navigate(['../page-not-found']);
      }
    });
  }

  getmessages(eventId: string | null) {
    this._api.postTypeRequest('profile/get-messages-event', { eventId }).subscribe({
      next: (response: any) => {
        if(response.status == 1 && response.data.length) {
          this.messageList = response.data
        } else {
          this.messageList = [];
        }
      },
      error: (err) => {
        this.messageList = [];
      }
    });
  }

  // Al destruir el componente, cancelar la suscripción para evitar fugas de memoria
  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

}
