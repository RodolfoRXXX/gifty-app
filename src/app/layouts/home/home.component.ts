import { CommonModule } from '@angular/common';
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { ApiService } from 'src/app/services/api.service';
import { EventCardComponent } from '../components/event-card/event-card.component';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    EventCardComponent,
    FormsModule,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  @ViewChild('eventBox', { static: true }) eventBox!: ElementRef;
  @ViewChild('eventContent', { static: true }) eventContent!: ElementRef;

  isDragging = false;
  startX = 0;
  scrollLeft = 0;
  eventLoading: boolean = true;
  eventList: any[] = [];
  searchInput: string = '';
  results: any[] = [];
  loading: boolean = false;
  showResults: boolean = false;
  uriImg = environment.SERVER;

  constructor(
    private renderer: Renderer2,
    private _api: ApiService
  ) {}

  ngOnInit(): void {
    this.getEventList();
    this.setupMouseListeners();
  }

  onSearchChange(): void {
    if (this.searchInput.length >= 2) {
      this.loading = true;
      this.showResults = true;
      this.searchUsers(this.searchInput)
    } else {
      this.showResults = false;
      this.results = []; // Limpia los resultados si la longitud es menor a 2
    }
  }

  searchUsers(query: string) {
    // Llamar a la API para obtener los posibles perfiles buscados 
    this._api.postTypeRequest('profile/search-users', {query}).subscribe({
      next: (response: any) => {
        this.loading = false;
        if(response.status == 1 && response.data.length) {
          this.results = response.data;
        } else {
          //no hay equivalencia
          this.results = [];
        }
      },
      error: (err) => {
        //error
        this.loading = false;
        this.results = [];
      }
    });
  }

  setupMouseListeners(): void {
    // Mousedown: Detener animación y permitir el arrastre manual
    this.renderer.listen(this.eventBox.nativeElement, 'mousedown', (e: MouseEvent) => this.onMouseDown(e));
    this.renderer.listen(this.eventBox.nativeElement, 'mouseleave', () => this.onMouseLeave());
    this.renderer.listen(this.eventBox.nativeElement, 'mouseup', () => this.onMouseUp());
    this.renderer.listen(this.eventBox.nativeElement, 'mousemove', (e: MouseEvent) => this.onMouseMove(e));
  }
  onMouseDown(e: MouseEvent): void {
    // Detener la animación CSS al hacer clic
    this.eventContent.nativeElement.style.animationPlayState = 'paused';

    this.isDragging = true;
    this.eventBox.nativeElement.style.cursor = 'grabbing';
    this.startX = e.pageX - this.eventBox.nativeElement.offsetLeft;
    this.scrollLeft = this.eventBox.nativeElement.scrollLeft;
  }
  onMouseLeave(): void {
    if (this.isDragging) {
      this.onMouseUp(); // Detener arrastre si el mouse sale del contenedor
    }
  }
  onMouseUp(): void {
    this.isDragging = false;
    this.eventBox.nativeElement.style.cursor = 'grab';
    // Reiniciar la animación al soltar el mouse
    this.eventContent.nativeElement.style.animationPlayState = 'running';
  }
  onMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;

    e.preventDefault(); // Previene la selección de texto
    const x = e.pageX - this.eventBox.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 2; // Ajuste la velocidad del desplazamiento
    this.eventBox.nativeElement.scrollLeft = this.scrollLeft - walk;
  }

  getEventList() {
    this._api.getTypeRequest('profile/get-event-top').subscribe({
      next: (response: any) => {
        this.eventLoading = false;
        if(response.status == 1 && response.data.length) {
          this.eventList = response.data; // Almacenar los datos
        } else {
          this.eventList = [];
        }
      },
      error: (err) => {
        this.eventLoading = false;
        this.eventList = [];
      }
    });
  }

  getFollowersNumber(followers: string | null): number {
    return followers ? JSON.parse(followers).length : 0;
  }

}
