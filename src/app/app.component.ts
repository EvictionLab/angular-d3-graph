import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  data = this.getBarGraphData();
  toggle = true;
  x1;
  x2;
  settings = {
    title: 'Sample Bar Graph',
    description: 'A bar graph example',
    margin: {left: 120},
    axis: {
      x: { 'label': 'Year', tickSize: '-100%' },
      y: { 'label': 'Evictions', tickSize: '-100%', ticks: 5, minVal: -1650, maxVal: 1650 }
    },
    ci: {
      display: true
    }
  };

  ngOnInit() {
  }

  getLineGraphData() {
    return [
      { id: 'us-avg-line', data: this.createDataSet() },
      { id: 'new-york-line', data: this.createDataSet() }
    ];
  }

  getBarGraphData() {
    return [
      { id: 'us-avg-bar', data: [ { x: 'New York', y: 1200, ci: 20 } ] },
      { id: 'new-york-bar', data: [ { x: 'New Yorks', y: 1600, ci: 50 } ] },
      { id: 'else-bar', data: [ { x: 'Somewhere Else', y: 600, ci: 120 } ] }
    ];
  }

  createDataSet() {
    const d = [];
    const base = Math.random() * 100;
    const cir = Math.random() * 100;
    for (let i = 0; i < 10; i++) {
      d.push({ x: i, y: base + (Math.random() * 1000) - 500, ci: cir });
    }
    return d;
  }

  logEvent(e) { console.log(e); }

  setRange() {}

}
