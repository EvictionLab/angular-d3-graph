import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private d1 = [
    { id: 'line1', data: [ { x: 0, y: 10 }, { x: 1, y: 35 }, { x: 2, y: 20 }, { x: 3, y: 45 }, { x: 4, y: 10 } ] },
    { id: 'line2', data: [ { x: 0, y: 20 }, { x: 1, y: 15 }, { x: 2, y: 40 }, { x: 3, y: 35 }, { x: 4, y: 45 } ] }
  ];
  private d2 = [
    { id: 'line4', data: [ { x: 0, y: 40 }, { x: 1, y: 15 }, { x: 2, y: 40 }, { x: 13, y: 35 }, { x: 14, y: 45 } ] }
  ];
  title = 'app';
  data = [
    { id: 'line4', data: [ { x: 0, y: 40 }, { x: 1, y: 15 }, { x: 2, y: 40 }, { x: 13, y: 35 }, { x: 14, y: 45 } ] }
  ];
  toggle = false;
  x1;
  x2;

  ngOnInit() {
    setInterval(this.addLine.bind(this), 4000);
  }

  addLine() {
    if (this.data.length > 3) {
      this.data.shift();
    } else {
      this.data = [ ...this.data, { id: 'newline' + (Math.random() * 10000 + 1), data: this.createDataSet() } ];
    }
  }

  createDataSet() {
    const d = [];
    for (let i = 0; i < 10; i++) {
      d.push({ x: i, y: Math.random() * 50 });
    }
    return d;
  }

  setRange() {
    // this.x1 = 0;
    // this.x2 = Math.random() * 3 + 1;
  }

}
