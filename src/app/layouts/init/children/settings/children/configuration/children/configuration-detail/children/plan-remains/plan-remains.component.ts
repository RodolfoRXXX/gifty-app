import { Component, Input, SimpleChanges } from '@angular/core';
import { calcularDiasRestantes, calcularNuevaFecha } from 'src/app/shared/functions/date.function';
import { Enterprise } from 'src/app/shared/interfaces/enterprise.interface';

@Component({
  selector: 'app-plan-remains',
  templateUrl: './plan-remains.component.html',
  styleUrl: './plan-remains.component.scss'
})
export class PlanRemainsComponent {

  @Input() enterprise!: Enterprise;
  remains: number = 0;
  dateDue!: string;
  statusPlan!: string;
  statusAccount!: string;

  //Toma los cambios del Input de entrada y actualiza el formulario
  ngOnChanges(changes: SimpleChanges) {
    if (changes['enterprise']) {
      if(this.enterprise) {
        this.setCard()
      }
    }
  }

  setCard() {
    this.remains = calcularDiasRestantes(30, this.enterprise.updatedPayment)
    this.dateDue = calcularNuevaFecha(30, this.enterprise.updatedPayment)
    this.statusAccount = (this.enterprise.status == 1)?'Activo':'Inactivo';
    this.statusPlan = (this.remains >= 0)?'Al día':'Atrasado';
  }

}
