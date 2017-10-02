import { Component, OnInit, ElementRef, ViewChild, HostListener, Input, Output, AfterViewInit, OnChanges } from '@angular/core';

import { Graph } from '../graph';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('graphContainer') element: ElementRef;
  @Input() settings;
  @Input() data;
  @Input() type;
  @Input() x1;
  @Input() x2;
  graph: Graph;

  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {
    console.log(this.element);
  }

  ngOnChanges(changes) {
    if (changes.data && this.element) {
      if (this.graph) {
        this.graph.updateData(changes.data.currentValue);
      } else {
        this.graph = new Graph(this.element.nativeElement, changes.data.currentValue, this.settings);
      }
    }
    if ((changes.x1 || changes.x2) && this.element && (this.x1 && this.x2)) {
      this.graph.setVisibleRange(this.x1, this.x2);
    }
  }

  @HostListener('window:resize', ['$event'])

  onResize(e) {}

  onMouseMove() {}

  onClick() {}

}
