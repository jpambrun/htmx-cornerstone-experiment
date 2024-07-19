import * as cornerstone from "https://esm.sh/@cornerstonejs/core";
import * as cornerstoneTools from "https://esm.sh/@cornerstonejs/tools";
import * as cornerstoneDICOMImageLoader from "https://esm.sh/@cornerstonejs/dicom-image-loader";
import dicomParser from "https://esm.sh/dicom-parser";

cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
cornerstoneTools.addTool(cornerstoneTools.WindowLevelTool);
const toolGroupId = 'myToolGroup';
const toolGroup = cornerstoneTools.ToolGroupManager.createToolGroup(toolGroupId);
toolGroup.addTool(cornerstoneTools.ZoomTool.toolName);
toolGroup.addTool(cornerstoneTools.WindowLevelTool.toolName);
toolGroup.setToolActive(cornerstoneTools.WindowLevelTool.toolName, {
    bindings: [
        {
            mouseButton: cornerstoneTools.Enums.MouseBindings.Secondary, // Right Click
        },
    ],
});

toolGroup.setToolActive(cornerstoneTools.ZoomTool.toolName, {
    bindings: [
        {
            mouseButton: cornerstoneTools.Enums.MouseBindings.Primary, // Left Click
        },
    ],
});

// console.log("dicomLoader", cornerstoneDICOMImageLoader)
// console.log("cornerstone", cornerstone)
// console.log("cornerstoneTools", cornerstoneTools)
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
await cornerstoneTools.init()

// Create a class for the element
class CornerstoneElement extends HTMLElement {
    static observedAttributes = ["imageids", "size"];

    constructor() {
        // Always call super first in constructor
        super();
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: "closed" });
        const element = document.createElement('div');

        const { width } = getComputedStyle(this.parentElement)
        element.style.width = width;
        element.style.height = width;
        element.oncontextmenu = (e) => e.preventDefault();
        shadow.appendChild(element);

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
        toolGroup.addViewport(viewportId, renderingEngineId);
        renderingEngine.renderViewports([viewportId]);

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
