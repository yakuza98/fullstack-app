import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CategoriesService} from "../../shared/services/categories.service";
import {switchMap} from "rxjs/operators";
import {of, Observable} from "rxjs";
import {MaterialService} from "../../shared/classes/material.service";
import {Category, Message} from "../../shared/interfaces";

@Component({
  selector: 'app-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.scss']
})
export class CategoriesFormComponent implements OnInit{

  @ViewChild('input') inputRef?: ElementRef

  form: FormGroup | any
  image?: File
  isNew = true
  imagePreview: string | any
  category: Category | any

  constructor(
    private route: ActivatedRoute,
    private categoriesService: CategoriesService,
    private router: Router
  ) {}



  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required)
    })

    this.form.disable()

    // this.route.params.subscribe((params:Params)=>{
    //   if (params['id']) {
    //   //   ми редагуємо форму.
    //     this.isNew = false
    //   }
    // })

    this.route.params
      .pipe(
        // switchMap - потрібний для послідовних асинхронних запитів на сервер.
        switchMap (
          (params: Params) => {
            if (params['id']) {
              this.isNew = false
              return this.categoriesService.getById(params['id'])
            }
            //  З будь чого створює Observable, так як в switchMap потрібно вернути стім.
            return of(null)
          }
        )
      )
      .subscribe(
        (category) => {
          if (category) {
            this.category = category
            // patchValue() - динамічно оновлює дані форми.
            this.form.patchValue({
              name: category.name
            })
            // відображення img  в прев'ю в редагуванні.
            this.imagePreview = category.imageSrc
            MaterialService.updateTextInputs()
          }
          this.form.enable()
        },
        error => MaterialService.toast(error.error.message()))
  }


  // референція від інпуту який скрито.
  triggerClick() {
    this.inputRef?.nativeElement.click()
  }

  deleteCategory(){
    const decision = window.confirm(`Ви бажаєте видалити категорію "${this.category.name}"`)

    if(decision){
      this.categoriesService.delete(this.category._id)
        .subscribe (
          response => MaterialService.toast(response.message),
          error => MaterialService.toast(error.error.message),
          () => this.router.navigate(['/categories'])
        )
    }
  }
  // робота з img.

  onFileUpload(event: any) {
    // в змінну file потрапляє файл який ми загрузили.
    const file = event.target.files[0]
    this.image = file

    // щоб показати preview картинки.
    const reader = new FileReader()
    // + прослушку події на рідер.
    reader.onload = ()=> {
      this.imagePreview = reader.result
    }
    // читаємо файл.
    reader.readAsDataURL(file)
  }

  onSubmit() {
    let obs$
    this.form.disable()
    if(this.isNew) {
    //   create if isNew true
      obs$ = this.categoriesService.create(this.form.value.name, this.image)
    }else {
    //   update
      obs$ =  this.categoriesService.update(this.category._id,this.form.value.name, this.image)
    }
    obs$.subscribe(
      (category: Category) => {
        this.category = category
        MaterialService.toast('Зміни збережені')
        this.form.enable()
      },
      error => {
        MaterialService.toast(error.error.message)
        this.form.enable()
      }
    )
  }

}
