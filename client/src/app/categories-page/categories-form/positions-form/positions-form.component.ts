import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PositionsService} from "../../../shared/services/positions.service";
import {Position} from "../../../shared/interfaces";
import {MaterialInstance, MaterialService} from "../../../shared/classes/material.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-positions-form',
  templateUrl: './positions-form.component.html',
  styleUrls: ['./positions-form.component.scss']
})
export class PositionsFormComponent implements OnInit, AfterViewInit, OnDestroy{


  @Input('categoryId') categoryId:string | any
  @ViewChild('modal') modalRef: ElementRef | any
  positions: Position[] = []
  loading = false
  modal: MaterialInstance | any
  form: FormGroup | any
  positionId = null

  constructor(private positionService: PositionsService) {}

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
      cost: new FormControl(1,[Validators.required, Validators.min(1)])
    })

    this.loading = true
     this.positionService.fetch(this.categoryId).subscribe(positions => {
       // positions = positions from backand
       this.positions = positions
       this.loading = false
     })
  }

  ngOnDestroy() {
    this.modal.destroy()
  }

  ngAfterViewInit(){
    this.modal = MaterialService.initModal(this.modalRef)
  }

  onSelectPosition(position: Position | any){
    this.positionId = position._id
    this.form.patchValue({
      name: position.name,
      cost: position.cost
    })
    this.modal.open()
    MaterialService.updateTextInputs()

  }

  onAddPosition() {
    this.positionId = null
    this.form.reset({
      name: null,
      cost: 1
    })
    this.modal.open()
    MaterialService.updateTextInputs()
  }
  onDeletePosition(event: Event, position: Position) {
    event.stopPropagation()
    const decision = window.confirm(`Видалити позицію "${position.name}"?`)
    if (decision) {
      this.positionService.delete(position).subscribe(
        response => {
          const idx = this.positions.findIndex(p => p._id === position._id)
          this.positions.splice(idx, 1)
          MaterialService.toast(response.message)
        },
        error => MaterialService.toast(error.error.message)
      )
    }
  }

  onCancel() {
    this.modal.close()
  }

  onSubmit() {
    this.form.disable()
    const newPosition: Position = {
      name: this.form.value.name,
      cost: this.form.value.cost,
      category: this.categoryId
    }

    const completed = () => {
      this.modal.close()
      this.form.reset({name: '', cost: 1})
      this.form.enable()
    }

    if(this.positionId){
      newPosition._id = this.positionId
      this.positionService.update(newPosition).subscribe(
        position => {
          const idx = this.positions.findIndex(p => p._id === position._id)
          this.positions[idx] = position
          MaterialService.toast('Зміни збережено')
        },
        error => {
          MaterialService.toast(error.error.message)
        },
        completed
      )
    }else {
      this.positionService.create(newPosition).subscribe(
        position => {
          MaterialService.toast('Позиція створена')
          this.positions.push(position)
        },
        error => {
          MaterialService.toast(error.error.message)
        },
        completed
      )
    }
  }
}


