import { Component, Input, OnInit } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { RouterModule } from '@angular/router';
import { MenuItems } from '../../menu-items/menu-items';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
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

  profileId!: string;

  constructor(
    public menuItems: MenuItems,
    private _auth: AuthService
  ) { }

  ngOnInit(): void {
    // Obtener el userId desde el localStorage
    let data = JSON.parse(this._auth.getDataFromLocalStorage())
    this.profileId = data.profileId;
  }
}
