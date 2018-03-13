import {Vector3} from 'three';
import math from 'mathjs';

export default function(code) {
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
