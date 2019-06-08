import { Model } from "Model";

class controller {
  /*
  The Model handels the loading, sorting, and ordering of the data.
   */
  private view: any;
  private model : any;


  constructor() {
    this.view = new View();
    this.model = new Model();
  }
}
