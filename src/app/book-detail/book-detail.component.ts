import { Book } from '../../types/book';
import { Component, OnInit, Output,  Input, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { APIService } from '../API.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { SimpleChanges } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import * as _ from 'lodash';
import { TransitionService } from '../transition.service';
import { FormService } from '../form.service';


@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.css']
})

// TODO: Refactor tags to separate tags component?
export class BookDetailComponent implements OnInit {


  @Input() book: Book;
  @Input() mode: String;
  @Output() onUpdate = new EventEmitter();


  statusOptions: Array<String> = ["Backlog" , "Ready",  "Current", "Done"];
  public updateForm: FormGroup;
  currentStatus : String = this.statusOptions[0];

 // information needed for the tags
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredTags: Observable<string[]>;
  currentTags: string[] = [];
  allTags: string[] = ['Science', 'Fantasy', 'History', 'Philosophy', 'Self-Improvement'];

  //Used for tag input
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;


  constructor(private api: APIService, private fb: FormBuilder, private transitionService : TransitionService, private formService : FormService ) {


  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {

    if(!this.updateForm || this.updateForm == undefined){
      if(this.mode == 'details'){
        this.updateForm = this.formService.composeForm(""+this.book.status);
      }
      if(this.mode != 'details'){
        this.updateForm = this.formService.composeForm(""+this.mode);
      }

      this.filteredTags = this.updateForm.controls.tags.valueChanges.pipe(
          startWith(null),
          map((tag: string | null) => tag ? this._filter(tag) : this.allTags.slice()));

    }

    this.updateForm.patchValue({
      title: this.book.title,
      author: this.book.author,
      status: this.book.status,
      description: this.book.description,
      pages: this.book.pages,
      tags: this.book.tags,
      startDate: this.book.startDate,
      goalFinishDate: this.book.goalFinishDate,
      finishDate: this.book.finishDate});

    this.currentTags = this.book.tags;
    if (this.currentTags == null) {
      this.currentTags = [];
    }

    this.currentStatus = this.statusOptions[this.book.status];

    console.log(this.currentStatus);
    console.log(this.mode);

    if(this.mode != "details"){
      this.book.status = +this.mode ;
      this.currentStatus = this.statusOptions[this.book.status];
    }

}


  updateBook(book: Book){
    console.log(book);
    try {
      this.transitionService.updateBook(book, this.book.id, this.book.status, this.mode);
    } catch (error) {
      console.log('error updating book...', error);
    }
  }

  //Tag toggle buttons
  public onStatusUpdate(val){
    this.book.status = val;
  }

  //tag methods

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our tag
    if ((value || '').trim()) {
      this.currentTags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.updateForm.controls.tags.setValue(null);
  }

  remove(tag: string): void {
    const index = this.currentTags.indexOf(tag);

    if (index >= 0) {
      this.currentTags.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.currentTags.push(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.updateForm.controls.tags.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toString().toLowerCase();
    return this.allTags.filter(tag => tag.toLowerCase().indexOf(filterValue) === 0);
  }
}
