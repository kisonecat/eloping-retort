import {AxesHelper, Scene, Box3, Box3Helper, FogExp2, PerspectiveCamera, WebGLRenderer, BoxGeometry, DoubleSide, MeshStandardMaterial, Mesh, PointLight, AmbientLight, Vector3} from 'three';

import $ from 'jquery';
import {TrackballControls} from './TrackballControls';

import math from 'mathjs';
import gradient from './gradient';

import dat from 'dat.gui';
const gui = new dat.GUI();

////////////////////////////////////////////////////////////////
// display statistics
import Stats from 'stats.js';
var stats = new Stats();
$(function() {
    // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.showPanel( 0 );
    document.body.appendChild( stats.dom );
});

import {Clock} from 'three';
var clock = new Clock();

import {functionToGeometry} from './marching-cubes';

var camera, scene, renderer;
var geometry, material, mesh;
var trackballControls;
var axes;

window.onload = function() {
    var Parameters = function() {
	this.bounds = '1.0 - x*x - y*y + z';
	this.axes = false;
	this.boundingBox = true;
	this.minX = -3;
	this.maxX = 3;	
	this.minY = -3;
	this.maxY = 3;	
	this.minZ = -3;
	this.maxZ = 3;
    };

       
    var parameters = new Parameters();
    
    var functionText = gui.add(parameters, 'bounds');

    function updateSurface() {
	var value = parameters.bounds;
	var code = math.compile(value);
	scene.remove( mesh );
	geometry = functionToGeometry( function(x,y,z) {
	    var rho = math.sqrt(x*x+y*y+z*z);
	    return code.eval({x:x,y:y,z:z,
			      r: math.sqrt(x*x+y*y),
			      rho: rho,
			      theta: math.atan2(y,x),
			      phi: math.acos(z/rho)
			     });
	}, gradient(value), parameters );
	mesh = new Mesh( geometry, material );
	scene.add( mesh );
    }
    
    functionText.onChange(updateSurface);

    var axesCheckbox = gui.add(parameters, "axes");
    axesCheckbox.onChange( function(v) {
	if (axes) {
	    scene.remove(axes);
	}
	
	if (v) {
	    axes = new AxesHelper(100);
	    scene.add(axes);
	}
    });

    function init() {
	// BADBAD: fiddle with these numbers?
	camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 100 );
	camera.position.z = 10;

	$(window).bind("resize", function(){
	    var w = $(window).width();
	    var h = $(window).height();
    
	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();
    
	    $("canvas").css("width", w + "px");
	    $("canvas").css("height", h + "px"); 
	});

	scene = new Scene();
	scene.add( camera );
	scene.fog = new FogExp2( 0xefd1b5, 0.0025 );
	
	var lightx = new PointLight(0xe00000);
        lightx.position.set(-20,0,0);
        scene.add(lightx);
	var lighty = new PointLight(0x00e000);
        lighty.position.set(0,-20,0);
        scene.add(lighty);
	var lightz = new PointLight(0x0000e0);
        lightz.position.set(0,0,-20);
        scene.add(lightz);

	var light2 = new PointLight(0xa0a0a0);
        light2.position.set(10,10,10);
        scene.add(light2);		
	
	var light = new PointLight(0xa0a0a0);
        light.position.set(-10,-10,-10);
        camera.add(light);

	//var ambientLight = new AmbientLight( 0x151515 ); // soft white light
	//scene.add( ambientLight );
	
	material = new MeshStandardMaterial({color: 0x909090,
					     emissive: 0x252525,
					     metalness: 0.05,
					     roughness: 0.25,
					     side: DoubleSide});

	////////////////////////////////////////////////////////////////
	// Bounding Box
	
	var boundingBox = new Box3();
	function updateBox() {
	    boundingBox.set( new Vector3( parameters.minX, parameters.minY, parameters.minZ ),
			     new Vector3( parameters.maxX, parameters.maxY, parameters.maxZ ) );
	    updateSurface();
	}
	updateBox();

	var helper = new Box3Helper( boundingBox, 0x000000 );
	
	if (parameters.boundingBox)
	    scene.add( helper );
	
	var f2 = gui.addFolder('Bounding Box');

	f2.add(parameters, "boundingBox").onChange( function(v) {
	    scene.remove(helper);
	    if (v) {
		scene.add(helper);
	    }
	});
	
	f2.add(parameters, 'minX', -5, 5 ).onChange( updateBox );
	f2.add(parameters, 'maxX', -5, 5 ).onChange( updateBox );
	f2.add(parameters, 'minY', -5, 5 ).onChange( updateBox );
	f2.add(parameters, 'maxY', -5, 5 ).onChange( updateBox );
	f2.add(parameters, 'minZ', -5, 5 ).onChange( updateBox );
	f2.add(parameters, 'maxZ', -5, 5 ).onChange( updateBox );
	
	
	renderer = new WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0xffffff, 1);	
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	trackballControls = new TrackballControls(camera, renderer.domElement);
	trackballControls.rotateSpeed = 1.0*3;
	trackballControls.zoomSpeed = 1.2;
	trackballControls.panSpeed = 0.3;
    }
    
    function animate() {
	stats.begin();
	var delta = clock.getDelta();
	trackballControls.update(delta);
	renderer.render( scene, camera );
	stats.end();

	requestAnimationFrame( animate );
    }

    init();
    animate();
};

