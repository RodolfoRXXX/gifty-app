import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header-recharge',
  templateUrl: './header-recharge.component.html',
  styleUrl: './header-recharge.component.scss'
})
export class HeaderRechargeComponent implements OnInit {

  @Input() screenLarge!: boolean;
  @Input() isAuthenticated!: boolean;
  @Input() isLogged!: boolean;

  pic!: string;
  profileId!: string;
  notifications!: any[];

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private _api: ApiService
  ) {
    this.getDataUser();
  }

  ngOnInit(): void {
    this.getNotifications()
  }

  getLocalStorageData() {
    return JSON.parse(this._auth.getDataFromLocalStorage())
  }

  getDataUser() {
    const data = this.getLocalStorageData();
    this.pic = environment.SERVER + data.thumbnail;
    this.profileId = data.profileId;
  }

  getNotifications() {
    this._api.postTypeRequest('profile/get-notifications', {profileId: this.getLocalStorageData().profileId} ).subscribe({
      next: (response: any) => {
        if(response.status == 1 && response.data.length) {
          this.notifications = response.data
          console.log(response.data)
        } else {
          this.notifications = [];
        }
      },
      error: (err) => {
        this.notifications = [];
      }
    });
  }

  logOff(): void {
    this._router.navigate(['../logoff']);
  }

  logOffAll(): void {
    this._auth.setRememberOption(false);
    this._router.navigate(['../logoff']);
  }

}
