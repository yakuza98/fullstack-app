import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Order} from "../../shared/interfaces";
import {MaterialInstance, MaterialService} from "../../shared/classes/material.service";

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss']
})
export class HistoryListComponent implements AfterViewInit, OnDestroy{

  @ViewChild('modal') modalRef: ElementRef | any
  @Input() orders?: Order[]

  selectedOrder?: Order
  modal: MaterialInstance | any

  ngAfterViewInit() {
    this.modal = MaterialService.initModal(this.modalRef)
  }
  ngOnDestroy() {
    this.modal.destroy()
  }

  computePrice(order: Order): number {
    return order.list.reduce((total, item) =>{
      return total += item.quantity * item.cost
    }, 0)
  }

  selectOrder(order: Order) {
    this.selectedOrder = order
    this.modal.open()
  }

  closeModal() {
    this.modal.close()
  }
}
