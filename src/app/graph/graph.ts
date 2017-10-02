import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { scaleLinear, scaleBand } from 'd3-scale';
import { easePoly } from 'd3-ease';
import { axisRight, axisBottom, axisLeft, axisTop } from 'd3-axis';
import { extent, max } from 'd3-array';
import { format } from 'd3-format';
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import { line } from 'd3-shape';
import * as _merge from 'lodash.merge';
import * as uuid from 'uuid/v4';

import { GraphElement } from './graph-element';

export class Graph {
    el;
    svg;
    data: any = [];
    settings = {
        props: { x: 'x', y: 'y' },
        margin: { left: 40, right: 10, top: 10, bottom: 40 },
        axis: {
            x: { position: 'bottom', ticks: 5, tickSize: 5, tickFormat: ',.0f', invert: false },
            y: { position: 'left', ticks: 5, tickSize: 5, tickFormat: ',.0f', invert: false }
        },
        transition: { ease: easePoly, duration: 1000 },
        zoom: { enabled: false, min: 1, max: 10 }
    };
    private type;
    private zoomBehaviour;
    private width;
    private height;
    private d3el;
    private container;
    private dataContainer;
    private scales;
    private graphElements = {};
    private transform = zoomIdentity;

    constructor(el, data, settings) {
        this.el = el;
        this.d3el = select(this.el);
        this.create(settings);
        if (data) { this.update(data); }
    }

    /**
     * Sets the data for the graph and updates the view
     * @param data new data for the graph
     */
    update(data, type?) {
        this.setType(type ? type : this.detectTypeFromData(data));
        this.data = data;
        this.updateView();
    }

    /**
     * Adds axis and lines
     */
    updateView() {
        this.transform = zoomTransform(this.svg.node()) || zoomIdentity;
        this.scales = this.getScales();
        this.renderAxis(this.settings.axis.x, this.transform, arguments.length > 0)
            .renderAxis(this.settings.axis.y, this.transform, arguments.length > 0);
        this.type === 'line' ? this.renderLines() : this.renderBars();
    }

    /**
     * Clears out anything in the root container
     */
    clear() { this.svg.remove(); }

    /**
     * Transitions the graph to the range provided by x1 and x2
     */
    setVisibleRange(x1, x2, zoomOptions = {}): Graph {
        const pxWidth = Math.abs(this.scales.x(x1) - this.scales.x(x2));
        const spaceAvailable = this.width;
        const scaleAmount = Math.min((spaceAvailable / pxWidth), this.settings.zoom.max);
        const scaledWidth = pxWidth * scaleAmount;
        const emptySpace = ((spaceAvailable - scaledWidth)  / 2);
        this.transform = zoomIdentity.scale(scaleAmount)
            .translate((-1 * this.scales.x(x1)) + (emptySpace / scaleAmount), 0);
        this.svg.transition()
            .ease(this.settings.transition.ease)
            .duration(this.settings.transition.duration)
            .call(this.zoomBehaviour.transform, this.transform);
        return this;
    }

    setType(type: string) {
        if (this.type !== type) {
            const oldType = this.type;
            this.type = type;
            if (oldType === 'line') { this.renderLines(); }
            if (oldType === 'bar') { this.renderBars(); }
        }
    }

    /**
     * Creates an axis for graph element
     */
    renderAxis(settings, transform = this.transform, blockTransition = false): Graph {
        const axisType =
            (settings.position === 'top' || settings.position === 'bottom') ? 'x' : 'y';
        const axisGenerator = this.getAxisGenerator(settings);
        // if line graph, scale axis based on transform
        const scale = (axisType === 'x') ?
            (this.type === 'line' ? transform.rescaleX(this.scales.x) : this.scales.x) :
            this.scales.y;

        // if called from a mouse event (blockTransition = true), call the axis generator
        // if transition is programatically triggered, transition to the new axis position
        if (blockTransition) {
            this.container.selectAll('g.axis-' + axisType)
                .attr('transform', this.getAxisTransform(settings.position))
                .call(axisGenerator.scale(scale));
        } else {
            this.container.selectAll('g.axis-' + axisType)
                .attr('transform', this.getAxisTransform(settings.position))
                .transition().duration(this.settings.transition.duration)
                .call(axisGenerator.scale(scale));
        }

        return this;
    }

    /**
     * Render bars for the data
     */
    renderBars() {
        const barData = (this.type === 'bar' ? this.data : []);
        const bars = this.dataContainer.selectAll('.bar').data(barData, (d) => d.id);

        // transition out bars no longer present
        bars.exit()
            .attr('class', (d, i) => 'bar bar-exit bar-' + i)
            .transition()
                .ease(this.settings.transition.ease)
                .duration(this.settings.transition.duration)
                .attr('height', 0)
                .attr('y', this.height)
                .remove();

        if (this.type === 'bar') {
            // update bars with new data
            bars.attr('class', (d, i) => 'bar bar-' + i)
                .attr('height', (d) => this.height - this.scales.y(d.data[0][this.settings.props.y]))
                .attr('y', (d) => this.scales.y(d.data[0][this.settings.props.y]))
                .attr('x', (d) => this.scales.x(d.data[0][this.settings.props.x]))
                .attr('width', this.scales.x.bandwidth());

            // add bars for new data
            bars.enter().append('rect')
                .attr('class', (d, i) => 'bar bar-enter bar-' + i)
                .attr('x', (d) => this.scales.x(d.data[0][this.settings.props.x]))
                .attr('y', this.height)
                .attr('width', this.scales.x.bandwidth())
                .attr('height', 0)
                .transition().ease(this.settings.transition.ease)
                    .duration(this.settings.transition.duration)
                    .attr('height', (d) => this.height - this.scales.y(d.data[0][this.settings.props.y]))
                    .attr('y', (d) => this.scales.y(d.data[0][this.settings.props.y]));
        }
        return this;
    }

    /**
     * Renders lines for any data in the data set.
     */
    renderLines(transform = this.transform) {
        const lineData = (this.type === 'line' ? this.data : []);
        const extent = this.getExtent();
        const lines = this.dataContainer.selectAll('.line').data(lineData, (d) => d.id);
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
                .transition().ease(this.settings.transition.ease)
                    .duration(this.settings.transition.duration)
                    .attr('d', (d) => valueLine(d.data));
        };

        // transition out lines no longer present
        lines.exit()
            .attr('class', (d, i) => 'line line-exit line-' + i)
            .transition()
                .ease(this.settings.transition.ease)
                .duration(this.settings.transition.duration)
                .attr('d', (d) => flatLine(d.data))
                .remove();

        if (this.type === 'line') {
            // update lines with new data
            update();

            // add lines for new data
            lines.enter().append('path')
                .attr('class', (d, i) => 'line line-enter line-' + i)
                .attr('transform', 'translate(' + transform.x + ',0)scale(' + transform.k + ',1)')
                .attr('vector-effect', 'non-scaling-stroke')
                .attr('d', (d) => flatLine(d.data))
                .transition()
                    .ease(this.settings.transition.ease)
                    .duration(this.settings.transition.duration)
                    .attr('d', (d) => valueLine(d.data));
        }
        return this;
    }

    /**
     * Transitions back to the default zoom for the graph
     */
    resetZoom(): Graph {
        this.svg.transition()
            .ease(this.settings.transition.ease)
            .duration(this.settings.transition.duration)
            .call(this.zoomBehaviour.transform, zoomIdentity);
        return this;
    }

    updateSettings(settings = {}) {
        this.settings = _merge(this.settings, settings);
    }

    /**
     * initializes the SVG element for the graph
     * @param settings graph settings
     */
    private create(settings = {}): Graph {
        this.updateSettings(settings);
        this.width = this.el.clientWidth - this.settings.margin.left - this.settings.margin.right;
        this.height =
          this.el.getBoundingClientRect().height - this.settings.margin.top - this.settings.margin.bottom;
        // build the SVG if it doesn't exist yet
        if (!this.svg && this.d3el) {
            this.svg = this.d3el.append('svg')
                .attr('width', this.width + this.settings.margin.left + this.settings.margin.right)
                .attr('height', this.height + this.settings.margin.top + this.settings.margin.bottom);
            this.svg.append('defs')
                .append('clipPath')
                .attr('id', 'data-container')
                    .append('rect')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', this.width)
                    .attr('height', this.height);
        }
        // containers for axis
        this.container = this.svg.append('g')
            .attr('class', 'graph-container')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('transform', 'translate(' + this.settings.margin.left + ',' + this.settings.margin.top + ')');
        this.container.append('g').attr('class', 'axis axis-x');
        this.container.append('g').attr('class', 'axis axis-y');
        // masked container for data
        this.dataContainer = this.svg.append('g')
            .attr('clip-path', 'url(#data-container)')
            .attr('class', 'data-container')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('transform', 'translate(' + this.settings.margin.left + ',' + this.settings.margin.top + ')');
        this.addZoomBehaviour();
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
        if (this.settings.zoom.enabled) { this.svg.call(this.zoomBehaviour); }
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
     * returns the axis generator based the axis settings and graph type
     * @param settings settings for the axis, including position and tick formatting
     */
    private getAxisGenerator(settings: any) {
        let axisGen;
        let scale;
        switch (settings.position) {
            case 'top':
                axisGen = axisTop;
                scale = this.scales.x;
                break;
            case 'bottom':
                axisGen = axisBottom;
                scale = this.scales.x;
                break;
            case 'left':
                axisGen = axisLeft;
                scale = this.scales.y;
                break;
            case 'right':
                axisGen = axisRight;
                scale = this.scales.y;
                break;
        }
        if (this.type === 'line') {
            return axisGen(scale).ticks(settings.ticks)
                .tickSize(settings.tickSize)
                .tickFormat(format(settings.tickFormat));
        } else if (this.type === 'bar') {
            if (settings.position === 'top' || settings.position === 'bottom') {
                return axisGen(scale);
            } else if (settings.position === 'left' || settings.position === 'right') {
                return axisGen(scale).ticks(settings.ticks);
            }
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
        if (this.type === 'line') {
            const ranges = this.getRange();
            const extents = this.getExtent();
            return {
                x: scaleLinear().range(ranges.x).domain(extents.x),
                y: scaleLinear().range(ranges.y).domain(extents.y)
            };
        } else if (this.type === 'bar') {
            const scales = {
                x: scaleBand().rangeRound([0, this.width]).padding(0.25),
                y: scaleLinear().rangeRound([this.height, 0])
            };
            scales.x.domain(this.data.map((d) => d.data[0][this.settings.props.x]));
            scales.y.domain([0, max(this.data, (d: any) => parseFloat(d.data[0][this.settings.props.y]))]);
            return scales;
        }
    }

    /**
     * Attempts to determine the type of graph based on the provided data.
     * If each item in the data set only has one data point, it assumes it is a bar graph
     * Anything else is a line graph.
     * @param data The dataset for the graph
     */
    private detectTypeFromData(data): string {
        for (let i = 0; i < data.length; i++) {
            if (data[i].data.length !== 1) {
                return 'line';
            }
        }
        return 'bar';
    }
}
