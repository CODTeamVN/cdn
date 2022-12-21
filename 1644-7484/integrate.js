const odBaseUrl = "https://resources.1644-7484.link";
const odApiUrl = "https://api.1644-7484.link";
const odClientToken = document.getElementById('od-integrate').getAttribute('attr-client-token');

const style = document.createElement('style');

style.textContent = `
  .od-prevent-scroll {
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .editor-wrap {
    position: fixed;
    z-index: -1;
    pointer-events: none;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    visibility: hidden;
    background: #fff;
    transform: opacity 0.4s;
    -webkit-transform: opacity 0.4s;
    -moz-transform: opacity 0.4s;
  }
  .editor-wrap.is-visible {
    opacity: 1;
    visibility: visible;
    z-index: 9999;
    pointer-events: all;
    transform: opacity 0.4s;
    -webkit-transform: opacity 0.4s;
    -moz-transform: opacity 0.4s;
  }
  .od-editor {
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
  }
  .nbd-load-page {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    background: #fdfdfd;
  }
  .nbd-load-page.is-invisible {
    z-index: -1;
    opacity: 0;
    pointer-events: none;
  }
  .nbd-load-page .loader {
    position: relative;
    margin: -50px auto 0 -50px;
    width: 100px;
    top: 50%;
    left: 50%;
  }
  .nbd-load-page .loader:before {
    content: "";
    display: block;
    padding-top: 100%;
  }
  .nbd-load-page .circular {
    -webkit-animation: od-rotate 2s linear infinite;
    animation: od-rotate 2s linear infinite;
    height: 100%;
    -webkit-transform-origin: center center;
    transform-origin: center center;
    width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }
  .nbd-load-page .circular .path {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    -webkit-animation: od-dash 1.5s ease-in-out infinite, od-color 6s ease-in-out infinite;
    animation: od-dash 1.5s ease-in-out infinite, od-color 6s ease-in-out infinite;
    stroke-linecap: round;
  }
  @-webkit-keyframes od-rotate {
    to {
      -webkit-transform: rotate(1turn);
      transform: rotate(1turn);
    }
  }
  @keyframes od-rotate {
    to {
      -webkit-transform: rotate(1turn);
      transform: rotate(1turn);
    }
  }
  @-webkit-keyframes od-dash {
    0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 89, 200;
      stroke-dashoffset: -35px;
    }
    to {
      stroke-dasharray: 89, 200;
      stroke-dashoffset: -124px;
    }
  }
  @keyframes od-dash {
    0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 89, 200;
      stroke-dashoffset: -35px;
    }
    to {
      stroke-dasharray: 89, 200;
      stroke-dashoffset: -124px;
    }
  }
  @-webkit-keyframes od-color {
    0%,
    to {
      stroke: #d62d20;
    }
    40% {
      stroke: #0057e7;
    }
    66% {
      stroke: #008744;
    }
    80%,
    90% {
      stroke: #ffa700;
    }
  }
  @keyframes od-color {
    0%,
    to {
      stroke: #d62d20;
    }
    40% {
      stroke: #0057e7;
    }
    66% {
      stroke: #008744;
    }
    80%,
    90% {
      stroke: #ffa700;
    }
  }
  .close-editor {
    top: 12px;
    left: 15px;
    position: absolute;
    width: 30px;
    height: 30px;
    background: #f1416c;
    text-align: center;
    color: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%);
    cursor: pointer;
    font-size: 30px;
    line-height: 30px;
    z-index: 3;
  }
  .od-preview {
    margin: 10px;
    background: #fff;
    border-radius: 4px;
    border: 3px solid #fff;
    height: 100px;
    width: auto;
    box-shadow: 0 0.5rem 1.5rem 0.5rem rgb(0 0 0 / 8%);
  }

  .od-download {
    cursor: pointer;
    margin: 15px 0;
  }
  .od-download {
    border-collapse: collapse;
  }
  .od-download td, .od-download th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
  }
  .od-none {
    display: none;
  }
  .od-export-loader {
    border: 16px solid #f3f3f3;
    border-radius: 50%;
    border-top: 16px solid #3498db;
    width: 60px;
    height: 60px;
    -webkit-animation: od-rotate 2s linear infinite;
    animation: od-rotate 2s linear infinite;
  }
`;

document.head.appendChild(style);

window.editorLoaded = false;
window.printOptions = null;
window.showEditor = function() {
  if( !document.querySelector('.editor-wrap') ) return;
  document.querySelector('body').classList.toggle('od-prevent-scroll');
  document.querySelector('.editor-wrap').classList.toggle('is-visible');
  if(!window.editorLoaded){
    document.querySelector('#editor-form').submit();
  } else {
    if( !!window.printOptions ){
      document.getElementById('od-editor').contentWindow.postMessage({
        type: 'change_nbo_options',
        printOptions: window.printOptions
      }, '*')
    }
  }
}
window.onCloseEditor = function() {
  document.querySelector('body').classList.toggle('od-prevent-scroll');
  document.querySelector('.editor-wrap').classList.toggle('is-visible');
}
window.onLoadedEditor = function() {
  window.editorLoaded = true;
  document.querySelector('.nbd-load-page').classList.toggle('is-invisible');
  if( !!window.printOptions ){
    document.getElementById('od-editor').contentWindow.postMessage({
      type: 'change_nbo_options',
      printOptions: window.printOptions
    }, '*')
  }
}
window.onSavedDesign = function(path, uuid, numberOfSide) {
  const event = new CustomEvent('onSavedDesign', { detail: {path, uuid, numberOfSide }});
  document.dispatchEvent(event);

  const previews = document.querySelectorAll('.od-preview');
  previews.forEach(preview => {
    preview.remove();
  });

  if( document.getElementById('od-design-uuid') ){
    document.getElementById('od-design-uuid').remove();
  }


  document.getElementById('od-wrapper').insertAdjacentHTML("afterend", `<input name="od-design-uuid" id="od-design-uuid" type="hidden" value="${uuid}" />`);
  const imgEls = [...Array(numberOfSide).keys()].map(key => `<img class="od-preview" src="${odBaseUrl}/${path}frame_${key}.png" />`);
  //document.getElementById('od-start-design-btn').insertAdjacentHTML("afterend", `<div class="od-preview-wrap">${imgEls.join('')}</div>`);
    const imgElsFragment = document.createRange().createContextualFragment(imgEls);
    document.getElementById('od-wrapper').appendChild(imgElsFragment);
}

window.addEventListener("message", (event) => {
  if( event.data == 'onLoadedEditor' ){
    window.onLoadedEditor()
  }
  if( event.data == 'onCloseEditor' ){
    window.onCloseEditor()
  }
  if( typeof event.data == 'object') {
    if( event.data.type == 'onSavedDesign' ){
      window.onSavedDesign(event.data.path, event.data.uuid, parseInt(event.data.numberOfSide));
    }
  }
}, false);

window.updatePrintOptions = function(type, values) {
  if( ['dimension'].includes(type) ){
    window.printOptions = window.printOptions || {
      odOption: undefined
    }
    window.printOptions.odOption = window.printOptions.odOption || {}
  }

  switch(type){
    case 'dimension':
      window.printOptions.odOption.dimension = {
        width: values.width,
        height: values.height
      }
      break;
    default:
      break;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if( document.getElementById('it_width') && document.getElementById('it_height') ){
    function updateDimension() {
      window.updatePrintOptions('dimension', {
        width: parseInt(document.getElementById('it_width').value),
        height: parseInt(document.getElementById('it_height').value)
      });
    }

    updateDimension();

    document.getElementById('it_width').addEventListener('change', updateDimension);
    document.getElementById('it_height').addEventListener('change', updateDimension);
  }

  if( document.getElementById('od-wrapper') ){
    const odWrapper = document.getElementById('od-wrapper');
    const cmsId = odWrapper.getAttribute('attr-pid');
    const odStartDesignBtn = document.getElementById('od-start-design-btn');
    const odHtml = `
      <form action="${odApiUrl}/product?pid=${cmsId}" target="od-editor" method="post" id="editor-form">
        <input type="hidden" name="X-API-KEY" value="${odClientToken}" />
      </form>
      <div class="editor-wrap">
        <div class="nbd-load-page">
          <div class="loader">
            <svg class="circular" viewBox="25 25 50 50">
              <circle
                class="path"
                cx="50"
                cy="50"
                r="20"
                fill="none"
                stroke-width="2"
                stroke-miterlimit="10"
              />
            </svg>
          </div>
        </div>
        <iframe
          name="od-editor"
          class="od-editor"
          id="od-editor"
          scrolling="no"
          frameborder="0"
          noresize="noresize"
          allowfullscreen
          mozallowfullscreen="true"
          webkitallowfullscreen="true"
          src="about:blank"
        ></iframe>
        <div
          class="close-editor"
          onclick="window.onCloseEditor()"
        >×</div>
      </div>
    `;
    
    const odEditorFragment = document.createRange().createContextualFragment(odHtml);
    document.querySelector('body').appendChild(odEditorFragment);
    //odWrapper.removeAttribute('style');
  }

  if(document.querySelectorAll('.od-cart-preview').length){
    var divs = document.querySelectorAll('.od-cart-preview');

    [].forEach.call(divs, function(div) {
      const uuid = div.getAttribute('attr-uuid');
      fetch(`${odApiUrl}/designs/publish/${uuid}`, {
        method: "GET",
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${odClientToken}`
          }
      })
      .then(function (response) {
        return response.json();
      }) 
      .then(function (response) {
        if(response.path){
          let images = '';
          for(let i = 0; i < response.numberOfSide; i++){
            images += `<img class="od-preview" style="" src="${odBaseUrl}/${response.path}frame_${i}.png" />`;
          }
          const fragment = document.createRange().createContextualFragment(images);
          div.appendChild(fragment);
        }
      }).catch(function (error){
        console.log(error);
      });
    });
  }
});

window.downloadOdDesign = function(uuid) {
  if( document.getElementById(`result-${uuid}`) ){
    document.getElementById(`result-${uuid}`).remove()
  };
  if( document.getElementById(`loader-${uuid}`) ){
    document.getElementById(`loader-${uuid}`).remove()
  };

  let result = {};
  document.getElementById(`download-${uuid}`).insertAdjacentHTML("afterend", `<div class="od-export-loader" id="loader-${uuid}"></div>`);
  fetch(`${odApiUrl}/resources/shop/pdf/${uuid}`, {
    method: "GET",
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${odClientToken}`
      }
  })
  .then(function (response) {
    return response.json();
  }) 
  .then(function (response) {
    result.PDF = response;

    async function fetchImages() {
      const [pngResponse, jpgResponse, epsResponse] = await Promise.all(['png', 'jpg', 'eps'].map(type => {
        return fetch(`${odApiUrl}/resources/shop/image/${uuid}/${type}`, {
          method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${odClientToken}`
            }
        })
      }));
      const pngs = await pngResponse.json();
      const jpgs = await jpgResponse.json();
      const epss = await epsResponse.json();
      return [pngs, jpgs, epss];
    }
    
    fetchImages().then(([pngs, jpgs, epss]) => {
      result.PNG = pngs;
      result.JPG = jpgs;
      result.EPS = epss;

      const numberOfSide = result.PDF.length;
      let downloadHtml = `
      <div id="result-${uuid}">
        <table class="od-download">
      `;

      ['PDF', 'PNG', 'JPG', 'EPS'].forEach(type => {
        downloadHtml += `<tr><th>${type}</th>`;
        for(let i = 0; i < numberOfSide; i++) {
          downloadHtml += `<td><a href="${result[type][i]}" download>Download</a></td>`
        }
        downloadHtml += '</tr>';
      });

      downloadHtml += '</table></div>';

      document.getElementById(`download-${uuid}`).classList.toggle('od-none');
      document.getElementById(`loader-${uuid}`).insertAdjacentHTML("afterend", downloadHtml);
      document.getElementById(`loader-${uuid}`).remove();
    }).catch(error => {
      console.log(error);
      document.getElementById(`download-${uuid}`).classList.toggle('od-none');
    });
  })
  .catch(function (error){
    console.log(error);
    document.getElementById(`download-${uuid}`).classList.toggle('od-none');
  });
}
