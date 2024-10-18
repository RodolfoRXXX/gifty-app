import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConectorsService } from 'src/app/services/conectors.service';
import { Employee, empty_employee } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {

  opened: boolean = false;
  mode!: any;
  title!: string;
  sector!: string;
  employee!: Employee;

  profileId: string | null = null;

  constructor(
    private _actRoute: ActivatedRoute,
    private _conector: ConectorsService
  ) {
    this._conector.getOpenedState().subscribe( state => this.opened = state );
    this._conector.getScreenState().subscribe( state => state?this.mode = 'side':this.mode = 'over' );
    this.sector = 'Configuración';
  }

  ngOnInit(): void {
    this.profileId = this._actRoute.snapshot.paramMap.get('profileId');

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
