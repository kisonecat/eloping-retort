import {AxesHelper, Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, DoubleSide, MeshPhongMaterial, MeshNormalMaterial, Mesh, PointLight, AmbientLight, Clock, Vector3} from 'three';

import $ from 'jquery';
import {TrackballControls} from './TrackballControls';

import math from 'mathjs';

import dat from 'dat.gui';
const gui = new dat.GUI();

import Stats from 'stats.js';
var stats = new Stats();

var clock = new Clock();

import {functionToGeometry} from './marching-cubes';

var camera, scene, renderer;
var geometry, material, mesh;
var trackballControls;
var axes;

function gradient(code) {
    var f = math.parse(code);
    
    var transformed = f.transform(function (node, path, parent) {
	if (node.isSymbolNode && node.name === 'rho') {
	    return new math.parse('sqrt(x^2+y^2+z^2)');
	}
	if (node.isSymbolNode && node.name === 'r') {
	    return new math.parse('sqrt(x^2+y^2)');
	}	
	if (node.isSymbolNode && node.name === 'phi') {
	    return new math.parse('acos(z/sqrt(x^2+y^2+z^2))');
	}	
	if (node.isSymbolNode && node.name === 'theta') {
	    return new math.parse('tan(y/x)');
	}	
	
	return node;
    });
    
    var dx = math.derivative(transformed, 'x');
    var dy = math.derivative(transformed, 'y');
    var dz = math.derivative(transformed, 'z');
    
    return function(x,y,z) {
	var bindings = {x:x, y:y, z:z};
	try {
	    return new Vector3( dx.eval(bindings),
				dy.eval(bindings),
				dz.eval(bindings) );
	} catch (e) {
	    return new Vector3(0,0,0);
	}
    };
}

function drawSurface(value) {
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
    }, gradient(value) );
    mesh = new Mesh( geometry, material );
    scene.add( mesh );
}

window.onload = function() {
    var FizzyText = function() {
	this.bounds = '1.0 - x*x - y*y + z';
	this.axes = false;
    };

    var parameters = new FizzyText();
    var functionText = gui.add(parameters, 'bounds');
    var axesCheckbox = gui.add(parameters, "axes");
    functionText.onChange(drawSurface);

    init();
    animate();

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
	// 0: fps, 1: ms, 2: mb, 3+: custom
	stats.showPanel( 0 );
	document.body.appendChild( stats.dom );

	// BADBAD: fiddle with these numbers?
	camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.05, 12 );
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
	
	var light1 = new PointLight(0xff0000);
        light1.position.set(10,10,10);
        camera.add(light1);

	var light2 = new PointLight(0x00ffff);
        light2.position.set(-10,-10,-10);
        camera.add(light2);	

	var ambientLight = new AmbientLight( 0x202020 ); // soft white light
	scene.add( ambientLight );
	
	material = new MeshPhongMaterial({color: 0xffffff, side: DoubleSide});

	drawSurface(parameters.bounds);
	
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
};

