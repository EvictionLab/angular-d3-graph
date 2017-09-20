import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisRight, axisBottom, axisLeft, axisTop } from 'd3-axis';
import { extent } from 'd3-array';
import { format } from 'd3-format';
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import { line } from 'd3-shape';
import * as _merge from 'lodash.merge';
import * as uuid from 'uuid/v4';

import { GraphElement } from './graph-element';

export class Graph {
    el;
    d3el;
    settings = {
        props: { x: 'x', y: 'y' },
        margin: { left: 40, right: 10, top: 10, bottom: 40 },
        axis: {
            x: {
                position: 'bottom',
                ticks: 5,
                tickSize: 5,
                tickFormat: ',.0f',
                invert: false
            },
            y: {
                position: 'left',
                ticks: 5,
                tickSize: 5,
                tickFormat: ',.0f',
                invert: false
            }
        }
    };
    data: any = [];
    margin;
    private width;
    private height;
    private svg;
    private container;
    private scales;
    private graphElements = {};

    constructor(el, settings) {
        this.el = el;
        this.d3el = select(this.el);
        this.create(settings);
    }

    /**
     * initializes the SVG element for the graph
     * @param settings graph settings
     */
    create(settings = {}): Graph {
        this.settings = _merge(this.settings, settings);
        this.width = this.el.clientWidth - this.settings.margin.left - this.settings.margin.right;
        this.height =
          this.el.getBoundingClientRect().height - this.settings.margin.top - this.settings.margin.bottom;
        // build the SVG if it doesn't exist yet
        if (!this.svg && this.d3el) {
            this.svg = this.createSVG();
            this.container = this.createContainer(this.svg, {
                width: this.width,
                height: this.height,
                top: this.settings.margin.top,
                left: this.settings.margin.left
            }).container;
        }
        return this;
    }

    /**
     * Adds axis and lines
     */
    updateView() {
        this.container.html('');
        this.scales = this.getScales();
        this.graphElements = {};
        this.addAxis(this.container, { id: 'x-axis', ...this.settings.axis.x })
            .addAxis(this.container, { id: 'y-axis', ...this.settings.axis.y })
            .addElement(uuid(), this.createLines(this.container));
    }

    /**
     * Adds a parent <g> element to the graph
     * @param parent parent element
     * @param settings  container settings { top, left, width, height }
     */
    addContainer(parent, settings) {
        this.addElement(settings.id, this.createContainer(parent, settings));
        return this;
    }

    addAxis(parent, settings: any = {}) {
        this.addElement(settings.id, this.createAxis(parent, settings));
        return this;
    }

    addLines(data, settings: any = {}) {
        this.data = data;
        this.updateView();
        return this;
    }

    addElement(id: string = uuid(), graphElement: GraphElement) {
        this.graphElements[id] = graphElement;
        this.graphElements[id].render();
        return this.graphElements[id];
    }

    /**
     * Gets and element by ID
     * @param id 
     */
    getElement(id: string): GraphElement {
        return this.graphElements[id];
    }

    /**
     * Remove a graph element by ID
     * @param id 
     */
    removeElement(id: string) {
        if (this.graphElements.hasOwnProperty(id)) {
            this.graphElements[id].remove();
            delete this.graphElements[id];
        }
        return this;
    }

    /**
     * Clears out anything in the root container
     */
    reset() {
        this.d3el.html('');
    }

    /**
     * Creates the svg element
     */
    createSVG() {
        this.reset();
        return this.d3el.append('svg')
          .attr('width', this.width + this.settings.margin.left + this.settings.margin.right)
          .attr('height', this.height + this.settings.margin.top + this.settings.margin.bottom);
    }

    /**
     * Create a container group
     * @param container a parent container element
     * @param settings { top, left, width, height }
     */
    createContainer(container, settings: any = {}) {
        settings.width = settings.width || this.width;
        settings.height = settings.height || this.height;
        const selection = container.append('g')
            .attr('width', settings.width)
            .attr('height', settings.height)
            .attr('transform', 'translate(' + settings.left + ',' + settings.top + ')');
        const render = (transform = zoomIdentity) => {
            const scale = transform.rescaleX(this.scales.x);
            selection.attr('width', settings.width)
                .attr('height', settings.height);
        };
        return new GraphElement(selection, render);
    }

    /**
     * Creates an axis for graph element
     */
    createAxis(container, settings): GraphElement {
        const axisType =
            (settings.position === 'top' || settings.position === 'bottom') ? 'x' : 'y';
        const axisFunc = this.getAxisGenerator(settings.position);
        const axisGenerator = axisFunc(this.scales[axisType])
            .ticks(settings.ticks)
            .tickSize(settings.tickSize)
            .tickFormat(format(settings.tickFormat));

        const selection = container.append('g')
            .attr('class', axisType + ' axis')
            .attr('transform', this.getAxisTransform(settings.position));

        const render = (transform = zoomIdentity) => {
            const scale = axisType === 'x' ? transform.rescaleX(this.scales.x) : transform.rescaleY(this.scales.y);
            selection.attr('transform', this.getAxisTransform(settings.position));
            selection.call(axisGenerator.scale(scale));
        };
        return new GraphElement(selection, render);
    }

    /**
     * Creates the line graph element
     */
    createLines(container, settings: any = {}): GraphElement {
        const selection = container.selectAll('.line')
            .data(this.data)
            .enter().append('path')
                .attr('class', (d, i) => 'line line-' + i)
                .attr('d', line()
                    .defined((d: any) => !isNaN(d[this.settings.props.y]))
                    .x((d: any, index: any, da: any) => {
                        console.log('w', d.x, this.scales.x(d.x));
                        return this.scales.x(d.x);
                    })
                    .y((d: any) => this.scales.y(d[this.settings.props.y]))
                );
        const render = (transform = zoomIdentity) => {
            selection.attr('transform', 'translate(' + transform.x + ',0)scale(' + transform.k + ',1)');
            selection.attr('vector-effect', 'non-scaling-stroke');
        };
        return new GraphElement(selection, render);
    }

    /*
    * Set the scales used to map data values to screen positions
    */
    getScales() {
        const ranges = this.getRange();
        const extents = this.getExtent(this.data);
        return {
            x: scaleLinear().range(ranges.x).domain(extents.x),
            y: scaleLinear().range(ranges.y).domain(extents.y)
        };
    }

    /**
     * Get the transform based on the axis position
     * @param position
     */
    private getAxisTransform(position: string) {
        switch (position) {
            case 'top':
                return 'translate(0,0)';
            case 'bottom':
                return 'translate(0,' + this.height + ')';
            case 'left':
                return 'translate(0,0)';
            case 'right':
                return 'translate(' + this.width + ',0)';
            default:
                return 'translate(0,0)';
        }
    }

    /**
     * returns the axis generator based on position
     * @param position 
     */
    private getAxisGenerator(position: string) {
        switch (position) {
            case 'top':
                return axisTop;
            case 'bottom':
                return axisBottom;
            case 'left':
                return axisLeft;
            case 'right':
                return axisRight;
            default:
                return axisBottom;
        }
    }

    /**
     * Returns a range for the axis
     */
    private getRange() {
        return {
            x: (this.settings.axis.x.invert ? [ this.width, 0 ] : [ 0, this.width ]),
            y: (this.settings.axis.y.invert ? [ 0, this.height ] : [ this.height, 0 ])
        };
    }

    /**
     * Gets the x and y extent of the data
     * @param data
     */
    private getExtent(data: any = []): { x: Array<number>, y: Array<number> } {
        if (!data.length) { return { x: [0, 1], y: [0, 1] }; }
        const extents: any = {};
        for (const dp of data) {
            const setExtent = {
                x: extent(dp, (d) => parseFloat(d[this.settings.props.x])),
                y: extent(dp, (d) => parseFloat(d[this.settings.props.y]))
            };
            extents.x = extents.x ? extent([...extents.x, ...setExtent.x]) : setExtent.x;
            extents.y = extents.y ? extent([...extents.y, ...setExtent.y]) : setExtent.y;
        }
        return extents;
    }
}
