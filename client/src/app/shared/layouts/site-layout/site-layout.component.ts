import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {MaterialService} from "../../classes/material.service";

@Component({
  selector: 'app-site-layout',
  templateUrl: './site-layout.component.html',
  styleUrls: ['./site-layout.component.scss']
})
export class SiteLayoutComponent implements AfterViewInit{

  imgSiteLogo = 'https://img.freepik.com/free-vector/vintage-monochrome-serious-gangster-gorilla-head_225004-513.jpg?w=740&t=st=1683113580~exp=1683114180~hmac=aaad109950acb4fdef32deb14562ac54755f61a979c0d5475e040a84770d2f98'
  @ViewChild('floating') floatingRef: ElementRef | any

  links = [
    {url: '/overview',name : 'Огляд'},
    {url: '/analytics',name : 'Аналітика'},
    {url: '/history',name : 'Історія'},
    {url: '/order',name : 'Додати замовлення'},
    {url: '/categories',name : 'Асортимент'}
  ]
  constructor(
    private auth: AuthService,
    private router: Router
  ) {
  }

  ngAfterViewInit() {

    MaterialService.initializeFloatingButton(this.floatingRef)

  }

  logout(event: Event) {
    event.preventDefault()
    this.auth.logout()
    this.router.navigate(['/login'])
  }
}
