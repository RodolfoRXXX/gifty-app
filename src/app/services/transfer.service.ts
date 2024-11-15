import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransferService {

  constructor(
    private _api: ApiService
  ) { }

  createTransfer(amount: number, payerEmail: string, receiverEmail: string): Observable<any> {
    return this._api.postTypeRequest('profile/transfer', { amount, payerEmail, receiverEmail });
  }

}
