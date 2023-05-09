import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MaterialInstance, MaterialService} from "../shared/classes/material.service";
import {OrdersService} from "../shared/services/orders.service";
import {Subscription} from "rxjs";
import {Filter, Order} from "../shared/interfaces";


const STEP = 2
@Component({
  selector: 'app-history-page',
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.scss']
})
export class HistoryPageComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('tooltip') tooltipRef: ElementRef | any
  tooltip: MaterialInstance | any
  oSub?: Subscription
  isFilterVisible = false;
  offset = 0
  limit = STEP
  orders: Order[] = []
  filter: Filter = {}

  loading = false
  reloading = false
  noMoreOrders = false
  constructor(
    private ordersService: OrdersService
  ) {}

  ngOnInit() {
    this.reloading = true
    this.fetch()
  }

  private fetch() {
    // обробка get параметрів з беку.
    const params = Object.assign({}, this.filter, {
      offset: this.offset,
      limit: this.limit
    })
    this.oSub = this.ordersService.fetch(params).subscribe(orders => {
      this.orders = this.orders.concat(orders)
      this.noMoreOrders = orders.length < STEP
      this.loading = false
      this.reloading = false
      // конкатинуємо замовлення в історію.
    })
  }

  loadMore(){
    // конкатинуємо замовлення в історію.
    this.offset +=STEP
    this.loading = true
    this.fetch()
  }

  applyFilter(filter: Filter) {
    this.orders = []
    this.offset = 0
    this.filter = filter
    this.reloading = true
    this.fetch()
  }
  ngAfterViewInit() {
    this.tooltip = MaterialService.initTooltip(this.tooltipRef)
  }

  ngOnDestroy() {
    this.tooltip.destroy()
    this.oSub?.unsubscribe()
  }


  isFiltered(): boolean {
    return Object.keys(this.filter).length !==0
  }
}
