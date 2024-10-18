import { Component, Input, OnInit } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { RouterModule } from '@angular/router';
import { MenuItems } from '../../menu-items/menu-items';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { ConectorsService } from 'src/app/services/conectors.service';
import { Employee } from '../../interfaces/employee.interface';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [
    RouterModule,
    MaterialModule,
    CommonModule
  ],
  providers: [
    MenuItems
  ]
})
export class SidebarComponent implements OnInit {

  @Input() setMenu!: string;
  @Input() employee!: Employee;
  name!: string;
  pic!: string;
  isOpen!: number;
  linkActive!: number;
  isActive!: number;
  isMobile!: boolean;

  constructor(
    public menuItems: MenuItems,
    private _auth: AuthService,
    private _conector: ConectorsService
  ) {
    this.getDataUser();
  }

  ngOnInit(): void {
    //largeScreen = true => isMobile = false
    this._conector.getScreenState().subscribe( largeScreen => this.isMobile = !largeScreen )
  }

  getDataUser() {
    const data = JSON.parse(this._auth.getDataFromLocalStorage());
    if(data.name.length) {
      this.name = data.name;
    }else {
      this.name = data.email.split("@")[0];
    }
  }
  setTitle( title: string ) {
    this._conector.setUpdateTitle(title);
  }
  setSector( sector: string ) {
    this._conector.setUpdateSector(sector);
  }

  //setLink() => Setea las variables isOpen y linkActive con un valor numérico,
  // este número es la ubicación en el arreglo de cada panel expansivo y de cada link que contiene cada panel expansivo
  //linkActive guarda el número de link activo, solo de paneles de links expandibles
  //isOpen guarda el número panel que está expandido
  //el condicional evalúa el link activo y si esta función fue llamada por un link no expandible, entonces valoriza isActive con 0
  // isActive es una variable numerica que guarda el número de panel expansible expandido, si queda 0 entonces el panel se retrae
  setLink(item: any) {
    this.linkActive = item
    this.isOpen = item;
    (item == 0)?this.isActive = 0:''
    if(this.isMobile) {
      this._conector.setOpenedState(false);
    }
  }

  //_isLinkActive() => es una función llamada por un emisor de eventos((isActiveChange)="") que devuelve TRUE si el link está activo o FALSE en
  // caso contrario y también devuelve el número de link activo para así valorizar la variable linkActive que permitirá agregar la clase 
  // panelExpanded (que sombrea) al panel que tiene un link activo
  _isLinkActive(event:any, item:any) {
    event?this.linkActive = item:''
  }

}
