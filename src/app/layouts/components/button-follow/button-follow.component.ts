import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from 'src/app/material/material/material.module';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-button-follow',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
  ],
  templateUrl: './button-follow.component.html',
  styleUrl: './button-follow.component.scss'
})
export class ButtonFollowComponent {

  constructor(
    private _api: ApiService,
    private _auth: AuthService,
    private _router: Router
  ) {}

  @Input() profileId!: any;
  @Input() hideText!: boolean;
  @Output() doneFollow: EventEmitter<any> = new EventEmitter();

  profileData: any;
  loadingFollow: boolean = false;

  getLocalStorageData() {
    return JSON.parse(this._auth.getDataFromLocalStorage())
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profileId'].currentValue !== undefined) {
      this.getUserData(changes['profileId'].currentValue)
    }
  }

  getUserData(profileId: string | null) {
    this.loadingFollow = true;
    // Llamar a la API para obtener los datos del perfil
    this._api.postTypeRequest('profile/get-profile', { profileId }).subscribe({
      next: (response: any) => {
        if(response.status == 1 && response.data.length) {
          this.profileData = response.data[0]; // Almacenar los datos del perfil
          this.loadingFollow = false; // Desactivar el estado de carga
        } else {
          this._router.navigate(['../page-not-found']);
        }
      },
      error: (err) => {
        this._router.navigate(['../page-not-found']);
        this.loadingFollow = false;
      }
    });
  }

  follow(status: boolean, ownerId: string, ownerFollowers: string) {
    this.loadingFollow = true;
    const data = this.getLocalStorageData();
    if (!data) {
        this._router.navigate(['../login']);
        return;
    }
    let visitorListOfFollowed: string[] = data.followed ? JSON.parse(data.followed) : [];
    let ownerListOfFollowers: string[] = ownerFollowers ? JSON.parse(ownerFollowers) : [];
    // Encuentra el índice del profileId en followers (si existe)
    const indexVisitorFollowed = visitorListOfFollowed.indexOf(ownerId);
    const indexOwnerFollowers = ownerListOfFollowers.indexOf(data.profileId);
    if (status) {
        // Si el usuario quiere seguir, añade el profileId si no está presente
        if (indexVisitorFollowed === -1) {
            visitorListOfFollowed.push(ownerId);
        }
        if (indexOwnerFollowers === -1) {
            ownerListOfFollowers.push(data.profileId);
        }
    } else {
        // Si el usuario quiere dejar de seguir, elimina el profileId si está presente
        if (indexVisitorFollowed !== -1) {
            visitorListOfFollowed.splice(indexVisitorFollowed, 1);
        }
        if (indexOwnerFollowers !== -1) {
            ownerListOfFollowers.splice(data.profileId, 1);
        }
    }
    // Guarda los cambios en el localStorage (puedes agregar esta parte si es necesario)
    const followed = visitorListOfFollowed.length?JSON.stringify(visitorListOfFollowed):null;
    const followers = ownerListOfFollowers.length?JSON.stringify(ownerListOfFollowers):null;
    const profileId = data.profileId;
    this._api.postTypeRequest('profile/update-followers', { profileId, ownerId, followed, followers }).subscribe({
      next: (response: any) => {
        if(response.status == 1 && response.data) {
          data.followed = JSON.stringify(visitorListOfFollowed);
          localStorage.setItem('userData', JSON.stringify(data));
          this.loadingFollow = false;
          this.doneFollow.emit(true);
        } else {
          this.doneFollow.emit(false);
        }
      },
      error: (err) => {
        this.doneFollow.emit(false);
      }
    });
  }

  isFollow(): boolean {
    return (this.getLocalStorageData() && this.getLocalStorageData().followed)?(Array.isArray(JSON.parse(this.getLocalStorageData().followed)) && 
    JSON.parse(this.getLocalStorageData().followed).some(
      (value: any) => value == this.profileData.profileId
    )):false;
  }

}
