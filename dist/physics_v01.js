/*
worldpx_pertile = 128;
renderpx_pertile = 16;

worldpx_to_renderpx = function(n) {
	return ((n / worldpx_pertile) * renderpx_pertile);
};
renderpx_to_worldpx = function(n) {
	return ((n / worldpx_pertile) * renderpx_pertile);
};

drawcircle_render = function() {
	drawx *= scale;
	drawy *= scale;
	drawr *= scale;
	draw();
}

drawsprite_render = function() {
	sprite.resolution (px per tile)
	drawx *= scale;
	drawy *= scale;
	draw_scalar *= renderpx_pertile / sprite.res;
	draw();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Constants
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////
//Densities of common materials
////////////////////////////////////////////////////////////////////
//All values are g/c^3

const pOSMIUM = 22.59;
const pPLATINUM = 21.5;
const pLEAD = 11.3;
const pSTEEL = 7.8;
const pTITANIUM = 4.5;
const pALUMINUM = 2.7;
const pGLASS = 2.7;
const pLAVA = 2.6;
const pGRANITE = 2.6;
const pOBSIDIAN = 2.35;
const pCONCRETE = 2.3;
const pPLASTIC = 2.0;
const pSOIL = 1.3;
const pRUBBER = 1.2;
const pHUMAN = 1.01;
const pWATER = 1;
const pICE = 0.92;
const pOAK = 0.60;
const pWOOD = 0.4; //Alder Wood (most common)
const pPINE = 0.44;
const pCORK = 0.12;
const pFOAM = 0.075;
const pAIR_SIMPLE = 0.0009765625;
const pAIR = 0.0009;
const pHELIUM = 0.0001785;
const pHYDROGEN = 0.00008988;
const pSPACE = 0;

////////////////////////////////////////////////////////////////////
//Gravities
////////////////////////////////////////////////////////////////////
//All values are m/s^2
const gSUN = 274.1;
const gJUPITER = 25.93;
const gNEPTUNE = 11.28;
const gSATURN = 11.19;
const gEARTH = 9.8067;
const gEARTH_SIMPLE = 8; //faster math
const gURANUS = 9.01;
const gVENUS = 8.872;
const gMARS = 3.728;
const gMERCURY = 3.703;
const gIO = 1.789;
const gMOON = 1.625;
const gGANYMEDE = 1.426;
const gTITAN = 1.3455;
const gEUROPA = 1.314;
const gCALLISTO = 1.24;
const gERIS = 0.8;
const gTRITON = 0.779;
const gPLUTO = 0.610;
const gTITANIA = 0.379;
const gOBERON = 0.347;
const gSPACE = 0;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Geometry
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function P3D_Math(){}

P3D_Math.getSign = function(val) {
	if (val<0) return -1;
	else if (val>0) return 1;
	else return 0;
};

P3D_Math.absNull = function(val) {
	if (val==null) {return null;}
	else {return Math.abs(val);}
};


////////////////////////////////////////////////////
//Vector 3D
////////////////////////////////////////////////////
function Vector3D(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
}
Vector3D.prototype.add = function(vector) {
	this.x += vector.x;
	this.y += vector.y;
	this.z += vector.z;
};

Vector3D.prototype.subtract = function(vector) {
	this.x -= vector.x;
	this.y -= vector.y;
	this.z -= vector.z;
};

Vector3D.prototype.divide = function(val) {
	this.x /= val;
	this.y /= val;
	this.z /= val;
};

Vector3D.prototype.scale = function(val) {
	this.x *= val;
	this.y *= val;
	this.z *= val;
};

Vector3D.prototype.copy = function() {
	var v = new Vector3D(this.x,this.y,this.z);
	return v;
};

Vector3D.prototype.getAxis = function(i) {
	switch (i) {
		case 0: return this.x;
		case 1: return this.y;
		case 2: return this.z;
	}
};
Vector3D.prototype.setAxis = function(i,val) {
	switch (i) {
		case 0: this.x = val;
		case 1: this.y = val;
		case 2: this.z = val;
	}
};

Vector3D.prototype.getSqMag = function() {
	return ( (this.x*this.x) + (this.y*this.y) + (this.z*this.z) );
};

Vector3D.prototype.getMag = function() {
	return Math.sqrt(this.getSqMag);
};

Vector3D.prototype.getUnit = function() {
	var imag = 1/this.getMag();
	var u = this.copy();
	u.scale(imag);
	return u;
};


Vector3D.prototype.getVolume = function() {
	return (this.x * this.y * this.z);
};
////////////////////////////////////////////////////
//AABB 3D
////////////////////////////////////////////////////
// An axis-aligned bounding box

function AABB(position_vector, extent_vector) {
	this.p = position_vector.copy();
	this.e = extent_vector.copy();
}

AABB.prototype.overlaps = function(aabb) {
	//returns true if overlapping (intersecting)
	var t = aabb.p.copy();
	t.subtract(this.p);


	return (
		(Math.abs(t.x) <= (this.e.x + aabb.e.x) )
		&&
		(Math.abs(t.y) <= (this.e.y + aabb.e.y) )
		&&
		(Math.abs(t.z) <= (this.e.z + aabb.e.z) )
	);

};

AABB.prototype.min = function(axis) {
	switch (axis) {
		case 0: return (this.p.x - this.e.x);
		case 1: return (this.p.y - this.e.y);
		case 2: return (this.p.z - this.e.z);
	}
};

AABB.prototype.max = function(axis) {
	switch (axis) {
		case 0: return (this.p.x + this.e.x);
		case 1: return (this.p.y + this.e.y);
		case 2: return (this.p.z + this.e.z);
	}
};

//Sweep two AABB's to see if and when they first
//and last were overlapping

function AABBSweep(Ea,A0,A1,Eb,B0,B1,u) {
	//All of the arguments are vectors {x,y,z}
	//Ea,	//extents of AABB A
	//A0,	//its previous position
	//A1,	//its current position
	//Eb,	//extents of AABB B
	//B0,	//its previous position
	//B1,	//its current position
	//u,    //time data structure {
	//								u0: normalized time of first collision, 
	//								u1: normallized time of second collision
	//								}
	
	var A = new AABB( A0, Ea );//previous state of AABB A
	var B = new AABB( B0, Eb );//previous state of AABB B
	
	
	//displacement of A
	var va = A1.copy();
	va.subtract(A0); 
	
	//displacement of B
	var vb = B1.copy();
	va.subtract(B0);
	//the problem is solved in A's frame of reference
	
	//relative velocity (in normalized time)
	var v = vb.copy();
	v.subtract(va);
	
	//first times of overlap along each axis
	var u_0 = new Vector3D(0,0,0);
	
	//last times of overlap along each axis
	var u_1 = new Vector3D(1,1,1);
	
	//check if they were overlapping 
	// on the previous frame
	
	if( A.overlaps(B) ) {
		u = {u0:0, u1:0};
		return true;
	}
	
	//find the possible first and last times
	//of overlap along each axis
	for (var i=0; i<3; i++) {
		if( A.max(i)<B.min(i) && v.getAxis(i)<0 ) {
				u_0.setAxis(i, (A.max(i) - B.min(i)) / v.getAxis(i) );
			}
			else if( B.max(i)<A.min(i) && v.getAxis(i)>0 ) {
					u_0.setAxis(i, (A.min(i) - B.max(i)) / v.getAxis(i) );
				}
		if( B.max(i)>A.min(i) && v.getAxis(i)<0 ) {
			u_1.setAxis(i, (A.min(i) - B.max(i)) / v.getAxis(i) );
			}
			else if( A.max(i)>B.min(i) && v.getAxis(i)>0 ) {
					u_1.setAxis(i, (A.max(i) - B.min(i)) / v.getAxis(i) );
					}
	}
	
	//possible first time of overlap
	u.u0 = Math.max( u_0.x, u_0.y, u_0.z );

	//possible last time of overlap
	u.u1 = Math.min( u_1.x, u_1.y, u_1.z );

	//they could have only collided if
	//the first time of overlap occurred
	//before the last time of overlap
	return (u.u0 <= u.u1);
	
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Physics
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////
//RK4 Integrator
////////////////////////////////////////////////////
function P3D_State(vPosition,vMomentum,vVelocity,mass,inverse_mass) {
	//primary
	//call recalc() whenever these change
	this.x = vPosition;
	this.p = vMomentum;
	
	//secondary
	this.v = vVelocity;
	
	//constant
	this.m = mass;
	this.im = inverse_mass;
	
};

P3D_State.prototype.recalc = function() {
	this.v = this.p.copy();
	this.v.scale(this.im);
};

P3D_State.prototype.recalcMomentum = function() {
	this.p = this.v.copy();
	this.p.scale(this.m);
};

P3D_State.prototype.setMass = function(mass) {
	this.m = mass;
	this.im = 1/this.m;
	this.v = this.p.copy();
	this.v.scale(this.im);
};

function P3D_Derivative(vVelocity,vForce) {
	this.v = vVelocity;
	this.f = vForce;
};

////////////////////////////////////////////////////
//P3D Manager
////////////////////////////////////////////////////
function P3D_Manager() {
	initEvents(this);
	this.pob_list =[];
	this.nonstatic_list =[];
	this.moved_list =[];
	
	this.globalZone = this.createZone();
}

P3D_Manager.prototype.createPob = function(vPosition,vExtent,density) {
	var pob = new P3D_Obj(vPosition,vExtent,density);
	this.pob_list.push(pob);
	this.nonstatic_list.push(pob);
	return pob;
}
P3D_Manager.prototype.createZone = function() {
	var z = new P3D_Zone();
	return z;
}

P3D_Manager.prototype.onStep = function(e) {
	this.moved_list =[];
	this.zoneForces();
	this.sumForces();
	this.integrate(e.delta);
	var sv = this.nonstatic_list[0].state.v;
}

P3D_Manager.prototype.zoneForces = function(e) {
	var z = this.globalZone;
	for (var i = 0; i<this.nonstatic_list.length; i++) {
		this.nonstatic_list[i].recalcZoneForce(z.g,z.p);
	}
}


P3D_Manager.prototype.sumForces = function() {
	for (var i = 0; i<this.nonstatic_list.length; i++) {
		this.nonstatic_list[i].sumInstantForce();
		this.nonstatic_list[i].sumConstantForce();
	}
}

P3D_Manager.prototype.integrate = function(delta) {
	for (var i = 0; i<this.nonstatic_list.length; i++) {
		if (this.nonstatic_list[i].constantForce == null) 
				{ this.nonstatic_list[i].lineIntegrate(delta); }
		else 
				{ this.nonstatic_list[i].rk4Integrate(delta) };
	}
}



////////////////////////////////////////////////////
//P2D Zone
////////////////////////////////////////////////////
function P3D_Zone() {
	this.g = gEARTH_SIMPLE;
	this.p = pAIR_SIMPLE;
}

P3D_Zone.prototype.setPriority = function(val) {};
P3D_Zone.prototype.setGravity = function(val) {this.g = val;};
P3D_Zone.prototype.setAirPressure = function(val) {this.p = val;};

////////////////////////////////////////////////////
//P2D Force
////////////////////////////////////////////////////
function P3D_Force(vector) {
	this.force = vector;
	this.paused = false;
	this.pob = null;
}
P3D_Force.prototype.destroy = function() {
	//remove from pob constantforce list
	this.pob.removeForce(this);
	this.force = null;
}
P3D_Force.prototype.set = function(vector) {
	this.force = vector;
}
P3D_Force.prototype.resume = function() {
	this.paused = false;
}
P3D_Force.prototype.pause = function() {
	this.paused = true;
}

////////////////////////////////////////////////////
//P2D Obj
////////////////////////////////////////////////////
function P3D_Obj(vPosition,vExtent,density) {
	
	initEvents(this);
	
	this.e = vExtent;
	this.origin = new Vector3D(0,0,0);
	
	this.oStatic = false;
	this.oSolid = true;
	
	this.instantForce = new Vector3D(0,0,0);
	this.constantForceList = [];
	this.constantForce = null;
	
	this.fGravity = null;
	this.fBuoyancy = null;
	
	this.maxSpeed = {magnitude: null, sqMag: null, component: { x:null, y:null, z:null } };
	this.minSpeed = {magnitude: null, sqMag: null, component: { x:null, y:null, z:null } };
	this.fixedSpeed = {magnitude: null, sqMag: null, component: { x:null, y:null, z:null } };
	
	this.density = density;
	this.volume = this.e.getVolume();
	
	this.mass = this.density * this.volume; 
	
	this.state = new P3D_State(vPosition,new Vector3D(0,0,0),new Vector3D(0,0,0),this.mass,1/this.mass);
}


P3D_Obj.prototype.setPosition = function(x,y,z) {
	this.state.x.x = x;
	this.state.y.x = x;
	this.state.z.x = x;
};


P3D_Obj.prototype.setOrigin = function(vOrigin) {
	this.origin = vOrigin;
};

P3D_Obj.prototype.setSolid = function(bool) {this.oSolid = bool;};
P3D_Obj.prototype.setStatic = function(bool) {this.oStatic = bool;};


P3D_Obj.prototype.recalcZoneForce = function(g,p) {
	//gravity, density, delta
	if ((g == null) || (g==0)) {
		this.fGravity = null;
		}
	else
		{ 
			this.fGravity = new Vector3D(0,g * this.state.m,0);
	
			if ((p == null) || (p==0)) {
				this.fBuoyancy = null;
				}
			else
				{ this.fBuoyancy = new Vector3D(0,-p * this.volume * g,0); }
	}
};


P3D_Obj.prototype.sumInstantForce = function() {
	this.addMomentum(this.instantForce);
	this.state.recalc();
	
	//clear
	this.instantForce = new Vector3D(0,0,0);
};

P3D_Obj.prototype.sumConstantForce = function() {
	var hasForces = false;
	this.constantForce = new Vector3D(0,0,0);
	
	//add grav and air pressure
	if (this.fGravity != null) {hasForces = true; this.constantForce.add(this.fGravity);}
	if (this.fBuoyancy != null) {hasForces = true; this.constantForce.add(this.fBuoyancy);}
	
	
	for (var i = 0; i< this.constantForceList.length; i++) {
		if (!this.constantForceList[i].paused) {
			hasForces = true;
			this.constantForce.add(this.constantForceList[i].force);
		}
	}
	if (!hasForces) {this.constantForce = null;}
};

P3D_Obj.prototype.removeForce = function(f) {
	iloop: for (var i = 0; i< this.constantForceList.length; i++) {
		if (this.constantForceList[i] == f) {
			this.constantForceList.splice(i,1);
			break iloop;
		}
	}
}
P3D_Obj.prototype.lineIntegrate = function(delta) {
	var v = this.state.v.copy();
	v.scale(delta);
	this.state.x.add( v );
};

  /// Integrate physics state forward by dt seconds.
    /// Uses an RK4 integrator to numerically integrate with error O(5).

P3D_Obj.prototype.rk4Integrate = function(delta) {
		var a = this.evalDerivative1(this.state);
		var b = this.evalDerivative2(this.state, delta * 0.5, a);
		var c = this.evalDerivative2(this.state, delta * 0.5, b);
		var d = this.evalDerivative2(this.state, delta, c);

		var xAdd = b.v.copy();
		xAdd.add(c.v);
		xAdd.scale(2);
		xAdd.add(a.v);
		xAdd.add(d.v);
		xAdd.scale(delta * 1/6);
		this.state.x.add(xAdd);
		
		var pAdd = b.f.copy();
		pAdd.add(c.f);
		pAdd.scale(2);
		pAdd.add(a.f);
		pAdd.add(d.f);
		pAdd.scale(delta * 1/6);
		this.addMomentum(pAdd);

		
		//state.x += 1/6 * dt * (a.v + 2 * (b.v + c.v) + d.v);
		//state.p += 1/6 * dt * (a.f + 2 * (b.f + c.f) + d.f);
	}

	
	
	
    /// Evaluate all derivative values for the physics state at time t.
    /// @param state the physics state of the cube.

P3D_Obj.prototype.evalDerivative1 = function(state) {
		var output = new P3D_Derivative(null,null);
		output.v = state.v.copy();
		output.f = this.constantForce.copy();
		return output;
};
	
    /// Evaluate derivative values for the physics state at future time t+dt 
    /// using the specified set of derivatives to advance dt seconds from the 
    /// specified physics state.

P3D_Obj.prototype.evalDerivative2 = function(state, delta, derivative) {
	    var v = derivative.v.copy();
	    v.scale(delta);
	    var f = derivative.f.copy();
	    f.scale(delta);
		state.x.add( v );
		state.p.add( f );
		state.recalc();
		
		var output = new P3D_Derivative(null,null);
		output.v = state.v.copy();
		output.f = this.constantForce.copy();
		return output;
};

P3D_Obj.prototype.setPos = function(vector,generate_collisions) {
};

P3D_Obj.prototype.setMass = function(val) {
	this.mass = val;
	this.state.setMass(val);
};
P3D_Obj.prototype.setVolume = function(val) {
	this.volume = val;
};
P3D_Obj.prototype.setDensity = function(val) {
	this.density = val;
	this.mass = val/this.volume;
	this.state.setMass(val); 
};
P3D_Obj.prototype.addInstantForce = function(vector) {
	this.instantForce.add(vector);
};
P3D_Obj.prototype.addConstantForce = function(vector) {
	//per ms
	var f = new P3D_Force(vector);
	f.pob = this;
	this.constantForceList.push(f);
	return f;
};

P3D_Obj.prototype.setMaxSpeed = function(val) {
	//null for no max
	this.maxSpeed.magnitude = val;
	if (val!=null)
		this.maxSpeed.sqMag = val * val;
	else
		this.maxSpeed.sqMag = null;
};
P3D_Obj.prototype.setMaxVelocity = function(x,y,z) {
	//null for no max
	this.maxSpeed.component = {x: P3D_Math.absNull(x), y: P3D_Math.absNull(y), z: P3D_Math.absNull(z) };
};

P3D_Obj.prototype.setMinSpeed = function(val) {
	//null for no max
	this.minSpeed.magnitude = val;
	if (val!=null)
		this.minSpeed.sqMag = val * val;
	else
		this.minSpeed.sqMag = null;
};
P3D_Obj.prototype.setMinVelocity = function(x,y,z) {
	//null for no max
	this.minSpeed.component = {x: P3D_Math.absNull(x), y: P3D_Math.absNull(y), z: P3D_Math.absNull(z) };
};

P3D_Obj.prototype.setFixedSpeed = function(val) {
	//null for no max
	this.fixedSpeed.magnitude = val;
	this.fixedSpeed.sqMag = val * val;
};
P3D_Obj.prototype.setFixedVelocity = function(x,y,z) {
	//null for no max
	this.fixedSpeed.component = {x: x, y: y, z: z};
};

P3D_Obj.prototype.setVelocity= function(v) {
	this.state.v = v;
	this.truncateVelocity();
};


P3D_Obj.prototype.addMomentum= function(p) {
	this.state.p.add(p);
	this.state.recalc();
	this.truncateVelocity();
	this.truncateSpeed();
	this.state.recalcMomentum();
};

P3D_Obj.prototype.addVelocity= function(v) {
	this.state.v.add(v);
	this.truncateVelocity();
	this.truncateSpeed();
	this.state.recalcMomentum();
};

P3D_Obj.prototype.truncateVelocity= function() {
	//Max Velocity
	if (this.maxSpeed.component.x != null) {
		if (Math.abs(this.state.v.x) > this.maxSpeed.component.x) {
			var s = P3D_Math.getSign(this.state.v.x);
			var t = this.state.v.x;
			this.state.v.x = this.maxSpeed.component.x * s;
		}
	}
	
	if (this.maxSpeed.component.y != null) {
		if (Math.abs(this.state.v.y) > this.maxSpeed.component.y) {
			var s = P3D_Math.getSign(this.state.v.y);
			this.state.v.y = this.maxSpeed.component.y * s;
		}
	}
	
	if (this.maxSpeed.component.z != null) {
		if (Math.abs(this.state.v.z) > this.maxSpeed.component.z) {
		var s = P3D_Math.getSign(this.state.v.z);
		this.state.v.z = this.maxSpeed.component.z * s;
		}
	}

	//Min Velocity
	if (this.minSpeed.component.x != null) {
		if (Math.abs(this.state.v.x) < this.minSpeed.component.x) {
			this.state.v.x = 0;
		}
	}
	
	if (this.minSpeed.component.y != null) {
		if (Math.abs(this.state.v.y) < this.minSpeed.component.y) {
			this.state.v.y = 0;
		}
	}
	
	if (this.minSpeed.component.z != null) {
		if (Math.abs(this.state.v.z) < this.minSpeed.component.z) {
		this.state.v.z = 0;
		}
	}

	//Fixed Velocity
	if (this.fixedSpeed.component.x != null) {
		this.state.v.x = this.fixedSpeed.component.x;
	}
	
	if (this.fixedSpeed.component.y != null) {
		this.state.v.y = this.fixedSpeed.component.y;
	}
	
	if (this.fixedSpeed.component.z != null) {
		this.state.v.z = this.fixedSpeed.component.z;
	}
	
};

P3D_Obj.prototype.truncateSpeed= function() {
	//truncate
	var sm = this.state.v.getSqMag();

	if (this.maxSpeed.magnitude != null) { 
		if (sm > this.maxSpeed.sqMag) {
			this.state.v = this.state.v.getUnit();
			this.state.v.scale(this.maxSpeed.magnitude);
		}
	}

	if (this.minSpeed.magnitude != null) { 
		if (sm < this.minSpeed.sqMag) {
			this.state.v = new Vector3D(0,0,0);
		}
	}

	if (this.fixedSpeed.magnitude != null) { 
			this.state.v = this.state.v.getUnit();
			this.state.v.scale(this.fixedSpeed.magnitude);
	}
};

P3D_Obj.prototype.setFixedVelocity = function(vector) {}; //default is null (no velocity fixing)

P3D_Obj.prototype.setAirFriction = function(val) {};
P3D_Obj.prototype.setGroundFriction = function(val) {};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

