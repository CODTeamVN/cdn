import {EventDispatcher} from './three.module.js';
import NBD3DPreview from './preview.js';

function noop() {
}

class ElementProxyReceiver extends EventDispatcher {
  constructor() {
    super();
  }
  get clientWidth() {
    return this.width;
  }
  get clientHeight() {
    return this.height;
  }
  getBoundingClientRect() {
    return {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
      right: this.left + this.width,
      bottom: this.top + this.height,
    };
  }
  handleEvent(data) {
    if (data.type === 'size') {
      this.left = data.left;
      this.top = data.top;
      this.width = data.width;
      this.height = data.height;
      //return;
    }
    data.preventDefault = noop;
    data.stopPropagation = noop;
    this.dispatchEvent(data);
  }
  focus() {
    // no-op
  }
}

class ProxyManager {
  constructor() {
    this.targets = {};
    this.handleEvent = this.handleEvent.bind(this);
  }
  makeProxy(data) {
    const {id} = data;
    const proxy = new ElementProxyReceiver();
    this.targets[id] = proxy;
  }
  getProxy(id) {
    return this.targets[id];
  }
  handleEvent(data) {
    this.targets[data.id].handleEvent(data.data);
  }
}

const proxyManager = new ProxyManager();
let preview = new NBD3DPreview();

function start(data) {
  const proxy = proxyManager.getProxy(data.canvasId);
  proxy.ownerDocument = proxy;
  self.document = {};
  preview.init({
    canvas: data.canvas,
    inputElement: proxy,
    model: data.model,
    settings: data.settings,
    callback: loaded3dModel,
    takeScreenshotCallback: takeScreenshotCallback
  });
}

function updateDesign(data){
  preview.updateDesign(data.designs, 'on_worker');
}

function makeProxy(data) {
  proxyManager.makeProxy(data);
}

function loaded3dModel( msg ){
  postMessage(msg);
}

function takeScreenshotCallback( blob ){
  postMessage({
    type: 'taked_screenshot',
    blob
  });
}

function takeScreenshot(){
  preview.takeScreenshot('on_worker');
}

const handlers = {
  start,
  updateDesign,
  takeScreenshot,
  makeProxy,
  event: proxyManager.handleEvent,
};

self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (!fn) {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};