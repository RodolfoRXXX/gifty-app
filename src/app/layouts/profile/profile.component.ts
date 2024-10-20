import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { EventCardComponent } from '../components/event-card/event-card.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogProfileEditComponent } from '../components/dialog-profile-edit/dialog-profile-edit.component';
import { DialogEventEditComponent } from '../components/dialog-event-edit/dialog-event-edit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

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
export class ProfileComponent {

  profileId!: string | null;
  profileData: any; // Aquí guardarás los datos del perfil
  loading: boolean = true;
  uriImg = environment.SERVER;
  isUser!: boolean;

  constructor(
    private _actRoute: ActivatedRoute,
    private _api: ApiService,
    private _auth: AuthService,
    private _dialog: MatDialog,
    private _router: Router
  ) {}

  ngOnInit(): void {
    // Obtener el id desde la URL
    this.profileId = this._actRoute.snapshot.paramMap.get('profileId');

    const data = JSON.parse(this._auth.getDataFromLocalStorage());
    this.isUser = (data.profileId === this.profileId);
    
    if (this.profileId) {
      this.getUserData(this.profileId);
    } else {
      this._router.navigate(['../page-not-found']);
    }
  }

  getUserData(profileId: string) {
    // Llamar a la API para obtener los datos del perfil
    this._api.postTypeRequest('profile/get-profile-id', { profileId }).subscribe({
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

  //Abrir el modal de edición de perfíl
  editProfile(id: string) {
    console.log(id)
    this._dialog.open(DialogProfileEditComponent, { data: { id:id }});
  }
  //Abrir el modal de edición de evento
  editEvent(id: string) {
    console.log(id)
    this._dialog.open(DialogEventEditComponent, { data: { id:id }});
  }

}
