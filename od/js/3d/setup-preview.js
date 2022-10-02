import * as THREE from './three.module.js';
import {OrbitControls} from './OrbitControls.js';
import {GLTFLoader} from './GLTFLoader.js';
import {RGBELoader} from './RGBELoader.js';
import {GUI} from './dat.gui.module.js';

class AmbientColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}
class SpotColorGUIHelper {
  constructor(objects, prop) {
    this.objects = objects;
    this.prop = prop;
  }
  get value() {
    return `#${this.objects[0][this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.objects.map( object => object[this.prop].set(hexString) );
  }
}
class SpotDegRadHelper {
  constructor(objs, prop) {
    this.objs = objs;
    this.prop = prop;
  }
  get value() {
    return THREE.MathUtils.radToDeg(this.objs[0][this.prop]);
  }
  set value(v) {
    this.objs.map( obj => obj[this.prop] = THREE.MathUtils.degToRad(v) );
  }
}

class NBD3DPreview {
  constructor(){
    this.renderer;
    this.pmremGenerator;
    this.texture = {};
    this.texture_material = {};
    this.camera;
    this.scene;
    this.inputElement;
    this.controls;
    this.renderRequested = false;
    this.spotLights = [];
    this.settings;
    this.ambient;
    this.saveOptions;
    this.direactLight;
  }
  init(data) {
    const {canvas, inputElement, model, settings, callback, saveOptions} = data;

    let meshNames = settings.meshName.split(",");
    settings.meshNames = meshNames.map( mesh => mesh.trim() );
    this.settings = settings;
    this.saveOptions = saveOptions;

    this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.pmremGenerator = new THREE.PMREMGenerator( this.renderer );
    this.pmremGenerator.compileEquirectangularShader();
    const _this = this;
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 5;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.z = 2;
    this.inputElement = inputElement;

    this.controls = new OrbitControls(this.camera, this.inputElement);
    this.controls.enableDamping = true;
    this.controls.autoRotate = settings.autoRotate;
    this.controls.autoRotateSpeed = settings.autoRotateSpeed;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( settings.backgroudColor );
    this.loadEnvironment();

    this.ambient = new THREE.AmbientLight( settings.ambientLightColor, settings.ambientIntensity );
    this.scene.add( this.ambient );

    for(let i = 0; i < 4; i++){
      let spotLight = new THREE.SpotLight( settings.spotLightsColor );
      let x = ( i % 2 == 0 ) ? 1 : - 1;
      let z = ( i % 4 > 1 ) ? -1 : 1;
      spotLight.position.set( x, 2, z );
      spotLight.angle = settings.spotLightsAngle;
      spotLight.penumbra = settings.spotLightsPenumbra;
      spotLight.intensity = settings.spotLightsIntensity;
      spotLight.decay = 3;
      this.scene.add(spotLight);
      this.spotLights.push(spotLight);
    }

    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
      const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
      const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
      const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
      const direction = (new THREE.Vector3())
          .subVectors(camera.position, boxCenter)
          .multiply(new THREE.Vector3(1, 0, 1))
          .normalize();

      camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

      camera.near = boxSize / 100;
      camera.far = boxSize * 100;

      camera.updateProjectionMatrix();

      camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);

      _this.spotLights.map(spotLight => spotLight.position.multiplyScalar(sizeToFitOnScreen / 2));
      _this.spotLights.map(spotLight => spotLight.target.position.set(boxCenter.x, boxCenter.y, boxCenter.z));
      _this.spotLights.map(spotLight => spotLight.target.updateMatrixWorld());
    }

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(model, (gltf) => {
      const root = gltf.scene;
      this.scene.add(root);

      root.traverse((obj) => {
        if ( obj.isMesh ) {
          if( settings.meshNames.includes( obj.name ) ){
            let textureObject = obj,
            old_material = textureObject.material;
            let new_material = new THREE.MeshPhongMaterial( {color:0xffffff, map:old_material.map, transparent:true} );
            this.texture_material[obj.name] = new_material;
            this.texture_material[obj.name].needsUpdate = true;
            textureObject.material = new_material;
          }else{
            let baseObject = obj;
            let old_material = baseObject.material;
            var new_base_material = new THREE.MeshPhongMaterial( {color:old_material.color} );
            if(old_material.map){
              new_base_material.map = old_material.map;
            }
            baseObject.material = new_base_material;
          }
        }
      });

      root.updateMatrixWorld();

      const box = new THREE.Box3().setFromObject(root);
      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      frameArea(boxSize * 2, boxSize, boxCenter, this.camera);

      this.controls.maxDistance = boxSize * 10;
      this.controls.target.copy(boxCenter);
      this.controls.update();

      callback( "loaded_3d_model" );
    });

    this.render();

    function requestRenderIfNotRequested() {
      if (!_this.renderRequested) {
        _this.renderRequested = true;
        requestAnimationFrame(() => _this.render());
      }
    }

    const gui = new GUI();
    const dispFolder = gui.addFolder('General');
    dispFolder.add(this.controls, 'autoRotate').name('Auto rotate').onChange(requestRenderIfNotRequested);
    dispFolder.add(this.controls, 'autoRotateSpeed', -20, 20, 1).name('Rotate Speed').onChange(requestRenderIfNotRequested);
    dispFolder.addColor(this.settings, 'backgroudColor').name('Backgroud color').onChange(() => {
      if( this.settings.backgroundImage ) return;
      _this.scene.background = new THREE.Color( _this.settings.backgroudColor );
      requestRenderIfNotRequested();
    });
    dispFolder.add(this.settings, 'backgroundImage').name('Bg Image').onChange(() => {
      _this.loadEnvironment(() => requestRenderIfNotRequested());
    });
    dispFolder.open();
    const ambientLightFolder = gui.addFolder('Ambient Light');
    ambientLightFolder.addColor(new AmbientColorGUIHelper(this.ambient, 'color'), 'value').name('Color').onChange(requestRenderIfNotRequested);
    ambientLightFolder.add(this.settings, 'ambientIntensity', 0, 2, 0.01).name('Intensity').onChange(() => {
      _this.ambient.intensity = _this.settings.ambientIntensity;
      requestRenderIfNotRequested();
    });
    ambientLightFolder.open();
    const spotLight = gui.addFolder('Spot Lights');
    spotLight.addColor(new SpotColorGUIHelper(this.spotLights, 'color'), 'value').name('Color').onChange(requestRenderIfNotRequested);
    spotLight.add(this.settings, 'spotLightsIntensity', 0, 2, 0.01).name('Intensity').onChange(() => {
      this.spotLights.map( light => light.intensity = _this.settings.spotLightsIntensity );
      requestRenderIfNotRequested();
    });
    spotLight.add(new SpotDegRadHelper(this.spotLights, 'angle'), 'value', 0, 90).name('Angle').onChange(() => {
      requestRenderIfNotRequested();
    });
    spotLight.add(this.settings, 'spotLightsPenumbra', 0, 1, 0.01).name('Penumbra').onChange(() => {
      this.spotLights.map( light => light.penumbra = _this.settings.spotLightsPenumbra );
      requestRenderIfNotRequested();
    });
    spotLight.open();

    var obj = { add:function(){
      _this.settings.ambientLightColor = `#${_this.ambient.color.getHexString()}`;
      _this.settings.ambientIntensity = _this.ambient.intensity;
      _this.settings.spotLightsColor = `#${_this.spotLights[0].color.getHexString()}`;
      _this.settings.spotLightsIntensity = _this.spotLights[0].intensity;
      _this.settings.spotLightsAngle = _this.spotLights[0].angle;
      _this.settings.spotLightsPenumbra = _this.spotLights[0].penumbra;
      _this.settings.autoRotate = _this.controls.autoRotate;
      _this.settings.autoRotateSpeed = _this.controls.autoRotateSpeed;

      _this.saveOptions( _this.settings );
    }};
    gui.add(obj, 'add').name('Save options');

    this.controls.addEventListener('change', requestRenderIfNotRequested);
  }

  loadEnvironment( callback ){
    if( this.settings.backgroundImage ){
      this.getCubeMapTexture().then(( { envMap } ) => {
        this.scene.environment = envMap;
        this.scene.background = envMap;
        if( typeof callback == 'function' ) callback();
      });
    }else{
      this.scene.environment = null;
      this.scene.background = new THREE.Color( this.settings.backgroudColor );
      if( typeof callback == 'function' ) callback();
    }
  }

  getCubeMapTexture() {
    const _this = this;
    return new Promise((resolve, reject) => {
      new RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .load(_this.settings.environment_url, (texture) => {
          const envMap = _this.pmremGenerator.fromEquirectangular(texture).texture;
          _this.pmremGenerator.dispose();

          resolve({ envMap });

        }, undefined, reject);
    });
  }

  resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = this.inputElement.clientWidth;
    const height = this.inputElement.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, false);
    }
    return needResize;
  }

  render() {
    this.renderRequested = undefined;

    if (this.resizeRendererToDisplaySize(this.renderer)) {
      this.camera.aspect = this.inputElement.clientWidth / this.inputElement.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    this.controls.update();
    this.renderer.render(this.scene,this.camera);
  }

  updateDesign(designs, context){
    const _this = this;
    if( context == 'on_worker' ){
      for (const mesh in designs) {
        let design = designs[mesh],
        loader = new THREE.ImageBitmapLoader();
        loader.load(design, function(imageBitmap ) {
          _this.texture[mesh] = new THREE.CanvasTexture( imageBitmap );
          _this.texture[mesh].flipY = false;
          _this.texture_material[mesh].map = _this.texture[mesh];
          _this.texture[mesh].needsUpdate = true;
          _this.render();
        });
      }
    }else{
      for (const mesh in designs) {
        let design = designs[mesh],
        image = new Image();
        this.texture[mesh] = new THREE.Texture(image);
        this.texture[mesh].flipY = false;
        image.onload = () => {
          _this.texture_material[mesh].map = _this.texture[mesh];
          _this.texture[mesh].needsUpdate = true;
          _this.render();
        };
        image.src = design;
      }
    }
  }
}
export default NBD3DPreview;