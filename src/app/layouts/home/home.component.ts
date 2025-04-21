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

  autoScrollInterval: any;
  duplicatedEventList: any[] = [];

  constructor(
    private renderer: Renderer2,
    private _api: ApiService
  ) {}

  ngOnInit(): void {
    this.getEventList();
    this.setupMouseListeners();
  }

  ngAfterViewInit() {
    this.setupMouseListeners();
    this.startAutoScroll();
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

  startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      const box = this.eventBox.nativeElement;
      box.scrollLeft += 1;
  
      if (box.scrollLeft >= box.scrollWidth / 2) {
        box.scrollLeft = 0;
      }
    }, 20); // velocidad del scroll
  }
  
  stopAutoScroll() {
    clearInterval(this.autoScrollInterval);
  }
  
  setupMouseListeners(): void {
    const box = this.eventBox.nativeElement;
  
    this.renderer.listen(box, 'mousedown', (e: MouseEvent) => {
      this.isDragging = true;
      box.style.cursor = 'grabbing';
      this.startX = e.pageX - box.offsetLeft;
      this.scrollLeft = box.scrollLeft;
      this.stopAutoScroll();
    });
  
    this.renderer.listen(box, 'mouseleave', () => {
      if (this.isDragging) this.onMouseUp();
    });
  
    this.renderer.listen(box, 'mouseup', () => this.onMouseUp());
  
    this.renderer.listen(box, 'mousemove', (e: MouseEvent) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const x = e.pageX - box.offsetLeft;
      const walk = (x - this.startX) * 2;
      box.scrollLeft = this.scrollLeft - walk;
    });
  }
  
  onMouseUp() {
    this.isDragging = false;
    this.eventBox.nativeElement.style.cursor = 'grab';
    this.startAutoScroll(); // Reanuda el scroll automático
  }

  getEventList() {
    this._api.getTypeRequest('profile/get-event-top').subscribe({
      next: (response: any) => {
        this.eventLoading = false;
        if(response.status == 1 && response.data.length) {
          this.eventList = response.data; // Almacenar los datos
          //this.duplicatedEventList = [...this.eventList, ...this.eventList];
          this.duplicatedEventList = Array(5).fill(this.eventList).flat();
        } else {
          this.eventList = [];
          this.duplicatedEventList = [];
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
