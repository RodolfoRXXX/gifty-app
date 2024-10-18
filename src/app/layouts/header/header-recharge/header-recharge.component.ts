import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header-recharge',
  templateUrl: './header-recharge.component.html',
  styleUrl: './header-recharge.component.scss'
})
export class HeaderRechargeComponent {

  @Input() screenLarge!: boolean;
  @Input() isAuthenticated!: boolean;
  @Input() isLogged!: boolean;

  pic!: string;
  profileId!: string;

  constructor(
    private _auth: AuthService,
    private _router: Router
  ) {
    this.getDataUser();
  }

  getDataUser() {
    const data = JSON.parse(this._auth.getDataFromLocalStorage());
    this.pic = environment.SERVER + data.thumbnail;
    this.profileId = data.profileId;
  }

  logOff(): void {
    this._router.navigate(['../logoff']);
  }

  logOffAll(): void {
    this._auth.setRememberOption(false);
    this._router.navigate(['../logoff']);
  }

}
