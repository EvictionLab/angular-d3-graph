import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  data = this.getLineGraphData();
  toggle = true;
  x1;
  x2;
  settings = {
    margin: {left: 120},
    axis: {
      x: { 'label': 'Year', tickSize: '-100%' },
      y: { 'label': 'Evictions', tickSize: '-100%', ticks: 5}
    }
  };

  ngOnInit() {
    setTimeout(() => {
      this.settings = {
        margin: {left: 60},
        axis: {
          x: { 'label': 'NEW Year', tickSize: '-100%' },
          y: { 'label': 'NEW Evictions', tickSize: '-100%', ticks: 10 }
        }
      };
    }, 5000);
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
      { id: 'new-york-bar', data: [ { x: 'New York', y: 1600 } ] },
      { id: 'else-bar', data: [ { x: 'Somewhere Else', y: 600 } ] }
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

  logEvent(e) { console.log(e); }

  setRange() {}

}
