import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { EventCardComponent } from '../components/event-card/event-card.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogProfileEditComponent } from '../components/dialog-profile-edit/dialog-profile-edit.component';
import { DialogEventEditComponent } from '../components/dialog-event-edit/dialog-event-edit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    EventCardComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {

  profileId!: string | null;
  profileData: any;
  eventList!: any[];
  loading: boolean = true;
  uriImg = environment.SERVER;
  isUser!: boolean;
  private routeSub!: Subscription;

  constructor(
    private _actRoute: ActivatedRoute,
    private _api: ApiService,
    private _auth: AuthService,
    private _dialog: MatDialog,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.routeSub = this._actRoute.paramMap.subscribe(paramMap => {
      this.profileId = paramMap.get('profileId');
      if (this.profileId) {
        this.getUserData(this.profileId);
        this.getEventList(this.profileId);
        const data = JSON.parse(this._auth.getDataFromLocalStorage());
        this.isUser = (data.profileId === this.profileId);
      } else {
        this._router.navigate(['../page-not-found']);
      }
    });
  }

  getUserData(profileId: string) {
    // Llamar a la API para obtener los datos del perfil
    this._api.postTypeRequest('profile/get-profile', { profileId }).subscribe({
      next: (response: any) => {
        if(response.status == 1 && response.data.length) {
          this.profileData = response.data[0]; // Almacenar los datos del perfil
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

  getEventList(profileId: string | null) {
    this._api.postTypeRequest('profile/get-event-list', { profileId }).subscribe({
      next: (response: any) => {
        if(response.status == 1 && response.data.length) {
          this.eventList = response.data; // Almacenar los datos
        } else {
          this.eventList = [];
        }
      },
      error: (err) => {
        this.eventList = [];
      }
    });
  }

  //Abrir el modal de edición de perfíl
  editProfile(profileId: string | null) {
    const editProfileDialog = this._dialog.open(DialogProfileEditComponent, { data: { profileId: profileId }});
      editProfileDialog.afterClosed().subscribe(result => {
        if(result) {
          window.location.reload();
        }
      });
  }
  //Abrir el modal de edición de evento
  editEvent(profileId: string | null, eventId: string) {
    const editEventDialog = this._dialog.open(DialogEventEditComponent, { data: { profileId: profileId, eventId: eventId }});
    editEventDialog.afterClosed().subscribe(result => {
      if(result) {
        this.getEventList(this.profileId);
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
