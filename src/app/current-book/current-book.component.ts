import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { Book, CurrentBook } from '../../types/book';
import { Session } from '../../types/session';
import { APIService } from '../API.service';
import { MatCarousel, MatCarouselComponent, MatCarouselSlide } from '@ngbmodule/material-carousel';
import { SessionDialogComponent } from '../session-dialog/session-dialog.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';



@Component({
  selector: 'app-current-book',
  templateUrl: './current-book.component.html',
  styleUrls: ['./current-book.component.css']
})
export class CurrentBookComponent implements OnInit {

  books: Array<CurrentBook>;
  selectedBook: CurrentBook;

  date: Date;
  startPage: number;
  endPage: number;

  session : Session;


  color="primary";
  mode="determinate";

  currentPage = 0;
  totalPages: number = 1;
  startDate : Date = new Date();

  value= this.currentPage / this.totalPages;

  // coverImage = 'assets/a-promised-land-image.jpg';

  coverImage = 'assets/menu_book.svg';

  constructor(private api: APIService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getBooks();
  }

  getBooks(): void{
    this.api.ListBooks().then(event => {
      this.books = event.items;
      //this will filter only books with status 2 : IE current books
      this.books = this.books.filter(book => book.status == 2);
      if(this.books){
        //arbitrarily select the top book
        // TODO: Select book most recently read
        this.selectedBook = this.books[0]
        console.log(this.selectedBook);
        this.totalPages = this.selectedBook.pages;
        this.currentPage = this.selectedBook.pageNumber;
        console.log(this.currentPage);

        this.startDate = new Date(this.selectedBook.startDate);
        // Get a percentage completed value for the progress wheel
        // TODO: check for infinity or zero lol
        if(this.currentPage === undefined){
          this.currentPage = 0;
        }
        if(this.totalPages === undefined){
          this.totalPages = 0;
        }
        if(this.currentPage >= this.totalPages){
          this.currentPage = this.totalPages;
        }
        this.value= Math.floor((this.currentPage / this.totalPages)*100);
      }else{
        //should display something if no books are in progress
      }
      console.log(this.books);

    });
  }

  onPageChange(val:string): void {
    let page : number = +val;
    if(page > 0 && page <= this.totalPages){
      this.currentPage = page;
      this.value = Math.floor((this.currentPage / this.totalPages)*100);
    }
  }

  openDialog(): void {
    this.startPage = this.currentPage;
    this.date = new Date();
    const dialogRef = this.dialog.open(SessionDialogComponent, {
      width: '500px',
      data: {date: this.date, startPage: this.startPage, endPage: this.endPage}
    });

    const sub = dialogRef.componentInstance.onAdd.subscribe((data) => {
      console.log(data);
    });

    dialogRef.afterClosed().subscribe(result => {
        sub.unsubscribe();
    });
  }
}
