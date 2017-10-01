import { select } from 'd3-selection';
import { transition } from 'd3-transition';
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
        },
        transition: transition('default').duration(2000),
        zoom: {
            enabled: true,
            min: 1,
            max: 10
        }
    };
    data: any = [];
    margin;
    private zoomBehaviour;
    private width;
    private height;
    private svg;
    private container;
    private scales;
    private graphElements = {};

    constructor(el, data, settings) {
        this.el = el;
        this.d3el = select(this.el);
        this.create(settings);
        if (data) { this.updateData(data); }
    }

    /**
     * Sets the data for the graph and updates the view
     * @param data new data for the graph
     */
    updateData(data) {
        this.data = data;
        this.updateView();
    }

    /**
     * Adds axis and lines
     */
    updateView(transform?) {
        if (!transform) { transform = zoomTransform(this.svg.node()); }
        this.scales = this.getScales();
        this.renderAxis(this.settings.axis.x, transform)
            .renderAxis(this.settings.axis.y, transform)
            .renderLines(transform);
    }

    /**
     * Clears out anything in the root container
     */
    clear() { this.d3el.html(''); }

    /**
     * Transitions the graph to the range provided by x1 and x2
     */
    setVisibleRange(x1, x2, zoomOptions = {}): Graph {
        const options =  { duration: 2000, margin: 0, maxZoom: 3, ...zoomOptions };
        const pxWidth = Math.abs(this.scales.x(x1) - this.scales.x(x2));
        const spaceAvailable = this.width - options.margin;
        const scaleAmount = Math.min((spaceAvailable / pxWidth), options.maxZoom);
        const scaledWidth = pxWidth * scaleAmount;
        const emptySpace = ((spaceAvailable - scaledWidth)  / 2);
        const newTransform = zoomIdentity.scale(scaleAmount)
            .translate((-1 * this.scales.x(x2)) + (emptySpace / scaleAmount), 0);
        this.svg.transition()
            .duration(options.duration)
            .call(this.zoomBehaviour.transform, newTransform);
        return this;
    }

    /**
     * Creates an axis for graph element
     */
    renderAxis(settings, transform = zoomIdentity): Graph {
        const axisType =
            (settings.position === 'top' || settings.position === 'bottom') ? 'x' : 'y';
        const axisFunc = this.getAxisGenerator(settings.position);
        const axisGenerator = axisFunc(this.scales[axisType])
            .ticks(settings.ticks)
            .tickSize(settings.tickSize)
            .tickFormat(format(settings.tickFormat));
        const scale = axisType === 'x' ? transform.rescaleX(this.scales.x) : transform.rescaleY(this.scales.y);

        this.container.selectAll('g.axis-' + axisType)
            .attr('transform', this.getAxisTransform(settings.position))
            .call(axisGenerator.scale(scale));
        return this;
    }

    /** 
     * Renders lines for any data in the data set.
     */
    renderLines(transform = zoomIdentity) {
        const extent = this.getExtent();
        const lines = this.container.selectAll('.line').data(this.data.map((d) => d.data));
        const flatLine = line()
            .defined((d: any) => !isNaN(d[this.settings.props.y]))
            .x((d: any, index: any, da: any) => this.scales.x(d.x))
            .y(this.scales.y(extent.y[0]));

        const valueLine = line().defined((d: any) => !isNaN(d[this.settings.props.y]))
            .x((d: any, index: any, da: any) => this.scales.x(d.x))
            .y((d: any) => this.scales.y(d[this.settings.props.y]));

        const update = () => {
            lines
                .attr('class', (d, i) => 'line line-' + i)
                .attr('transform', 'translate(' + transform.x + ',0)scale(' + transform.k + ',1)')
                .attr('vector-effect', 'non-scaling-stroke')
                .transition().duration(2000)
                    .attr('d', valueLine);
        };

        // transition out lines no longer present
        lines.exit()
            .attr('class', (d, i) => 'line line-exit line-' + i)
            .transition().duration(2000)
                .attr('d', flatLine)
                .remove();

        // update lines with new data
        update();

        // add lines for new data
        lines.enter().append('path')
            .attr('class', (d, i) => 'line line-enter line-' + i)
            .attr('transform', 'translate(' + transform.x + ',0)scale(' + transform.k + ',1)')
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('d', flatLine)
            .transition().duration(2000)
                .attr('d', valueLine);
    }

    /**
     * Transitions back to the default zoom for the graph
     */
    resetZoom(): Graph {
        this.svg.transition()
            .duration(2000)
            .call(this.zoomBehaviour.transform, zoomIdentity);
        return this;
    }

    /**
     * initializes the SVG element for the graph
     * @param settings graph settings
     */
    private create(settings = {}): Graph {
        this.settings = _merge(this.settings, settings);
        this.width = this.el.clientWidth - this.settings.margin.left - this.settings.margin.right;
        this.height =
          this.el.getBoundingClientRect().height - this.settings.margin.top - this.settings.margin.bottom;
        // build the SVG if it doesn't exist yet
        if (!this.svg && this.d3el) {
            this.svg = this.d3el.append('svg')
                .attr('width', this.width + this.settings.margin.left + this.settings.margin.right)
                .attr('height', this.height + this.settings.margin.top + this.settings.margin.bottom);
        }
        this.container = this.svg.append('g')
            .attr('class', 'graph-container')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('transform', 'translate(' + this.settings.margin.left + ',' + this.settings.margin.top + ')');
        this.container.append('g').attr('class', 'axis axis-x');
        this.container.append('g').attr('class', 'axis axis-y');
        if (this.settings.zoom.enabled) { this.addZoomBehaviour(); }
        return this;
    }

    /**
     * Creates the zoom behaviour for the graph then sets it up based on
     * dimensions and settings
     */
    private addZoomBehaviour(): Graph {
        this.zoomBehaviour = zoom()
            .scaleExtent([ this.settings.zoom.min, this.settings.zoom.max])
            .translateExtent([[0, 0], [this.width, this.height]])
            .extent([[0, 0], [this.width, this.height]])
            .on('zoom', this.updateView.bind(this));
        this.svg.call(this.zoomBehaviour);
        return this;
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
    private getExtent(): { x: Array<number>, y: Array<number> } {
        if (!this.data.length) { return { x: [0, 1], y: [0, 1] }; }
        const extents: any = {};
        for (const dp of this.data) {
            const setExtent = {
                x: extent(dp.data, (d) => parseFloat(d[this.settings.props.x])),
                y: extent(dp.data, (d) => parseFloat(d[this.settings.props.y]))
            };
            extents.x = extents.x ? extent([...extents.x, ...setExtent.x]) : setExtent.x;
            extents.y = extents.y ? extent([...extents.y, ...setExtent.y]) : setExtent.y;
        }
        return extents;
    }

    /**
     * Set the scales used to map data values to screen positions
     */
    private getScales() {
        const ranges = this.getRange();
        const extents = this.getExtent();
        return {
            x: scaleLinear().range(ranges.x).domain(extents.x),
            y: scaleLinear().range(ranges.y).domain(extents.y)
        };
    }
}
