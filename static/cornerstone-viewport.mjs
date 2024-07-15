import * as cornerstone from "https://esm.run/@cornerstonejs/core";
import * as cornerstoneDICOMImageLoader from "https://esm.run/@cornerstonejs/dicom-image-loader";
import dicomParser from "https://esm.run/dicom-parser";

// console.log("dicomLoader", cornerstoneDICOMImageLoader)
// console.log("cornerstone", cornerstone)
// console.log("dicomParser", dicomParser)

cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;

cornerstoneDICOMImageLoader.webWorkerManager.initialize({
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: true,
    taskConfiguration: {
        'decodeTask': {
            initializeCodecsOnStartup: false,
            usePDFJS: false
        }
    }
});

await cornerstone.init()

// Create a class for the element
class CornerstoneElement extends HTMLElement {
    static observedAttributes = ["imageids", "size"];

    constructor() {
        // Always call super first in constructor
        super();
    }

    connectedCallback() {
        const element = document.createElement('div');
        const { width } = getComputedStyle(this.parentElement)
        element.style.width = width;
        element.style.height = width;
        this.appendChild(element);

        const renderingEngineId = 'myRenderingEngine';
        const viewportId = 'CT_AXIAL_STACK';
        const renderingEngine = new cornerstone.RenderingEngine(renderingEngineId);

        const viewportInput = {
            viewportId,
            element,
            type: cornerstone.Enums.ViewportType.STACK,
        };

        renderingEngine.enableElement(viewportInput);

        const viewport = renderingEngine.getViewport(viewportInput.viewportId);

        viewport.setStack(this.attributes.imageids.value.split(","));

        console.log("Custom element added to page.");
    }

    disconnectedCallback() {
        console.log("Custom element removed from page.");
    }

    adoptedCallback() {
        console.log("Custom element moved to new page.");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute ${name} has changed.`);
    }
}

customElements.define("cornerstone-viewport", CornerstoneElement);
