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

  //Defualts status to Backlog -- I don't think this is neccessary anymore
  currentStatus: String = "Backlog";


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


  constructor(private api: APIService, private fb: FormBuilder) {

    this.updateForm = this.fb.group({
      'title': ['', Validators.required],
      'author': ['', Validators.required],
      'description': ['', Validators.required],
      'pages': ['', Validators.required],
      'pageNumber': ['', Validators.required],
      'tags': ['', Validators.required],
      'status': ['', Validators.required],
      'startDate': ['', Validators.required],
      'finishDate': ['', Validators.required]
    });

    this.filteredTags = this.updateForm.controls.tags.valueChanges.pipe(
            startWith(null),
            map((tag: string | null) => tag ? this._filter(tag) : this.allTags.slice()));

    console.log("TEST");
    console.log(this.mode);

  }

  ngOnInit(): void {  }

  ngOnChanges(changes: SimpleChanges) {

    if(this.mode === undefined){
      //this is a non-descript boot details instance - display everything as normal
      this.updateForm.patchValue({title: this.book.title, author: this.book.author, status: this.book.status,
      description: this.book.description, pageNumber: this.book.pageNumber,tags: this.book.tags,
      startDate: this.book.startDate, finishDate: this.book.finishDate});
      this.currentTags = this.book.tags;
      if (this.currentTags == null) {
        this.currentTags = [];
      }

      this.currentStatus = this.statusOptions[this.book.status];


    }else{
      this.updateForm.patchValue({title: this.book.title, author: this.book.author, status: this.book.status,
      description: this.book.description, pageNumber: this.book.pageNumber,tags: this.book.tags,
      startDate: this.book.startDate, finishDate: this.book.finishDate});
      this.currentTags = this.book.tags;
      if (this.currentTags == null) {
        this.currentTags = [];
      }
      this.book.status = this.book.status + 1;
      this.currentStatus = this.statusOptions[this.book.status];


    }


}


  updateBook(book: Book){

   let updatedBook : any ;
   updatedBook = book;
   updatedBook.id = this.book.id;
   updatedBook.status = this.book.status;
   updatedBook = _.omit(updatedBook, ['__typename', 'createdAt', 'updatedAt']);

   //Not best practice, need better way to add generated values for each new instance
   if(updatedBook.status == 2){
     console.log(updatedBook.pages);
     console.log(updatedBook.pageNumber);
     if(!updatedBook.pageNumber){
       updatedBook.pageNumber = 0;
     }

   }

   console.log(updatedBook);

    this.api.UpdateBook(updatedBook).then(event => {
      console.log('item updated!');
      this.onUpdate.emit("done");
    })
    .catch(e => {
      console.log('error updating book...', e);
    });

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
