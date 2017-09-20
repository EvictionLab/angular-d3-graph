import { Component, OnInit, ElementRef, ViewChild, HostListener, Input, Output, AfterViewInit } from '@angular/core';

import { Graph } from '../graph';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterViewInit {
  @ViewChild('graphContainer') element: ElementRef;
  @Input() settings;
  @Input() data;
  graph: Graph;
  // data = [
  //   [ { x: 0, y: 10 }, { x: 1, y: 35 }, { x: 2, y: 20 }, { x: 3, y: 45 }, { x: 4, y: 10 } ],
  //   [ { x: 0, y: 20 }, { x: 1, y: 15 }, { x: 2, y: 40 }, { x: 3, y: 35 }, { x: 4, y: 45 } ]
  // ];

  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {
    console.log(this.element);
    this.graph = new Graph(this.element.nativeElement, this.settings);
    if (this.data) {
      this.graph.addLines(this.data);
    }
  }

  @HostListener('window:resize', ['$event'])

  onResize(e) {}

  onMouseMove() {}

  onClick() {}

}
