import { Injectable } from '@angular/core';
import { Menu } from '../interfaces/menu.interface';

const MENUSETTINGS = [
    { state: 'verify-account', name: 'Verificación', type: '', icon: 'badge', children: [] },
    { state: 'security', name: 'Seguridad', type: '', icon: 'security', children: [] }
];


@Injectable()
export class MenuItems {
    getMenuSettings(): Menu[] {
        return MENUSETTINGS;
    }
}