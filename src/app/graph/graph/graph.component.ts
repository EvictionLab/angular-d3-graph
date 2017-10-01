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
  graph: Graph;

  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {
    console.log(this.element);
    // this.graph = new Graph(this.element.nativeElement, this.data, this.settings);
  }

  ngOnChanges(changes) {
    console.log('value changed', changes);
    if (changes.data && this.element) {
      if (this.graph) {
        this.graph.updateData(changes.data.currentValue);
      } else {
        this.graph = new Graph(this.element.nativeElement, changes.data.currentValue, this.settings);
      }
    }
  }

  @HostListener('window:resize', ['$event'])

  onResize(e) {}

  onMouseMove() {}

  onClick() {}

}
