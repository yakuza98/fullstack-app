import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {AnalyticsService} from "../shared/services/analytics.service";
import {AnalyticsPage} from "../shared/interfaces";
import {Subscription} from "rxjs";
import {Chart} from "chart.js/auto"

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss']
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy{

  @ViewChild('gain') gainRef: ElementRef | any
  @ViewChild('order') orderRef: ElementRef | any


  average?: number
  pending = true
  aSub?: Subscription
  constructor(
    private service: AnalyticsService) {}

//  *** якщо ми зробимо запит в ngOnit і сервіс виконає швидку відповідь і
//   DOM не встигне відмалюватись. Тому вкионуємо логігку з графіком в AfterViewInit

  ngAfterViewInit() {
    // config для графіку.
    const gainConfig: any = {
      label: 'Дохід',
      color: 'rgb(255, 99, 132)'
    }

    const orderConfig: any = {
      label: 'Замовлення',
      color: 'rgb(54, 162, 235)'
    }

    this.aSub = this.service.getAnalytics().subscribe( (data: AnalyticsPage)=> {
      this.average = data.average

      gainConfig.labels = data.chart.map(item => item.label)
      gainConfig.data = data.chart.map(item => item.gain)

      orderConfig.labels = data.chart.map(item => item.label)
      orderConfig.data = data.chart.map(item => item.order)


      // ***** Gain *****
      gainConfig.labels.push('09.05.2023')
      gainConfig.labels.push('10.05.2023')
      gainConfig.labels.push('11.05.2023')
      gainConfig.data.push(1000)
      gainConfig.data.push(800)
      gainConfig.data.push(1000)
      //  ***** /Gain *****

      // ***** Order *****
      orderConfig.labels.push('09.05.2023')
      orderConfig.labels.push('10.05.2023')
      orderConfig.labels.push('11.05.2023')
      orderConfig.data.push(8)
      orderConfig.data.push(2)
      orderConfig.data.push(5)
      //  ***** /Order *****

      const gainCtx = this.gainRef.nativeElement.getContext('2d')
      const orderCtx = this.orderRef.nativeElement.getContext('2d')
      gainCtx.canvas.height = '300px'
      orderCtx.canvas.height = '300px'

      new Chart (gainCtx, createChartConfig(gainConfig))
      new Chart (orderCtx, createChartConfig(orderConfig))

      this.pending = false
    })
  }
  ngOnDestroy() {
    if (this.aSub){
      this.aSub?.unsubscribe()
    }

  }
}

function createChartConfig({labels, data, label, color}: any) : any {
  return {
    type: ['line'],
    options: {
      responsive: true
    },
    data:{
      labels,
      datasets: [
        {
          label, data,
          borderColor: color,
          steppedLine: false,
          fill: false
        }
      ]
    }
  }
}

