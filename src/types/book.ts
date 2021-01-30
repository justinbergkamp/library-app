export type Book = {
  id : string,
  title : string,
  description : string,
  author: string,
  tags: Array<string>,
  status: number,
  queue_pos: number,
  pageNumber: number,
  page: number,
  startDate: string,
  finishDate: string
};

export type CurrentBook = {
  id : string,
  title : string,
  description : string,
  author: string,
  tags: Array<string>,
  status: number,
  pageNumber: number,
  pages: number,
  startDate: string,
  finishDate: string
};
