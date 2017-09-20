import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  data = [
    [ { x: 0, y: 10 }, { x: 1, y: 35 }, { x: 2, y: 20 }, { x: 3, y: 45 }, { x: 4, y: 10 } ],
    [ { x: 0, y: 20 }, { x: 1, y: 15 }, { x: 2, y: 40 }, { x: 3, y: 35 }, { x: 4, y: 45 } ]
  ];
}
