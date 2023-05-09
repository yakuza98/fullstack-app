import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {MaterialInstance, MaterialService} from "../shared/classes/material.service";
import {OrderService} from "./order.service";
import {Order, OrderPosition} from "../shared/interfaces";
import {OrdersService} from "../shared/services/orders.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.scss'],
  providers: [OrderService]
})
export class OrderPageComponent implements OnInit, OnDestroy, AfterViewInit{

  @ViewChild('modal') modalRef: ElementRef | any
  isRoot?: boolean
  modal: MaterialInstance | any
  pending = false
  oSub?: Subscription
  constructor(private router: Router, public order: OrderService, private ordersService: OrdersService) {}

  ngOnInit() {
    // умова навігації між замовленням та доданням продукії.
    this.isRoot = this.router.url === '/order'
    this.router.events.subscribe(event => {
      // router.events - обробка події роутера.NavigationEnd - кінцевий етап подій.
      if (event instanceof NavigationEnd){
        this.isRoot = this.router.url === '/order'
      }
    })
  }

  ngOnDestroy() {
    this.modal.destroy()
    if(this.oSub){
      this.oSub.unsubscribe()
    }
  }
  ngAfterViewInit() {
    this.modal = MaterialService.initModal(this.modalRef)

  }

  removePosition(orderPosition: OrderPosition) {
    this.order.remove(orderPosition)
  }
  open(){
    this.modal.open()
  }

  cancel(){
    this.modal.close()
  }

  submit(){

    this.pending = true
    this.modal.close()

    const order: Order = {
      // таким чином в ордер потрапить всі параметри крім _id що в інтерфейсі.
      list: this.order.list.map(item => {
        delete item._id
        return item
      })
    }
    this.oSub = this.ordersService.create(order).subscribe(
      newOrder => {
        MaterialService.toast(`Замовлення №${newOrder.order} було додано.`)
        this.order.clear()
      },
      error => MaterialService.toast(error.error.message),
      ()=> {
        this.modal.close()
        this.pending = false
      }
    )
  }

}
