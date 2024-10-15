import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
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

  @ViewChild('eventBox') eventBox!: ElementRef;
  @ViewChild('eventContent') eventContent!: ElementRef;

  isOverflowing: boolean = false;

  ngAfterViewInit(): void {
    this.checkOverflow();
  }

  checkOverflow(): void {
    const container = this.eventBox.nativeElement;
    const content = this.eventContent.nativeElement;

    // Verifica si el contenido se desborda horizontalmente
    if (content.scrollWidth > container.clientWidth) {
      this.isOverflowing = true; // Activa la animación si el contenido desborda
    }
  }
}
