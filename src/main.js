import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, DoubleSide, MeshPhongMaterial, MeshNormalMaterial, Mesh, PointLight, AmbientLight, Clock} from 'three';

import $ from 'jquery';
import {TrackballControls} from './TrackballControls';

import dat from 'dat.gui';
const gui = new dat.GUI();

import Stats from 'stats.js';
var stats = new Stats();

var clock = new Clock();

import {functionToGeometry} from './marching-cubes';

var camera, scene, renderer;
var geometry, material, mesh;
var trackballControls;

window.onload = function() {
    var FizzyText = function() {
	this.bounds = '1.0 - x*x - y*y + z';
    };

    var parameters = new FizzyText();
    var functionText = gui.add(parameters, 'bounds');

    functionText.onChange(function(value) {
	//try {
	//console.log("function(x,y,z) { return " + value + ";}");
	var f = new Function('x', 'y', 'z', 'return ' + value + ";");
	//var f = function(x,y,z) { return 3 - x*x-y*y- z*z;}
	scene.remove( mesh );
	geometry = functionToGeometry( f );
	mesh = new Mesh( geometry, material );
	scene.add( mesh );
    //}
	//catch (e) {
	//console.log(e);
    //}
    });

    init();
    animate();
 
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

	var light1 = new PointLight(0xff0000);
        light1.position.set(10,10,0);
        scene.add(light1);

	var light2 = new PointLight(0x00ffff);
        light2.position.set(-10,-10,3);
        scene.add(light2);	

	var ambientLight = new AmbientLight( 0x202020 ); // soft white light
	scene.add( ambientLight );
	
	material = new MeshPhongMaterial({color: 0xffffff, side: DoubleSide});

	geometry = functionToGeometry( function(x,y,z) {
	    return 1.0 - x*x - y*y + z;
	});
	
	mesh = new Mesh( geometry, material );
	scene.add( mesh );
	
	renderer = new WebGLRenderer( { antialias: true } );
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

