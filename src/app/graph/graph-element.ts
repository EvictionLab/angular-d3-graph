/**
 * Base class for elements being added to graphs.
 */
export class GraphElement {
    /**
     * Creates a graph element
     * @param container - the D3 container for the element
     * @param render - a function that is executed anytime the element needs to
     *    be rendered.
     */
    constructor(public container: any, public render: any) {}

    remove() {
        this.container.remove();
        this.render = () => {};
    }
}
