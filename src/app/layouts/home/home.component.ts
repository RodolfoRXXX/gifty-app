import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { EventCardComponent } from '../components/event-card/event-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    EventCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit {

  @ViewChild('eventBox', { static: true }) eventBox!: ElementRef;
  @ViewChild('eventContent', { static: true }) eventContent!: ElementRef;

  isDragging = false;
  startX = 0;
  scrollLeft = 0;

  constructor(private renderer: Renderer2) {}
  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
    this.setupMouseListeners();
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
}
