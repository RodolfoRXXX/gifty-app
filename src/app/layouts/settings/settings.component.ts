import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ConectorsService } from 'src/app/services/conectors.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {

  opened: boolean = false;
  mode!: any;
  title!: string;

  profileId: string | null = null;

  constructor(
    private _conector: ConectorsService,
    private _auth: AuthService,
    private _router: Router
  ) {
    this._conector.getOpenedState().subscribe( state => this.opened = state );
    this._conector.getScreenState().subscribe( state => state?this.mode = 'side':this.mode = 'over' );
  }

  ngOnInit(): void {
    // Obtener el userId desde el localStorage
    let data = JSON.parse(this._auth.getDataFromLocalStorage())
    const profileId = data.profileId;
    if (profileId) {
      this._router.navigate(['settings/verify-account', profileId]);
    }

    //Actualiza el título de la vista de acuerdo al componente cargado
    this._conector.getUpdateTitle().subscribe( value => {
      (value)?this.title = value:this.title = ""
    })
  }

  //cierra el sidenav en una pantalla móvil cuando se oprime fuera del sidenav(backdrop)
  closeSidenav() {
    this._conector.setOpenedState(false);
  }

}
