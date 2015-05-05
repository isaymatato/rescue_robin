const REDRAW_INTERVAL = 1;
var wd = window.location.pathname;
var wi = wd.lastIndexOf("/") + 1;
wd = wd.slice(0,wi);
//if (wd.search("/C:") != -1)
//	wd = wd.slice(3);
const WORKING_DIR = wd;

function Game2D() {
	initEvents(this);
	this.init();
}

Game2D.prototype.init = function() {
	
		this.input = new InputController(this);
		this.debug = true;
		
		this.win = new R2D_Win(48,16);
		//this.win.stretchToFit(false);
		//this.win.expandToFit(true);
		this.win.bind(this);
		this.win.bind(this.input);
		this.win.setCamera(0,0,0);
		
		this.soundManager = new G2D_SoundManager();
		this.soundManager.bind(this);
		
  		this.oList = [];
  
  		//Define now (for delta)
  		this.now = Date.now();
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Sound Functions
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function G2D_Sound(filename,type) {
	initEvents(this);
	this.volume = 1;
	this.pan = 0; //-1 (left) to 1 (right)
	
	this.filename = filename;
  	this.type = type;
  	this.command = [];
  	
  	switch (this.type) {
  		case "bgm": this.loop = false;
  					this.setEvent("audio_bgmVolume", this.onVolume); 
  					break;
  		case "sfx": this.loop = true;
  					this.setEvent("audio_sfxVolume", this.onVolume);
  					this.setEvent("audio_stopSfx", this.stop);
  					break;
  				}
  		

  	
  	this.setEvent("audio_masterVolume", this.onVolume);
  	this.setEvent("audio_onReady", this.onReady);
  	this.setEvent("audio_onStep", this.update);
}
G2D_Sound.prototype.onReady = function(e) {
	this.load();
	this.update(e);
};

G2D_Sound.prototype.onVolume = function(e) {
	var c = { type: "volume" };
	this.command.push(c);
};

G2D_Sound.prototype.load = function() {
	this.sm2 = soundManager.createSound({
    id: this.filename,
    url: this.filename,
    onconnect: function(bConnect) {
    // this.connected can also be used
    //window.debugtext= this.sID+' connected: '+(bConnect?'true':'false');
  	}
  });
};

G2D_Sound.prototype.getVolumeVal = function(sfxV,bgmV,masterV) {
	var v = this.volume;
					   
	switch (this.type) {
					   	case "sfx": this.volume *= sfxV; break;
					   	case "bgm": this.volume *= bgmV; break;
					   }
	v*=masterV;
	v*=100;
	return Math.floor(v);
}

G2D_Sound.prototype.update = function(e) {
	  for (var i=0;i<this.command.size;i++) {
		switch (this.command[i]) {
			case "destroy": this.sm2.destruct();
							//NOTE:  Memory leak here!!!!  sm2 sounds are removed, but not this object!!!
					 	break;
		
			case "play": var v = getVolumeVal(e.sfxVolume,e.bgmVolume,e.masterVolume); 
						 this.sm2.play({volume:v});
					 break;
			case "loop": var v = getVolumeVal(e.sfxVolume,e.bgmVolume,e.masterVolume);
						 this.sm2.play({volume:v, onfinish: this.play});
				 break;
			case "stop": this.sm2.stop(); break;
			case "mute": this.sm2.mute(); break;
			case "unmute": this.sm2.unmute(); break;
			case "pause": this.sm2.pause(); break;
			case "resume": this.sm2.resume(); break;
			case "volume": var v = getVolumeVal(e.sfxVolume,e.bgmVolume,e.masterVolume);
					   	   this.sm2.setVolume(v);
					   break;
					   
			case "pan": this.sm2.setPan(this.pan * 100); break;
		}
	  }
	  
	  //Check if loaded 
	  //clear command list
	  //window.debugtextB= "readyState: " + this.sm2.readyState; 
	  if (this.sm2.readyState==3) {this.command = [];}
	
	
};

G2D_Sound.prototype.onFinish = function(self) {
	self.play();
}

G2D_Sound.prototype.destroy = function() {
	var c = { type: "destroy" };
	this.command.push(c);
};

G2D_Sound.prototype.play = function() {
	var c = { type: "play" };
	this.command.push(c);
};

G2D_Sound.prototype.loop = function() {
	var c = { type: "loop" };
	this.command.push(c);
};

G2D_Sound.prototype.stop = function() {
	var c = { type: "stop" };
	this.command.push(c);
};

G2D_Sound.prototype.mute = function() {
	var c = { type: "mute" };
	this.command.push(c);
};

G2D_Sound.prototype.unmute = function() {
	var c = { type: "unmute" };
	this.command.push(c);
};

G2D_Sound.prototype.pause = function() {
	var c = { type: "pause" };
	this.command.push(c);
};

G2D_Sound.prototype.resume = function() {
	var c = { type: "resume" };
	this.command.push(c);
};

G2D_Sound.prototype.isPlaying = function() {
	return (this.sm2.playState == 1);
};

G2D_Sound.prototype.setVolume = function(value) {
	this.volume = value;
	var c = { type: "volume" };
	this.command.push(c);
};

G2D_Sound.prototype.fade = function(value,time) {
};

G2D_Sound.prototype.pan = function(value) {
	this.pan = value;
	var c = { type: "pan" };
	this.command.push(c);
};
///////////////////
//Sound Manager
///////////////////

function G2D_SoundManager() {
	initEvents(this);
	this.sfx_volume = 1;
	this.bgm_volume = 1;
	this.master_volume = 1;
	
	this.sfx_list = [];
	this.bgm_list = [];
	
	this.ready = false;
	this.initSM2();
	
	this.setEvent("game_audiostep",this.onStep);
}

G2D_SoundManager.prototype.onStep = function(e) {
	if (this.ready) {
		var e = new Event("audio_onStep");
		e.sfxVolume = this.sfx_volume;
		e.bgmVolume = this.bgm_volume;
		e.masterVolume = this.master_volume;
		this.eventPerform(e);
		}
}


G2D_SoundManager.prototype.initSM2 = function() {
	soundManager.url = WORKING_DIR + 'sm2swf/';
	
	soundManager.flashVersion = (window.location.toString().match(/#flash8/i)?8:9);
	if (soundManager.flashVersion != 8) {
  			soundManager.useHighPerformance = true;
  			soundManager.useFastPolling = true;
	}
	
	var self = this;
	soundManager.onready(function() {
    	self.onReady();
	});
	soundManager.ontimeout(function(){
	//alert('SM2 Load Error! :(');
	});
	
};

G2D_SoundManager.prototype.onReady = function() {
	this.ready = true;
	var e = new Event("audio_onReady")
	this.eventPerform(e);
};


G2D_SoundManager.prototype.createSFX = function(filename) {
	var s = new G2D_Sound(filename,"sfx");
	s.bind(this);
	this.sfx_list.push(s);
	return s;
};

G2D_SoundManager.prototype.createBGM = function(filename) {
	var s = new G2D_Sound(filename,"bgm");
	s.bind(this);
	this.bgm_list.push(s);
	return s;
};

G2D_SoundManager.prototype.sfx_stopAll = function() {
	var e = new Event("audio_stopSfx");
	this.eventPerform(e);
};

G2D_SoundManager.prototype.setSfxVolume = function(val) {
	this.sfx_volume = val;
	var e = new Event("audio_sfxVolume");
	this.eventPerform(e);
};

G2D_SoundManager.prototype.setBgmVolume = function(val) {
	this.bgm_volume = val;
	var e = new Event("audio_bgmVolume");
	this.eventPerform(e);
};

G2D_SoundManager.prototype.setMasterVolume = function(val) {
	this.master_volume = val;
	var e = new Event("audio_masterVolume");
	this.eventPerform(e);
};

Game2D.prototype.sfx_stopAll = function() {this.soundManager.sfx_stopAll();};
Game2D.prototype.setSfxVolume = function(val) {this.soundManager.setSfxVolume(val);};
Game2D.prototype.setBgmVolume = function(val) {this.soundManager.setBgmVolume(val);};
Game2D.prototype.setMasterVolume = function(val) {this.soundManager.setMasterVolume(val);};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



Game2D.prototype.getWin = function() {
	return this.win;
};

Game2D.prototype.render = function(delta) {
	var a = this.win.getAspectRatio();
  	if (a > 1)
  		{var gh = ((a - 0.75) * -5) + 18.75;}
  	else
  		{var gh = (a * 5.625) + 18.75;}
  	if (gh<15) {gh = 15;}
  	if (gh>22.5) {gh = 22.5;}
  	
  	this.win.setGridHeight(gh); 
  	this.win.render(delta);
};

Game2D.prototype.eventPerformDelta = function(str,delta) {
	var e = new Event(str);
	e.delta = delta;
	this.eventPerform(e)
}

Game2D.prototype.step = function() {
	
	
  	var delta = (Date.now() - this.now) * 0.001;
    this.now = Date.now();
    
    this.eventPerformDelta("game_beginstep",delta);
    this.eventPerformDelta("game_input",delta);
    this.eventPerformDelta("game_audiostep",delta);
    this.eventPerformDelta("game_step",delta);
    this.eventPerformDelta("game_physics",delta);
    this.eventPerformDelta("game_endstep",delta);
    this.eventPerformDelta("game_draw",delta);
    
    this.render(delta);		
};

Game2D.prototype.onReady = function() {
  	this.main = new Main(this);
  	this.main.loadres();
  	this.main.init();
};

Game2D.prototype.getSpiList = function() {
	return this.win.getSpiList();
};
Game2D.prototype.getWinBbox = function() {
	return this.win.getBbox();
};
Game2D.prototype.getView = function() {
	return this.win.getView();
};
Game2D.prototype.moveCamera = function(dx,dy,dz) {
	this.win.moveCamera(dx,dy,dz);
};
Game2D.prototype.setCamPos = function(x,y,z) {
	var cam = this.win.getCamera();
	cam.setPos3D(x,y,z);
};
Game2D.prototype.setCamRange = function(minX,minY,minZ,maxX,maxY,maxZ) {
	var cam = this.win.getCamera();
	cam.setRange(minX,minY,minZ,maxX,maxY,maxZ);
};

Game2D.prototype.getCamRay = function(cursor) {
	return new R2D_CamRay(cursor,this.win)
};



Game2D.prototype.addSpi = function(r2d_spanim,x,y,z) {
	var sl = this.getSpiList();
	return sl.addSpi(r2d_spanim,0,x,y,z);
};

Game2D.prototype.addCdi = function(x,y,z,scale) {
	var sl = this.getSpiList();
	return sl.addCdi(x,y,z,scale);
};

Game2D.prototype.addCircle = function(x,y,z,radius,color) {
	var sl = this.getSpiList();
	return sl.addCircle(x,y,z,radius,color);
};

Game2D.prototype.addEllipse = function(x,y,z,w,h,color) {
	var sl = this.getSpiList();
	return sl.addEllipse(x,y,z,w,h,color);
};


Game2D.prototype.addRect = function(x,y,z,w,h,color) {
	var sl = this.getSpiList();
	return sl.addRect(x,y,z,w,h,color);
};

Game2D.prototype.addHexagon = function(x,y,z,scale,color) {
	var sl = this.getSpiList();
	return sl.addHexagon(x,y,z,scale,color);
};

Game2D.prototype.addButton = function(x,y,z,radius,color) {
	var sl = this.getSpiList();
	return sl.addButton(x,y,z,radius,color);
};

Game2D.prototype.addDPad = function(fourdir,x,y,z,radius,color) {
	var sl = this.getSpiList();
	var spi = sl.addDPad(x,y,z,radius,color);
	spi.fourdir = fourdir; 
	return spi;
};

Game2D.prototype.addAnalogJoy = function(axis_name,x,y,z,radius,color) {
	var sl = this.getSpiList();
	var spi = sl.addAnalogJoy(x,y,z,radius,color);
	spi.vgaxis = this.vg_getAxis(axis_name);
	return spi;
};

Game2D.prototype.addText = function(x,y,z,text) {
	var sl = this.getSpiList();
	return sl.addText(x,y,z,text);
};
Game2D.prototype.addDebug = function(x,y,z,debug,obj) {
	var sl = this.getSpiList();
	var str = debug;
	return sl.addText(x,y,z,debug+": " + eval(debug));
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
//Input functions
///////////////////////////////////////////////////////////////////////////////////////////////////////
Game2D.prototype.getInput = function() {
	return this.input;
};
Game2D.prototype.getTouchEnabled = function() {
	return this.input.getTouchEnabled();
};

Game2D.prototype.vg_addButton = function(name,x,y,w,h) {
	if ( this.getTouchEnabled() ) {
		var ic = this.getInput();
		return ic.vg_addButton(name,x,y,w,h);
	}
	else {return null;}
};
Game2D.prototype.vg_addAxis = function(name,x,y,inner_radius, outer_radius, type) {
	if ( this.getTouchEnabled() ) {
		var ic = this.getInput();
		return ic.vg_addAxis(name,x,y,inner_radius, outer_radius, type);
	}
	else {return null;}
};
Game2D.prototype.vg_getAxis = function(name) {
	var ic = this.getInput();
	return ic.vg_getAxis(name);
};


Game2D.prototype.vg_clearGUI = function() {
	var ic = this.getInput();
	ic.vg_clearGUI();
};




///////////////////////////////////////////////////////////////////////////////////////////////////////
//Draw functions
///////////////////////////////////////////////////////////////////////////////////////////////////////
Game2D.prototype.drawCdi = function(x,y,z,scale) {
	var sl = this.getSpiList();
	var spi = sl.addCdi(x,y,z,scale);
	spi.destroyAfterDraw();
	return spi;
};

Game2D.prototype.drawCircle = function(x,y,z,radius,color) {
	var sl = this.getSpiList();
	var spi = sl.addCircle(x,y,z,radius,color);
	spi.destroyAfterDraw();
};

Game2D.prototype.drawRect = function(x,y,z,w,h,color) {
	var sl = this.getSpiList();
	var spi = sl.addRect(x,y,z,w,h,color);
	spi.destroyAfterDraw();
	return spi;
};

Game2D.prototype.drawEllipse = function(x,y,z,w,h,color) {
	var sl = this.getSpiList();
	var spi = sl.addEllipse(x,y,z,w,h,color);
	spi.destroyAfterDraw();
	return spi;
};

Game2D.prototype.drawHexagon = function(x,y,z,scale,color) {
	var sl = this.getSpiList();
	var spi = sl.addHexagon(x,y,z,scale,color);
	spi.destroyAfterDraw();
};
Game2D.prototype.drawButton = function(x,y,z,radius,color) {
	var sl = this.getSpiList();
	var spi = sl.addButton(x,y,z,radius,color);
	spi.destroyAfterDraw();
};

Game2D.prototype.drawDPad = function(fourdir,x,y,z,radius,color) {
	var sl = this.getSpiList();
	var spi = sl.addDPad(x,y,z,radius,color);
	spi.fourdir = fourdir;
	spi.destroyAfterDraw();
};

Game2D.prototype.drawAnalogJoy = function(axis_name,x,y,z,radius,color) {
	var sl = this.getSpiList();
	var spi = sl.addAnalogJoy(x,y,z,radius,color);
	spi.vgaxis = this.vg_getAxis(axis_name); 
	spi.destroyAfterDraw();
};

Game2D.prototype.drawText = function(x,y,z,text) {
	var sl = this.getSpiList();
	var spi = sl.addText(x,y,z,text);
	spi.destroyAfterDraw();
};
Game2D.prototype.drawDebug = function(x,y,z,debug) {
	var sl = this.getSpiList();
	var spi = sl.addText(x,y,z,debug+": " + eval(debug));
	spi.destroyAfterDraw();
};
///////////////////////////////////////////////////////////////////////////////////////////////////////

Game2D.prototype.newGameObj = function() {
	go.prototype = new GameObj;
	go.init(this);
	this.oList.push(go);
	return go;
	
};

function GameObj() {
}
GameObj.prototype.init = function(g2d) {
	this.g2d = g2d;
	initEvents(this);
	this.bind(this.g2d.win);
};

///////////////////////////////////////////////////////////////////////////////////////////////////////
function Main(g2d) {
	this.g2d = g2d;
	initEvents(this);
	this.bind(this.g2d.win);
}

Main.prototype.loadres = function() {
	//Intentionally left blank... 8)
}

////////////////
//Main - Images
////////////////
Main.prototype.createImgList = function() {
var l = new R2D_ImgList();
return l;
};

Main.prototype.createImage = function(imglist,filename) {
var img = imglist.addImg(filename);;
return img;
};

Main.prototype.createSpriteAnim = function(imglist,filename,num_f, f_per_row, f_width, f_height, f_offset, x_px_offset, y_px_offset) {
var s = new R2D_SpriteAnim(imglist,filename,num_f, f_per_row, f_width, f_height, f_offset, x_px_offset, y_px_offset);
return s;
};

////////////////
//Main - Audio
////////////////
Main.prototype.createSfx = function(filename) {
var s = this.g2d.soundManager.createSFX(filename);
return s;
};
Main.prototype.createBgm = function(filename) {
var s = this.g2d.soundManager.createBGM(filename);
return s;
};


$(document).ready(function() {
	var g2d = new Game2D();
	g2d.onReady();

  window.setInterval(function() {
  	g2d.step();
  	
  }, REDRAW_INTERVAL);
});
