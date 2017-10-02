import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  data = [];
  toggle = false;
  x1;
  x2;

  ngOnInit() {
    setInterval(this.addLine.bind(this), 4000);
  }

  addLine() {
    if (this.data.length > 3) { this.data.shift(); }
    this.data = [ ...this.data, { id: 'newline' + (Math.random() * 10000 + 1), data: this.createDataSet() } ];
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
