import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { GiftMessageBoxComponent } from '../gift-message-box/gift-message-box.component';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-gift-box',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    GiftMessageBoxComponent
  ],
  templateUrl: './gift-box.component.html',
  styleUrl: './gift-box.component.scss'
})
export class GiftBoxComponent {

  @Input() eventId!: string | null;
  giftList: any[] = [];
  total: number = 0;

  constructor(
    private _api: ApiService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventId'].currentValue !== undefined) {
      //this.loading = true;
      this.loadGift(changes['eventId'].currentValue)
    }
  }

  loadGift(eventId: string) {
    // Llamar a la API para obtener los datos del evento
    this._api.postTypeRequest('profile/get-gift-event', { eventId }).subscribe({
      next: (response: any) => {
        if(response.status == 1 && response.data.length) {
          this.giftList = response.data
          this.total = this.getTotalGift(response.data);
        } else {
          this.giftList = [];
        }
      },
      error: (err) => {
        this.giftList = [];
      }
    });
  }

  getTotalGift(list: any[]) {
    let sub = 0;
    list.forEach(element => {
      sub += element.qty
    });
    return sub
  }

}
