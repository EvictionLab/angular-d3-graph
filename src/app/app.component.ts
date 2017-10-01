import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private d1 = [
    { id: "line1", data: [ { x: 0, y: 10 }, { x: 1, y: 35 }, { x: 2, y: 20 }, { x: 3, y: 45 }, { x: 4, y: 10 } ] },
    { id: "line2", data: [ { x: 0, y: 20 }, { x: 1, y: 15 }, { x: 2, y: 40 }, { x: 3, y: 35 }, { x: 4, y: 45 } ] }
  ];
  private d2 = [
    { id: "line4", data: [ { x: 10, y: 40 }, { x: 11, y: 15 }, { x: 12, y: 40 }, { x: 13, y: 35 }, { x: 14, y: 45 } ] }
  ];
  title = 'app';
  data = this.d1;
  toggle = false;

  ngOnInit() {
    setInterval(this.generateData.bind(this), 4000);
  }

  generateData() {
    this.data = (this.toggle ? this.d1 : this.d2);
    this.toggle = !this.toggle;
  }

}
