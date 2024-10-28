import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DailyCheckService {

  constructor(private _api: ApiService) {}

  checkEventsDaily() {
    const today = new Date().toISOString().split('T')[0];
    const lastRun = localStorage.getItem('lastDailyCheck');

    if (lastRun !== today) {
      this.duplicateExpiredAnniversaries().subscribe(() => {
        localStorage.setItem('lastDailyCheck', today);
      });
    }
  }

  duplicateExpiredAnniversaries() {
    return this._api.postTypeRequest('profile/duplicateExpiredAnniversaries', '');
  }

}
