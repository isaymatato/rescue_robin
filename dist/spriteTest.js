function addOver (x,y,w,h,cdi,sprite) {
	var df = new R2D_ImageRenderFunction;
	df.renderSprite(sprite,0,x,y,1,1,false,false);
	cdi.addFunction(df);
}

function addComp (x,y,w,h,cdi,sprite,col) {
	var df = new R2D_ImageRenderFunction;
	df.renderSprite(sprite,0,x,y,1,1,false,false);
	var rf = new R2D_RenderFunction;
	rf.setCO("destination-out");
	cdi.addFunction(rf);
	cdi.addFunction(df);
	
	
	var df = new R2D_DrawFunction;
	df.rect(x,y,w,h);
	var rf = new R2D_RenderFunction;
	rf.setCO("destination-over");
	rf.setFillColor(col);
	rf.fill();
	rf.setCO("source-atop");
	cdi.addFunction(df);
	cdi.addFunction(rf);
}

function addCompGrad (x,y,w,h,cdi,sprite,col1,col2) {
	var df = new R2D_ImageRenderFunction;
	df.renderSprite(sprite,0,x,y,1,1,false,false);
	var rf = new R2D_RenderFunction;
	rf.setCO("destination-out");
	cdi.addFunction(rf);
	cdi.addFunction(df);
	
	
	var df = new R2D_DrawFunction;
	df.rect(x,y,w,h);
	var rf = new R2D_RenderFunction;
	rf.setCO("destination-over");
	rf.setFillLinearGradient(x,y,w,h);
	rf.addColorStop(0,col1);
	rf.addColorStop(1,col2);
	rf.fill();
	rf.setCO("source-atop");
	cdi.addFunction(df);
	cdi.addFunction(rf);
}

function AvatarObj(x,y,z,color,g2d,spAnim) {
	initEvents(this);
	this.x = x;
	this.y = y;
	this.z = z;
	this.color = color;
	this.g2d = g2d;
	this.sp = spAnim;
	
	this.standTile = null;
	
	this.initBlink();
	this.initSine();
	this.initTilt();
	this.initColors();
	this.initSpis();
	this.setEvent("game_step",this.step);
	this.setEvent("game_endstep",this.endStep);
}

AvatarObj.prototype.initColors = function() {
	this.sColor = [];
	this.sColor[0] = "#902d57";
	this.sColor[1] = "#982f63";
	this.sColor[2] = "#2f5d98";
	this.sColor[3] = "#4c2f98";
	this.sColor[4] = "#722d90";
	this.sColor[5] = "#9539b7";
	this.sColor[6] = "#b8b1f9";
	this.sColor[7] = "#35174c";
};

AvatarObj.prototype.setTile = function(tile) { this.standTile = tile; };
AvatarObj.prototype.clearTile = function() { this.standTile = null; };

AvatarObj.prototype.updatePos = function() {
	if (this.standTile==null)
		var offY = 0;
	else
		{
		var offY = this.standTile.offY;
		this.sOffset = this.standTile.sOffset;
		}
	
	offY-=8;
		
	for (var i=0;i<this.spi.length;i++)
		this.spi[i].spi.setPos(this.x,this.y+offY,this.z-(i*0.001));
};

AvatarObj.prototype.initSpis = function() {
	this.spi = [];
	
	var s = this.g2d.addEllipse(0,0,0,96,48,"black");
	s.setOrigin(0,5);
	s.setAlpha("0.77");
	this.shadow = s;
	this.spi.push({spi:s,color: "none"});
	
	var s = this.g2d.addSpi(this.sp.av.footFront[0], 0,0,0);
	this.spi.push({spi:s,color: "none"});
	var s = this.g2d.addSpi(this.sp.av.footFront[1], 0,0,0);
	this.spi.push({spi:s,color: "none"});
	
	
	this.tiltSpi = [];
	this.tiltSpi[0] = [];
	
	this.lHand = [];
	this.rHand = [];
	
	//Left hand
	var s = this.g2d.addCdi(0,0,0,1);
	s.setCO("destination-out");
	var f = new R2D_TransformFunction();
	f.translate(-32,-34);
	f.rotate("rotation");
	s.addFunction(f);
	var f = new R2D_ImageRenderFunction();
	f.renderSprite(this.sp.av.handLeft[0],0,0,0,1,1,false,false);
	s.addFunction(f);
	this.spi.push({spi:s,color: "none"});
	this.lHand.push(s);
	this.tiltSpi[0].push(s);
	
	//Right hand
	var s = this.g2d.addCdi(0,0,0,1);
	s.setCO("destination-out");
	var f = new R2D_TransformFunction();
	f.translate(32,-34);
	f.rotate("rotation");
	s.addFunction(f);
	var f = new R2D_ImageRenderFunction();
	f.renderSprite(this.sp.av.handRight[0],0,0,0,1,1,false,false);
	s.addFunction(f);
	this.spi.push({spi:s,color: "none"});
	this.rHand.push(s);
	this.tiltSpi[0].push(s);
	
	var s = this.g2d.addSpi(this.sp.av.grad, 0,0,0);
	s.setCO("destination-over");
	s.setFrameSingle(this.color);
	this.spi.push({spi:s,color: "grad"});
	
	
	//Left hand
	var s = this.g2d.addCdi(0,0,0,1);
	s.setCO("destination-out");
	var f = new R2D_TransformFunction();
	f.translate(-32,-34);
	f.rotate("rotation");
	s.addFunction(f);
	var f = new R2D_ImageRenderFunction();
	f.renderSprite(this.sp.av.handLeft[2],0,0,0,1,1,false,false);
	s.addFunction(f);
	this.spi.push({spi:s,color: "none"});
	this.lHand.push(s);
	this.tiltSpi[0].push(s);
	
	//Right hand
	var s = this.g2d.addCdi(0,0,0,1);
	s.setCO("destination-out");
	var f = new R2D_TransformFunction();
	f.translate(32,-34);
	f.rotate("rotation");
	s.addFunction(f);
	var f = new R2D_ImageRenderFunction();
	f.renderSprite(this.sp.av.handRight[2],0,0,0,1,1,false,false);
	s.addFunction(f);
	this.spi.push({spi:s,color: "none"});
	this.rHand.push(s);
	this.tiltSpi[0].push(s);
	
	
	var s = this.g2d.addRect(0,0,0,128,128,this.sColor[this.color]);
	s.setOrigin(64,128);
	s.setCO("destination-over");
	this.spi.push({spi:s,color: "color"});
	
	//Left hand
	var s = this.g2d.addCdi(0,0,0,1);
	var f = new R2D_TransformFunction();
	f.translate(-32,-34);
	f.rotate("rotation");
	s.addFunction(f);
	var f = new R2D_ImageRenderFunction();
	f.renderSprite(this.sp.av.handLeft[1],0,0,0,1,1,false,false);
	s.addFunction(f);
	this.spi.push({spi:s,color: "none"});
	this.lHand.push(s);
	this.tiltSpi[0].push(s);
	
	//Right hand
	var s = this.g2d.addCdi(0,0,0,1);
	var f = new R2D_TransformFunction();
	f.translate(32,-34);
	f.rotate("rotation");
	s.addFunction(f);
	var f = new R2D_ImageRenderFunction();
	f.renderSprite(this.sp.av.handRight[1],0,0,0,1,1,false,false);
	s.addFunction(f);
	this.spi.push({spi:s,color: "none"});
	this.rHand.push(s);
	this.tiltSpi[0].push(s);
	
	this.tiltSpi[1] = [];
	
	var s = this.g2d.addSpi(this.sp.av.bodFront[0], 0,0,0);
	s.setCO("destination-out");
	this.spi.push({spi:s,color: "none"});
	this.tiltSpi[1].push(s);
	var s = this.g2d.addSpi(this.sp.av.grad, 0,0,0);
	s.setCO("destination-over");
	s.setFrameSingle(this.color);
	this.spi.push({spi:s,color: "grad"});
	

	var s = this.g2d.addSpi(this.sp.av.bodFront[2], 0,0,0);
	s.setCO("destination-out");
	this.spi.push({spi:s,color: "none"});
	this.tiltSpi[1].push(s);
	
	this.tiltSpi[2] = [];
	var s = this.g2d.addSpi(this.sp.av.hairFront[2], 0,0,0);
	s.setCO("destination-out");
	this.spi.push({spi:s,color: "none"});
	this.tiltSpi[2].push(s);
	var s = this.g2d.addRect(0,0,0,128,128,this.sColor[this.color]);
	s.setOrigin(64,128);
	s.setCO("destination-over");
	this.spi.push({spi:s,color: "color"});
	
	var s = this.g2d.addSpi(this.sp.av.bodFront[1], 0,0,0);
	this.spi.push({spi:s,color: "none"});
	this.tiltSpi[1].push(s);
	
	this.tiltSpi[3] = [];
	var s = this.g2d.addSpi(this.sp.av.eyesFront, 0,0,0);
	s.setFrameSingle(0);
	this.eyesFront = s;
	this.spi.push({spi:s,color: "none"});
	this.tiltSpi[3].push(s);
	
	var s = this.g2d.addSpi(this.sp.av.hairFront[0],0,0,0);
	s.setCO("destination-out");
	this.spi.push({spi:s,color: "none"});
	this.tiltSpi[2].push(s);
	var s = this.g2d.addSpi(this.sp.av.grad,0,0,0);
	s.setCO("destination-over");
	s.setFrameSingle(this.color);
	this.spi.push({spi:s,color: "grad"});
	
	var s = this.g2d.addSpi(this.sp.av.hairFront[1], 0,0,0);
	this.spi.push({spi:s,color: "none"});
	this.tiltSpi[2].push(s);
	
	this.tiltSpi[4] = [];
	var s = this.g2d.addSpi(this.sp.av.mouthFront, 0,0,0);
	this.spi.push({spi:s,color: "none"});
	this.tiltSpi[4].push(s);
	
	for (var i=0;i<this.spi.length;i++)
		this.spi[i].spi.setPos(this.x,this.y,this.z-(i*0.001));
};

AvatarObj.prototype.setArmRotation = function(rad) {
	for (var i=0;i<this.lHand.length;i++)
		this.lHand[i].setRotation(-rad);
	for (var i=0;i<this.rHand.length;i++)
		this.rHand[i].setRotation(rad);
};

AvatarObj.prototype.initTilt = function() {
	this.tiltRange = [];
	this.tiltRange[0]=2;
	this.tiltRange[1]=1;
	this.tiltRange[2]=2;
	this.tiltRange[3]=2;
	this.tiltRange[4]=3;
};

AvatarObj.prototype.initSine = function() {
	this.centerR = Math.PI * 0.2;
	this.offR = 0;
	this.sinP = null;
	this.sRRange = Math.PI * 0.1;
	this.sInterval = 1024;
	this.sOffset = Math.random() * this.sInterval;
};

AvatarObj.prototype.stepSine = function() {
	var p = (Date.now()+this.sOffset) % this.sInterval;
	p/=this.sInterval;
	p*=Math.PI;
	this.sinP = Math.sin(p);
	this.offR = this.sinP * this.sRRange;
	var nr = this.centerR + this.offR;
	
	this.setArmRotation(nr);
};

AvatarObj.prototype.stepTilt = function() {
	for (var i=0;i<5;i++){
		var addY = this.sinP * this.tiltRange[i];
		
		for (var j=0;j<this.tiltSpi[i].length;j++)
			this.tiltSpi[i][j].addPos(0,addY,0);
	}
	
	this.shadow.setScale(0.95 + (this.sinP*0.05) );
};


AvatarObj.prototype.initBlink = function() {
	this.bStart = Date.now();
	this.bRMax = 5000;
	this.bOpen = 1000 + (Math.random() * this.bRMax);
	this.bClose = 350;
	this.bMid = 60;
	this.bCycle = [];
	this.bCycle[0]=this.bOpen;
	this.bCycle[1]=this.bCycle[0]+this.bMid;
	this.bCycle[2]=this.bCycle[1]+this.bClose;
	this.bCycle[3]=this.bCycle[2]+this.bMid;
};

AvatarObj.prototype.resetBlink = function() {
	this.bStart += this.bCycle[3];
	this.bOpen = 1000 + (Math.random() * this.bRMax);
	this.bCycle = [];
	this.bCycle[0]=this.bOpen;
	this.bCycle[1]=this.bCycle[0]+this.bMid;
	this.bCycle[2]=this.bCycle[1]+this.bClose;
	this.bCycle[3]=this.bCycle[2]+this.bMid;
};

AvatarObj.prototype.stepBlink = function() {
	var d = Date.now() - this.bStart;
	
	var f = 0;
	if (d>this.bCycle[0])
		f = 1;
	if (d>this.bCycle[1])
		f = 2;
	if (d>this.bCycle[2])
		f = 1;
	if (d>this.bCycle[3]) {
		this.resetBlink();
		this.stepBlink();
	}
	else {
		this.eyesFront.setFrameSingle(f);
	}
};

AvatarObj.prototype.step = function() {
	this.stepBlink();
	this.stepSine();
};
AvatarObj.prototype.endStep = function() {
	this.updatePos();
	this.stepTilt();
};



function TpObj(x,y,z,color,g2d,spAnim,pS) {
	initEvents(this);
	this.x = x;
	this.y = y;
	this.z = z;
	this.color = color;
	this.g2d = g2d;
	this.sp = spAnim;
	this.ps = pS;
	
	this.initBlink();
	this.initSine();
	
	this.spi = {};
	
	if (this.color<5) {
		this.spi.bod = this.g2d.addSpi(this.sp.tp[this.color].body, this.x,this.y,0); 
		this.spi.eye = this.g2d.addSpi(this.sp.tp[this.color].eyes, this.x,this.y,0);
		this.spi.eye.setFrameSingle(0);
	
	
		var f = Math.random()*4;
		this.spi.lWing = this.g2d.addSpi(this.sp.lWing,this.x-56,this.y-32,-1);
		this.spi.lWing.setFrame(f);
		this.spi.rWing = this.g2d.addSpi(this.sp.lWing,this.x+32,this.y-32,-1);
		this.spi.rWing.setMirror(true);
		this.spi.rWing.setFrame(f);
	}
	else {
		this.spi.bod = this.g2d.addSpi(this.sp.n[this.color-5].body, this.x,this.y,0); 
		this.spi.eye = this.g2d.addSpi(this.sp.n[this.color-5].eyes, this.x,this.y,0);
		this.spi.eye.setFrameSingle(0);
	}
	
	this.setEvent("game_step",this.step);
}

TpObj.prototype.die = function() {
	this.ps.burst(this.x,this.y,this.color,128);
	this.spi.bod.destroy();
	this.spi.eye.destroy();
	if (this.color<5) {
		this.spi.lWing.destroy();
		this.spi.rWing.destroy();
		}
};

TpObj.prototype.setPos = function(x,y) {
	this.x = x;
	this.y = y;
	this.spi.bod.setPos(x,y,this.z);
	this.spi.eye.setPos(x,y,this.z);
	if (this.color<5) {
		this.spi.lWing.setPos(x-56,y-32,this.z-1);
		this.spi.rWing.setPos(x+32,y-32,this.z-1);
		}
};

TpObj.prototype.initSine = function() {
	this.centerY = this.y;
	this.offY = 0;
	this.sYRange = 4;
	this.sInterval = 1024;
	this.sOffset = Math.random() * this.sInterval;
};

TpObj.prototype.stepSine = function() {
	var p = (Date.now()+this.sOffset) % this.sInterval;
	p/=this.sInterval;
	p*=Math.PI;
	this.offY = (Math.sin(p) * this.sYRange);
	var ny = this.centerY + this.offY;
	
	this.setPos(this.x,ny);
};


TpObj.prototype.initBlink = function() {
	this.bStart = Date.now();
	this.bRMax = 10000;
	this.bOpen = 1000 + (Math.random() * this.bRMax);
	this.bClose = 250;
	this.bMid = 40;
	this.bCycle = [];
	this.bCycle[0]=this.bOpen;
	this.bCycle[1]=this.bCycle[0]+this.bMid;
	this.bCycle[2]=this.bCycle[1]+this.bClose;
	this.bCycle[3]=this.bCycle[2]+this.bMid;
};

TpObj.prototype.resetBlink = function() {
	this.bStart += this.bCycle[3];
	this.bOpen = 1000 + (Math.random() * this.bRMax);
	this.bCycle = [];
	this.bCycle[0]=this.bOpen;
	this.bCycle[1]=this.bCycle[0]+this.bMid;
	this.bCycle[2]=this.bCycle[1]+this.bClose;
	this.bCycle[3]=this.bCycle[2]+this.bMid;
};

TpObj.prototype.stepBlink = function() {
	var d = Date.now() - this.bStart;
	
	var f = 0;
	if (d>this.bCycle[0])
		f = 1;
	if (d>this.bCycle[1])
		f = 2;
	if (d>this.bCycle[2])
		f = 1;
	if (d>this.bCycle[3]) {
		this.resetBlink();
		this.stepBlink();
	}
	else {
		this.spi.eye.setFrameSingle(f);
	}
};

TpObj.prototype.step = function() {
	this.stepBlink();
	this.stepSine();
};

function colorToArray(color) {
	var a = [];
	for (var i=0;i<3;i++)
		a[i]= parseInt(color.substr(1+(i*2),2),16);
	return a;	
}

function arrayToColor(array) {
	var c="#";
	for (var i=0;i<3;i++)
		{
		var s = array[i].toString(16);
		while (s.length<2)
			s="0"+s;
		c+=s;
		}
	return c;
}

function combineColor(color1,color2,alpha) {
	var c1 = colorToArray(color1);
	var c2 = colorToArray(color2);
	var c3 = [];
	
	var ia = 1-alpha;
	
	for (var i=0;i<3;i++) {
		c3[i]=Math.round((c1[i]*ia)+(c2[i]*alpha));
	}
	
	return arrayToColor(c3);
}

function getGradColor(pos,gradient) {
	var size = gradient.length;
	var ps = pos * size;
	var min = Math.floor(ps);
	var alf = ps % 1;
	
	if (ps>=size-1)
		return gradient[size-1];
	else
		return combineColor(gradient[min],gradient[min+1],alf);
}

function PSystem(g2d) {
	this.p=[];
	this.type = [];
	this.g2d = g2d;
	this.defineTypes();
	this.z=-2;
	
	initEvents(this);
	this.setEvent("game_draw",this.draw);
}

PSystem.prototype.defineTypes = function(){
		var numTiles = 8;
	this.gradColor=[];
	for (var i=0;i<numTiles;i++) {
		this.gradColor[i]=[];
	}
	
	//0 is dark
	//1 is light
	
	this.gradColor[0][0]="#4c24c7";
	this.gradColor[0][1]="#9e49e6";
	this.gradColor[1][0]="#2869de";
	this.gradColor[1][1]="#5cb5e6";
	this.gradColor[2][0]="#0fb64e";
	this.gradColor[2][1]="#9ee649";
	this.gradColor[3][0]="#b31c1c";
	this.gradColor[3][1]="#e26340";
	this.gradColor[4][0]="#deb228";
	this.gradColor[4][1]="#dbe65c";
	this.gradColor[5][0]="#efaf30";
	this.gradColor[5][1]="#f6e95d";
	this.gradColor[6][0]="#ef7830";
	this.gradColor[6][1]="#f6c95d";
	this.gradColor[7][0]="#ef4f30";
	this.gradColor[7][1]="#f6c05d";
	
	for (var i=0;i<numTiles;i++) {
		this.addType(this.gradColor[i][1],this.gradColor[i][0],96,48,1000,250,16,4);
	}
	
};

PSystem.prototype.addType = function(color1,color2,maxDistance,minDistance,maxLife,minLife,startRadius,endRadius) {
	var n = this.type.push({c1:color1,c2:color2,minS:minDistance,rS:maxDistance-minDistance,minL:minLife,rL:maxLife-minLife,startR:startRadius,dR:endRadius-startRadius});
	return n-1;
};

PSystem.prototype.addP = function(px,py,type) {
	//Get Type
	var t = this.type[type];
	
	//Get Speed
	var s = t.minS + (Math.random()*t.rS);
	
	//Get Velocity
	var vx = (Math.random()*2)-1;
	var vy = (Math.random()*2)-1;
	var vm = Math.sqrt((vx*vx)+(vy*vy));
	s/=vm;
	vx*=s;
	vy*=s;
	
	//Get Die
	var l = t.minL + (Math.random()*t.rL);
	var d = Date.now() + l;
	
	this.p.push({px:px,py:py,vx:vx,vy:vy, life: l, die: d, type:type});
};

PSystem.prototype.burst = function(x,y,type,numP) {
	for (var i=0;i<numP;i++)
		this.addP(x,y,type);
};

PSystem.prototype.draw = function() {
	//Create cdi
	var cdi = this.g2d.drawCdi(0,0,this.z,1);
	
	//reverse array
	this.p.reverse();
	for (var i = 0;i<this.p.length;i++) {
		//get delta
		var d = this.p[i].die - Date.now();
		if (d<0) {
			this.p.splice(i,1);
		}
		else {
			//get alf
			var a=1-(d/this.p[i].life);
			//get type
			var t = this.type[this.p[i].type];
			//get radius
			var r = t.startR + (t.dR * a);
			//get grad 
			var g = ["#ffffff",t.c1,t.c2];//,"#000000"];
			
			//get color
			var c = getGradColor(a,g);
			
			var dx = this.p[i].px + (this.p[i].vx*a);
			var dy = this.p[i].py + (this.p[i].vy*a);
			
			var df = new R2D_DrawFunction();
			df.circle(dx,dy,r);
			var rf = new R2D_RenderFunction();
			rf.setFillColor(c);
			rf.fill();
			cdi.addFunction(df);
			cdi.addFunction(rf);
		}
	}
	this.p.reverse();
};

Main.prototype.init = function() {
	//this.test();
	this.initSpis();
	this.setEvent("key_down_space",this.makeP);
  	//this.initGame();
};
Main.prototype.test = function() {
	this.g2d.setCamPos(0,0,-100);
	this.bg = this.g2d.addCdi(-256,-128,10,1);
	var df = new R2D_DrawFunction;
	df.rect(-1024,-1024,2048,2048);
	var rf = new R2D_RenderFunction;
	rf.setFillColor("white");
	rf.fill();
	this.bg.addFunction(df);
	this.bg.addFunction(rf);
	
	
	for (var i=0;i<3;i++) {
		this.g2d.addSpi(this.sp.av.handLeft[i], 0+(32*i),0,0);
		this.g2d.addSpi(this.sp.av.handRight[i], 0+(32*i),32,0);		
	}
 
};

Main.prototype.initSpis = function() {
	
	this.bg = this.g2d.addCdi(-256,-128,10,1);
	var df = new R2D_DrawFunction;
	df.rect(-2048,-2048,4096,4096);
	var rf = new R2D_RenderFunction;
	rf.setFillColor("#100b04");
	rf.fill();
	this.bg.addFunction(df);
	this.bg.addFunction(rf);
	
	this.bg2 = this.g2d.addSpi(this.sp.bg,0,0,1);
	
	
	var px  = -256;
	var py = -256;
	var avColor = 3;
	
	this.avatar = new AvatarObj(0,0,-3,avColor,this.g2d,this.sp);
	this.avatar.bind(this);
	
	this.g2d.setCamPos(0,0,-100);
	
	this.ps = new PSystem(this.g2d);
	this.ps.bind(this);
	
	this.tile = [];
	
	this.xsize = 100;
	this.ysize = 96;
	
	for (var j=0;j<5;j++) 
		for (var i=0;i<5;i++)
			{
				var n = (j*5)+i;
				this.tile[n] = new TpObj(-200 + (i*this.xsize),-192 + (j*this.ysize),-j*0.01, Math.floor(Math.random()*8),this.g2d,this.sp,this.ps);
				this.tile[n].bind(this);
	}
	
	var tx=2;
	var ty=2;
	this.avatar.setTile( this.tile[(ty*5)+tx] )
	
	this.dead=false;
};


Main.prototype.makeP = function() {
	if (!this.dead) {
		this.dead = true;
		for (var i=0;i<this.tile.length;i++)
			this.tile[i].die();
		this.tile = null;
	}
}
