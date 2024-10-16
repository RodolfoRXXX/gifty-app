import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ConectorsService } from 'src/app/services/conectors.service';
import { Employee } from 'src/app/shared/interfaces/employee.interface';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-init',
  templateUrl: './init.component.html'
})
export class InitComponent implements OnInit {

  isLogged!: boolean;
  isAuthenticated!: boolean;
  screenLarge!: boolean;
  openSidenav!: boolean;
  opened: boolean = false;
  mode!: any;
  title!: string;
  sector!: string;
  employee!: Employee;

  constructor(
    private _conector: ConectorsService,
    private cdRef:ChangeDetectorRef,
    public breakpointObserver: BreakpointObserver,
    private _auth: AuthService
  ) {
    this.setScreen();
  }

  ngOnInit(): void {
    this.isUserLogged();
    this.isUserAuthenticated()
    this._auth.isActive();
  }

  ngAfterViewChecked() {
    this._conector.getUpdateTitle().subscribe( title => {
      this.title = title;
    });
    this._conector.getUpdateSector().subscribe( sector => {
      this.sector = sector;
    });
    this.cdRef.detectChanges();
  }

  setScreen(): void {
    this.breakpointObserver
        .observe(['(min-width: 992px)'])
        .subscribe((state: BreakpointState) => {
          //para tamaños de pantalla mayores a 992 es TRUE, para menores es FALSE
          state.matches?(this.screenLarge = true):(this.screenLarge = false);
          this._conector.setScreenState(this.screenLarge);
          this._conector.setOpenedState(this.screenLarge);
        })
  }

  isUserLogged() {
    this._auth.isLogged$.subscribe( state => this.isLogged = state )
  }

  isUserAuthenticated() {
    this._auth.isAuthenticated$.subscribe( state => this.isAuthenticated = state )
  }

  toggleSidenav() {
    this._conector.getOpenedState().subscribe( state => this.opened = state );
    this._conector.setOpenedState(!this.opened);
  }

  ngOnDestroy(): void {
    this._auth.isNotAuthenticated();
  }

}
