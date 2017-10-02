import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  data = this.getBarGraphData();
  type;
  toggle = true;
  x1;
  x2;

  ngOnInit() {
    setInterval(() => {
      this.data = this.toggle ? this.getLineGraphData() : this.getBarGraphData();
      this.toggle = !this.toggle;
    }, 4000);
  }

  getLineGraphData() {
    return [
      { id: 'us-avg-line', data: this.createDataSet() },
      { id: 'new-york-line', data: this.createDataSet() }
    ];
  }

  getBarGraphData() {
    return [
      { id: 'us-avg-bar', data: [ { x: 'United States Average', y: 1200 } ] },
      { id: 'new-york-bar', data: [ { x: 'New York', y: 1600 } ] }
    ];
  }

  createDataSet() {
    const d = [];
    const base = Math.random() * 50;
    for (let i = 0; i < 50; i++) {
      d.push({ x: i, y: base + (Math.random() * 5) - 2.5 });
    }
    return d;
  }

  setRange() {
    // this.x1 = 0;
    // this.x2 = Math.random() * 3 + 1;
  }

}
