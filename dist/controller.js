//Note:  Timeout event for touches, that way if touchend is missed, it gets removed from list

function InputController (game2d) {
	
	initEvents(this);
	this.g2 = game2d;
	this.bind(this.g2);
	
	this.delta = null;
	
	this.initKeyboard();
	this.initMouse();
	this.initTouch();
	
	this.initGamepad(); //do this after initTouch!!!
	
	this.setEvent("game_input", this.step);
}

InputController.prototype.stopEvent = function(e) {
  if(e.stopPropagation)
    e.stopPropagation();
  if(e.preventDefault)
    e.preventDefault();
  };
  
 InputController.prototype.eventPerformDelta = function(e) {
  	e.delta = this.delta;
  	this.eventPerform(e);
  };
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Keyboard
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
InputController.prototype.initKeyboard = function() {
	this.keypress = [];
	this.key_timestamp = [];
	
	for(var i=0;i<256;i++) {
		this.keypress[i] = false;
		this.key_timestamp[i]=null;
	}
	
	this.keyboard = {
		shiftKey: false,
    	ctrlKey: false,
    	altKey: false, 
    	metaKey: false
		};
	
	this.initKeyboardListeners();
};


InputController.prototype.initKeyboardListeners = function() {
	var self = this;
	document.addEventListener('keydown',function(e) {self.onKeyDown.call(self,e);},false);
	document.addEventListener('keyup',function(e) {self.onKeyUp.call(self,e);},false);
};

InputController.prototype.onKeyDown = function(e) {
	var kc = this.getKeyCode(e);
	if (!this.keypress[kc]) 
		this.onKey(e,kc,"down");		
};
InputController.prototype.onKeyUp = function(e) {
	var kc = this.getKeyCode(e);
	this.onKey(e,kc,"up");
};

InputController.prototype.onKeyStep = function() {
	var size = this.keypress.length;
	for (var i=0; i<size; i++) {
		if (this.keypress[i]) {
			this.onKeyPress(i);
		}
	}
}

InputController.prototype.onKeyPress = function(kc) {
	var str = this.getKeyString(kc);
  	
  	//Anykey
  	var ev = new Event("key_press_anykey");
  	ev.key = str;
  	ev.timestamp = this.key_timestamp[kc];
  	ev.duration = Date.now() - this.key_timestamp[kc];
  	this.passKeyPressModifiers(ev);
  	this.eventPerformDelta(ev);
  	
  	//Specific Key
  	var ev = new Event("key_press_" + str);
  	ev.timestamp = this.key_timestamp[kc];
  	ev.duration = Date.now() - this.key_timestamp[kc];
  	this.passKeyPressModifiers(ev);
  	this.eventPerformDelta(ev);
};

InputController.prototype.onKey = function(e,kc,type) {
	switch (type) {
		case "down": this.keypress[kc] = true; 
					 this.key_timestamp[kc] = Date.now();
					 break;
		case "up": this.keypress[kc] = false; break;
	}
	
	var str = this.getKeyString(kc);
  	
  	//Anykey
  	var ev = new Event("key_" + type + "_anykey");
  	ev.key = str;
  	ev.timestamp = this.key_timestamp[kc];
  	ev.duration = Date.now() - this.key_timestamp[kc];
  	this.passKeyModifiers(e,ev);
  	this.eventPerformDelta(ev);
  	
  	//Specific Key
  	var ev = new Event("key_" + type + "_" + str);
  	ev.timestamp = this.key_timestamp[kc];
  	ev.duration = Date.now() - this.key_timestamp[kc];
  	this.passKeyModifiers(e,ev);
  	this.eventPerformDelta(ev);
  	
  	//set key modifiers (for press event)
  	switch (type) {
  		case "down": this.setKeyModifiers(str,true); break;
  		case "up": this.setKeyModifiers(str,false); break;
  	}
  	
  	
  	
  	//Gotta do the 'J' exception so shift-ctrl-j still brings up the debugger  :p
  	if (!( (String.fromCharCode(kc) == "J") | (this.g2.debug) ))  {
  		this.stopEvent(e);
  	}
};


InputController.prototype.numInRange = function(val,num1,num2) {
	return !( (val < num1) | (val > num2) );
	
};

InputController.prototype.setKeyModifiers = function(keystring,bool) {
	if (keystring == "shift")
  		this.keyboard.shiftKey = bool;
  	if (keystring == "ctrl")
  		this.keyboard.ctrlKey = bool;
  	if (keystring == "alt")
  		this.keyboard.altKey = bool;
  };
  
InputController.prototype.passKeyModifiers = function(browser_event, new_event) {
	var e2 = new_event;
	var e1 = browser_event;
	e2.shiftKey = e1.shiftKey;
    e2.ctrlKey = e1.ctrlKey;
    e2.altKey = e1.altKey; 
    e2.metaKey = e1.metaKey;
};

InputController.prototype.passKeyPressModifiers = function(e) {
	e.shiftKey = this.keyboard.shiftKey;
    e.ctrlKey = this.keyboard.ctrlKey;
    e.altKey = this.keyboard.altKey;
};


InputController.prototype.getKeyCode = function(e) {
	if (e.which == null)
     	return e.keyCode;    // old IE
  	else if (e.which != 0 && e.charCode != 0)
     	return e.which;	  // All others
  	else
    	return e.which; //special keys
};

InputController.prototype.getKeyIndex = function(key_string) {
	var ks = key_string.toLowerCase();
	
	if (ks.length == 1) {
		var c = ks.charCodeAt(0);
		
		if ( this.numInRange(c,97,122) ) {
			//Letters 
			return (c - 32);
		}
		
		if ( this.numInRange(c,48,57) ) {
			//Numbers 
			return c;
		}
		
	}
	
	//Function Keys (F1-F12)
	
	var t1 = ( ks.charAt(0) == "f" );
	var t2 = ( this.numInRange( ks.charCodeAt(1) ,48,57) );
	
	if (t1 && t2) {
			var ns = ks.slice(1);
			var n = parseInt(ns);
			if ( this.numInRange(n,1,12) ) {
				return (n + 111);
			}
		}
	
	//everything else	
	switch (ks) {
		//case : return "";
		case "space": return 32;
		case "enter": return 13;
		case "tab": return 9;
		case "esc": return 27;
		case "backspace": return 8;
		
		case "shift": return 16;
		case "ctrl": return 17;
		case "alt": return 18;
		case "capslock": return 20;
		case "numlock": return 144;
		
		case "left": return 37;
		case "up": return 38;
		case "right": return 39;
		case "down": return 40;
		
		case "insert": return 45;
		case "del": return 46;
		case "home": return 36;
		case "end": return 35;
		case "pageup": return 33;
		case "pagedown": return 34;
	}
	
	return null;
		
	
}


InputController.prototype.getKeyString = function(key) {
	//http://unixpapa.com/js/key.html
	//^^ Reference
	
	//Note:  doesn't include numpad, and a few other special keys
	
	if ( this.numInRange(key,65,90) ) {
		return String.fromCharCode(key + 32);
	}
	
	if ( this.numInRange(key,48,57) ) {
		return String.fromCharCode(key);
	}
	
	if ( this.numInRange(key,112,123) ) {
		return ("f" + (key - 111) );
	}
	
	switch (key) {
		//case : return "";
		
		case 32: return "space";
		case 13: return "enter";
		case 9: return "tab";
		case 27: return "esc";
		case 8: return "backspace";
		
		case 16: return "shift";
		case 17: return "ctrl";
		case 18: return "alt";
		case 20: return "capslock";
		case 144: return "numlock";
		
		case 37: return "left";
		case 38: return "up";
		case 39: return "right";
		case 40: return "down";
		
		case 45: return "insert";
		case 46: return "del";
		case 36: return "home";
		case 35: return "end";
		case 33: return "pageup";
		case 34: return "pagedown";
	}
	
	return null;
};

InputController.prototype.isKeyPressed = function(key_string) {
	var ki = this.getKeyIndex(key_string);
	if (ki == null) { return null; }
	else { return (this.keypress[ki]) };
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
InputController.prototype.getWinScaleMod = function() {
	var w = this.getWin();
	var s = w.getWinScale();
	return s;
};


InputController.prototype.createCursorEvent = function(str,cursor) {
		var e = new Event(str);
		e.camRay = this.g2.getCamRay(cursor);
    	e.x = cursor.x;
    	e.y = cursor.y;
    	e.wx = cursor.wx;
    	e.wy = cursor.wy;
    	e.device = cursor.device;
    	e.cursor = cursor;
    	return e;
	};

InputController.prototype.performCursorEvent = function(str,cursor) {
		var e = this.createCursorEvent(str,cursor);
		e.ev_name = e.name;
		e.name = "global_cursor_event";
		this.eventPerformDelta(e);
	
		var e = this.createCursorEvent(str,cursor);
    	this.eventPerformDelta(e);
    	return e;
	};
InputController.prototype.performCursorMoveEvent = function(str,cursor,delta) {
		var e = this.createCursorEvent(str,cursor);
		e.ev_name = e.name;
		e.name = "global_cursor_event";
		e.dx = delta.x;
		e.dy = delta.y;
		this.eventPerformDelta(e);
	
		var e = this.createCursorEvent(str,cursor);
		e.dx = delta.x;
		e.dy = delta.y;
    	this.eventPerformDelta(e);
    	return e;
	};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Mouse
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
InputController.prototype.initMouse = function() {
	this.mouse = {
				  x: 0,
				  y: 0,
				  wx: 0,
				  wy: 0,
				  id: 0,
				  device: "mouse",
				  active: false,
				  
				  down: false,
				  press: false,
				  up: false
				};
				 
	this.mouse.lmb = {
					 name: "lmb",
					 down: false,
					 press: false,
					 up: false,
					 
					 clicking: false,
					 clickobj: null,
					 downobj: null
					};
	this.mouse.rmb = {
					 name: "rmb",
					 down: false,
					 press: false,
					 up: false,
					 
					 clicking: false,
					 clickobj: null,
					 downobj: null
					};
	this.mouse.mmb = {
					 name: "mmb",
					 down: false,
					 press: false,
					 up: false,
					 
					 clicking: false,
					 clickobj: null,
					 downobj: null
					};
	this.mouse.wheel = { delta: 0 };
					
	this.initMouseListeners();
};

InputController.prototype.initMouseListeners = function() {
	
	var self = this;
	document.addEventListener('mousedown',function(e) {self.onMouseDown.call(self,e);},false);
	document.addEventListener('mouseup',function(e) {self.onMouseUp.call(self,e);},false);
	document.addEventListener('mousemove',function(e) {self.onMouseMove.call(self,e);},false);
	
	
	//add mouse wheel listeners
	
	//features - stop default event (doc scrolling)
	//			- normalize scroll speed between browsers - return speed as event property
	
	
	var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
	
	if (document.attachEvent) //if IE (and Opera depending on user setting)
    	{ document.attachEvent("on"+mousewheelevt, function(e) {self.onMouseWheel.call(self,e);}); }
	else if (document.addEventListener) //WC3 browsers
   		{ document.addEventListener(mousewheelevt, function(e) {self.onMouseWheel.call(self,e);}, false); }
	
	
	
	};
	
InputController.prototype.onMouseWheel = function(e)
{
  e = e ? e : window.event;
  var delta = e.detail ? e.detail * -1 : e.wheelDelta / 40;
  
  //^^ set this.mouse.wheel.delta to this
  this.mouse.wheel.delta = delta;

  //if > 0 ev wheeldown, <0 wheelup, both - wheelmove
  var ev = this.createCursorEvent("global_mw_move",this.mouse);
  ev.ev_name = e.name;
  ev.name = "global_cursor_event";
  ev.dw = delta;
  this.eventPerformDelta(ev);
  
  
  var ev = this.createCursorEvent("global_mw_move",this.mouse);
  ev.dw = delta;
  this.eventPerformDelta(ev);
  
  
  
  
  
  if (delta > 0) {
  	var ev = this.createCursorEvent("global_mw_down",this.mouse);
	ev.ev_name = e.name;
	ev.name = "global_cursor_event";
	ev.dw = delta;
	this.eventPerformDelta(ev);
  	
  	
  	var ev = this.createCursorEvent("global_mw_down",this.mouse);
  	ev.dw = delta;
  	this.eventPerformDelta(ev);
  }
  if (delta < 0) {
  	var ev = this.createCursorEvent("global_mw_up",this.mouse);
	ev.ev_name = e.name;
	ev.name = "global_cursor_event";
	ev.dw = delta;
	this.eventPerformDelta(ev);
  	
  	
  	var ev = this.createCursorEvent("global_mw_up",this.mouse);
  	ev.dw = delta;
  	this.eventPerformDelta(ev);
  }

  this.stopEvent(e);
}
	
InputController.prototype.clearButton = function(b) {
	b.down = false;
	b.up = false;
}

InputController.prototype.clearMouse = function(e) {
		this.mouse.wheel.delta=0;
		this.clearButton(this.mouse);
		this.clearButton(this.mouse.lmb);
		this.clearButton(this.mouse.rmb);
		this.clearButton(this.mouse.mmb);
	};
	
InputController.prototype.onMouseStep = function(e) {
		if (this.mouse.press)
			{
			this.performCursorEvent("global_mousepress",this.mouse);
    		this.performCursorEvent("global_cursorpress",this.mouse);
			}
		if (this.mouse.lmb.press)
			{ this.performCursorEvent("global_lmb_press",this.mouse); }
			
		if (this.mouse.rmb.press)
			{ this.performCursorEvent("global_rmb_press",this.mouse); }
			
		if (this.mouse.mmb.press)
			{ this.performCursorEvent("global_mmb_press",this.mouse); }
	};

InputController.prototype.onMouseDown = function(e) {
    	e.preventDefault();
    	var sc = this.getWinScaleMod();
    	this.mouse.active = true;
    	this.mouse.wx = e.pageX * sc;
    	this.mouse.wy = e.pageY * sc;
    	this.mouse.down = true;
    	this.mouse.press = true;
    	var w = this.g2.getWin();
    	var p = w.winPosToGridPos(e.pageX,e.pageY);
    	this.mouse.x = p.x;
    	this.mouse.y = p.y;
    	
    	switch (e.which) {
    		//note - pull these out to a single function...
    		case 1: 
    				this.mouse.lmb.down = true;
    				this.mouse.lmb.clicking = true;
    				this.mouse.lmb.press = true;
    				this.performCursorEvent("global_lmb_down",this.mouse);
    					break;
    		case 2: 
    				this.mouse.mmb.down = true;
    				this.mouse.mmb.clicking = true;
    				this.mouse.mmb.press = true;
    				this.performCursorEvent("global_mmb_down",this.mouse);
    					break;
    		case 3: 
    				this.mouse.rmb.down = true;
    				this.mouse.rmb.clicking = true;
    				this.mouse.rmb.press = true;
    				this.performCursorEvent("global_rmb_down",this.mouse);
    					break;
    		}
    	this.performCursorEvent("global_mousedown",this.mouse);
    	this.performCursorEvent("global_cursordown",this.mouse);
    	
	};
	
InputController.prototype.onMouseUp = function(e) {
    	e.preventDefault();
    	this.mouse.active = true;
    	var sc = this.getWinScaleMod();
    	this.mouse.wx = e.pageX * sc;
    	this.mouse.wy = e.pageY * sc;
    	this.mouse.up = true;
    	this.mouse.press = false;
    	var w = this.g2.getWin();
    	var p = w.winPosToGridPos(e.pageX,e.pageY);
    	this.mouse.x = p.x;
    	this.mouse.y = p.y;
    	
    	switch (e.which) {
    		case 1: 
    				this.mouse.lmb.up = true;
    				this.mouse.lmb.press = false;
    				this.performCursorEvent("global_lmb_up",this.mouse);
    					break;
    		case 2: 
    				this.mouse.mmb.up = true;
    				this.mouse.mmb.press = false;
    				this.performCursorEvent("global_mmb_up",this.mouse);
    					break;
    		case 3: 
    				this.mouse.rmb.up = true;
    				this.mouse.rmb.press = false;
    				this.performCursorEvent("global_rmb_up",this.mouse);
    					break;
    		}
    	this.performCursorEvent("global_mouseup",this.mouse);
    	this.performCursorEvent("global_cursorup",this.mouse);
	};
	
InputController.prototype.performDragEvent = function(button,cursor,delta) {
    		if (button.press) {
    			
    			if (cursor.device == "mouse") {
    				var name = "global_" + button.name + "drag";
    				var ev = new Event(name);
    				ev.dx = delta.x;
    				ev.dy = delta.y;
    				ev.cursor = cursor;
    				this.eventPerformDelta(ev);
    			}
    			
    			var ev = new Event("global_" + cursor.device + "drag");
    			ev.dx = delta.x;
    			ev.dy = delta.y;
    			ev.cursor = cursor;
    			this.eventPerformDelta(ev);
    			
    			var ev = new Event("global_cursordrag");
    			ev.dx = delta.x;
    			ev.dy = delta.y;
    			ev.cursor = cursor;
    			this.eventPerformDelta(ev);
    		}
    	}


InputController.prototype.onMouseMove = function(e) {
    	e.preventDefault();
    	this.mouse.active = true;
    	var sc = this.getWinScaleMod();
    	this.mouse.wx = e.pageX * sc;
    	this.mouse.wy = e.pageY * sc;
    	
    	var w = this.g2.getWin();
    	var p = w.winPosToGridPos(e.pageX,e.pageY);
    	
    	var d = {
    		x: p.x - this.mouse.x,
    		y: p.y - this.mouse.y,
    	}
    	
    	this.mouse.x = p.x;
    	this.mouse.y = p.y;
    	
    	this.performCursorMoveEvent("global_mousemove",this.mouse,d);
    	this.performCursorMoveEvent("global_cursormove",this.mouse,d);
    	this.performDragEvent(this.mouse.lmb,this.mouse,d);
    	this.performDragEvent(this.mouse.rmb,this.mouse,d);
    	this.performDragEvent(this.mouse.mmb,this.mouse,d);
    	
	};
		
		


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Touch
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
InputController.prototype.initTouch = function() {
	this.touchList = [];
	this.touch_enabled = 'createTouch' in document;				
	this.touch_active = false;
	if (this.touch_enabled) {
		this.initTouchListeners();
		}
};

InputController.prototype.getTouchEnabled = function() {
	return this.touch_enabled;
};

InputController.prototype.initTouchListeners = function() {
	
	var self = this;
	document.addEventListener('touchstart',function(e) {self.onTouchDown.call(self,e);},false);
	document.addEventListener('touchend',function(e) {self.onTouchUp.call(self,e);},false);
	document.addEventListener('touchmove',function(e) {self.onTouchMove.call(self,e);},false);
	
	};
	
InputController.prototype.clearTouch = function(e) {
		for (var i = 0; i< this.touchList.length; i++) {
						this.touchList[i].up = false;
						this.touchList[i].down = false;
    		}
	};

InputController.prototype.onTouchStep = function(e) {
		for (var i = 0; i< this.touchList.length; i++) {
						var t = this.touchList[i];
    					if (t.press) {
    						this.performCursorEvent("global_touchpress",t);
    						this.performCursorEvent("global_cursorpress",t);
    						}
    		}
	};
	
InputController.prototype.onTouchDown = function(e) {
    	e.preventDefault();
    	
    	for(var i = 0; i<e.changedTouches.length; i++){
			var te =e.changedTouches[i];
			var t = {
				  	wx: te.pageX,
				  	wy: te.pageY,
				  	id: te.identifier,
				  	device: "touch",
				  	active: true,
				  
				 	down: true,
				  	press: true,
				  	up: false,
				  	
				  	clicking: true,
					clickobj: null,
					downobj: null
					};
			var sc = this.getWinScaleMod();
			t.wx *=sc;
			t.wy *=sc;
			var w = this.g2.getWin();
    		var p = w.winPosToGridPos(te.pageX,te.pageY);
    		t.x = p.x;
    		t.y = p.y;
			
			this.touch_active = true;
			this.touchList.push(t);
			
			this.performCursorEvent("global_touchdown",t);
    		this.performCursorEvent("global_cursordown",t);
    		this.performCursorEvent("global_touchpress",t);
    		this.performCursorEvent("global_cursorpress",t);
			}
    	
    	
    	
	};
	
InputController.prototype.onTouchUp = function(e) {
    	e.preventDefault();
    	
    	for(var i = 0; i<e.changedTouches.length; i++){
			var te =e.changedTouches[i];
			
  			var inlist = false;
    	
    		var t = null; //this touch event
    		
    		//Check if te is in touchList, if so, update and remove
    		for (var j = 0; j< this.touchList.length; j++) {
    				if (this.touchList[j].id == te.identifier) {
    					var sc = this.getWinScaleMod();
    					this.touchList[j].wx = te.pageX * sc;
    					this.touchList[j].wy = te.pageY * sc;
    					this.touchList[j].down = false;
    					this.touchList[j].press = false;
    					this.touchList[j].up = true;
    					
    					var w = this.g2.getWin();
    					var p = w.winPosToGridPos(te.pageX,te.pageY);
    					this.touchList[j].x = p.x;
    					this.touchList[j].y = p.y;
    					
    					inlist = true;
    					t = this.touchList[j];
    					
    					this.touchList.splice(j,1);
    				}
    		}
    		
    		//If te isn't in touchList, create a new t;
    		if (!inlist) {
    			t = {
					  	wx: te.pageX,
				  		wy: te.pageY,
				  		id: te.identifier,
				  		device: "touch",
				  		active: true,
				 	 
				 		down: false,
				  		press: false,
				  		up: true
						};
				var sc = this.getWinScaleMod();
				t.wx *= sc;
				t.wy *= sc;
				var w = this.g2.getWin();
    			var p = w.winPosToGridPos(te.pageX,te.pageY);
    			t.x = p.x;
    			t.y = p.y;
				}
    		
    		this.touch_active = true;
    		this.performCursorEvent("global_touchup",t);
    		this.performCursorEvent("global_cursorup",t);
    	}
	};
	
InputController.prototype.onTouchMove = function(e) {
    	e.preventDefault();
    	
    	for(var i = 0; i<e.changedTouches.length; i++){
			var te =e.changedTouches[i];
    	
  			var size = this.touchList.length;
  			var inlist = false;
    	
    		var t = null; //this touch event
    		
    		//Check if te is in touchList, if so, update
    		for (var j = 0; j<size; j++) {
    				if (this.touchList[j].id == te.identifier) {
    					var sc = this.getWinScaleMod();
    					this.touchList[j].wx = te.pageX * sc;
    					this.touchList[j].wy = te.pageY * sc;
    					var w = this.g2.getWin();
    					var p = w.winPosToGridPos(te.pageX,te.pageY);
    					
    					
    					var d = {
    					x: p.x - this.touchList[j].x,
    					y: p.y - this.touchList[j].y,
    					};
    					
    					this.touchList[j].x = p.x;
    					this.touchList[j].y = p.y;
    					inlist = true;
    					t = this.touchList[j];
    					
    					this.performDragEvent(this.touchList[j],this.touchList[j],d);
    					
    				}
    		}
    		
    		//If te isn't in touchList, add it
    		if (!inlist) {
    			t = {
					  	wx: te.pageX,
				  		wy: te.pageY,
				  		id: te.identifier,
				  		device: "touch",
				  		active: true,
				 	 
				 		down: false,
				  		press: true,
				  		up: false
						};
						
				var d = {
    					x: 0,
    					y: 0,
    				};
				var sc = this.getWinScaleMod();
				t.wx *= sc;
				t.wy *= sc;
				var w = this.g2.getWin();
    			var p = w.winPosToGridPos(te.pageX,te.pageY);
    			t.x = p.x;
    			t.y = p.y;
			
				this.touchList.push(t);
				}
    		
    		this.touch_active = true;
    		this.performCursorMoveEvent("global_touchmove",t,d);
    		this.performCursorMoveEvent("global_cursormove",t,d);
    	}
	};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Gamepad
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//http://code.google.com/p/javascript-joystick/wiki/API
//http://www.bigredswitch.co.uk/toolbox/joystick/api.html


/////////////////////////////////////////////
//VG Button
/////////////////////////////////////////////

function VGButton(name,joyname) {
	this.name = name;
	this.joyname = joyname;
	initEvents(this);
}

VGButton.prototype = {
	down: false,
	up: false,
	press: false,
	up_timestamp: null,
	down_timestamp: null,
	active: false
};

VGButton.prototype.set = function(bool) {
	if (bool && !this.press) 
		{this.down = true;  this.down_timestamp = Date.now(); }
	if (!bool && this.press) 
		{this.up = true; this.up_timestamp = Date.now(); }
	if (bool != this.press)
		this.active = true;
	this.press = bool;
};

VGButton.prototype.poll = function(delta) {
	if (this.down) {
		var n = this.joyname + "_" + this.name + "_down";
		var ev = new Event(n);
		ev.delta = delta;
		ev.button = this;
		ev.timestamp = this.down_timestamp;
		ev.duration = 0;
		this.eventPerform(ev);
	}
	if (this.up) {
		var n = this.joyname + "_" + this.name + "_up";
		var ev = new Event(n);
		ev.delta = delta;
		ev.button = this;
		ev.timestamp = this.down_timestamp;
		ev.duration = Date.now() - this.down_timestamp;
		this.eventPerform(ev);
	}
	if (this.press && this.active) {
		var n = this.joyname + "_" + this.name + "_press";
		var ev = new Event(n);
		ev.delta = delta;
		ev.button = this;
		ev.timestamp = this.down_timestamp;
		ev.duration = Date.now() - this.down_timestamp;
		this.eventPerform(ev);
	}
	
	var state = {
				down: this.down,
				up: this.up,
				press: this.press,
				up_timestamp: this.up_timestamp,
				down_timestamp: this.down_timestamp,
				active: this.active,
				name: this.name
			};
	this.clear();
	return state;
};

VGButton.prototype.clear = function() {
	this.down = false;
	this.up = false;
};


/////////////////////////////////////////////
//VG Axis
/////////////////////////////////////////////

function VGAxis(name,joyname) {
	this.name = name;
	this.joyname = joyname;
	initEvents(this);
	this.initButtons();
}

VGAxis.prototype = {
	x: 0,
	y: 0,
	deltaPos: {
		x: 0,
		y: 0
	},
	moved: false,
	moveX: false,
	moveY: false,
	active: false,
	primary: false,
	analog_deadzone: 0.1,
	digital_deadzone: 0.2,
	left: null,
	right: null,
	up: null,
	down: null
}

VGAxis.prototype.initButtons = function() {
	if (this.primary)
		var n = "";
	else
		var n = this.name + "_";
	this.button_left = new VGButton(n + "left",this.joyname);
	this.button_right = new VGButton(n + "right",this.joyname);
	this.button_up = new VGButton(n + "up",this.joyname);
	this.button_down = new VGButton(n + "down",this.joyname);
	
	this.bind(this.button_left);
	this.bind(this.button_right);
	this.bind(this.button_up);
	this.bind(this.button_down);
}; 

VGAxis.prototype.setAnalogDeadzone = function(dz) {this.analog_deadzone = dz;};
VGAxis.prototype.setDigitalDeadzone = function(dz) {this.digital_deadzone = dz;};
VGAxis.prototype.setAsPrimary = function() {this.primary = true;};
VGAxis.prototype.isActive = function() {return this.active;};

VGAxis.prototype.setX = function(x) {
			if (x != this.x) {
				this.deltaPos.x = x - this.x;
				this.x = x;
				this.moved = true;
				this.moveX = true;
				this.active = true;
				
				var bl = false;
				var br = false;
				
				if (Math.abs(this.x) > this.digital_deadzone) {
					if (this.x < 0)
						bl = true;
					if (this.x > 0)
						br = true;
				}
				
				this.button_left.set(bl);
				this.button_right.set(br);
			}
};

VGAxis.prototype.setY = function(y) {
			if (y != this.y) {
				this.deltaPos.y = y - this.y;
				this.y = y;
				this.moved = true;
				this.moveY = true;
				this.active = true;
				
				var bu = false;
				var bd = false;
				
				if (Math.abs(this.y) > this.digital_deadzone) {
					if (this.y < 0)
						bu = true;
					if (this.y > 0)
						bd = true;
				}
				
				this.button_up.set(bu);
				this.button_down.set(bd);
				}
			};
			
VGAxis.prototype.setPos = function(x,y){ 
		this.setX(x); 
		this.setY(y); 
};

VGAxis.prototype.getX = function(){return this.x;};
VGAxis.prototype.getY = function(){return this.y;};	
			
VGAxis.prototype.getPos = function() {
	var p = {
		x: this.x,
		y: this.y
	};
	return p;
};
	
VGAxis.prototype.getDelta = function() {
	var d = {
		x: this.deltaPos.x,
		y: this.deltaPos.y
	};
	return d;
};			


VGAxis.prototype.poll = function(delta) {
		if (this.primary)
			var n = this.joyname + "_";
		else
			var n = this.joyname + "_" + this.name + "_";
		
		if (Math.abs(this.x) > this.analog_deadzone) {
			var ev = new Event(n + "moveX");
			ev.delta = delta;
			ev.x = this.x;
			ev.dx = this.deltaPos.x;
			ev.axis = this;
			this.eventPerform(ev);
		}
	
		if (Math.abs(this.y) > this.analog_deadzone) {
			var ev = new Event(n + "moveY");
			ev.delta = delta;
			ev.y = this.y;
			ev.dy = this.deltaPos.y;
			ev.axis = this;
			this.eventPerform(ev);
		}
	
		//Poll dpad (will auto generate events)
		this.left = this.button_left.poll(delta);
		this.right = this.button_right.poll(delta);
		this.up = this.button_up.poll(delta);
		this.down = this.button_down.poll(delta);
	
		this.moveX = false;
		this.moveY = false;
		this.moved = false;	
};

/////////////////////////////////////////////
//VGamepad
/////////////////////////////////////////////
function VGamepad(name) {
	initEvents(this);
	this.joyname = name;
	this.init();
}
VGamepad.prototype.init = function() {
	this.input = null;
	this.initOutput();
};

VGamepad.prototype.setMap = function(input) {this.input = input;};
VGamepad.prototype.unmap = function() {this.input = null;};

VGamepad.prototype.initButtonOutput = function(name) {
	this.button[name] = new VGButton(name,this.joyname);
	this.bind(this.button[name]);
};

VGamepad.prototype.getAxis = function(name) {
	return this.axis[name];
};

VGamepad.prototype.initAxisOutput = function(name,primary) {
	this.axis[name] = new VGAxis(name,this.joyname);
	if (primary)
		this.axis[name].setAsPrimary();
	this.bind(this.axis[name]);
};

VGamepad.prototype.initOutput = function() {
	this.axis = [];
	this.button = [];
	
	this.initAxisOutput("LAxis",true);
	this.initAxisOutput("RAxis",false);
	this.initAxisOutput("Pad",false);
	
	this.initButtonOutput("A");
	this.initButtonOutput("B");
	this.initButtonOutput("X");
	this.initButtonOutput("Y");
	
	this.initButtonOutput("L1");
	this.initButtonOutput("R1");
	this.initButtonOutput("L2");
	this.initButtonOutput("R2");
	
	this.initButtonOutput("Select");
	this.initButtonOutput("Start");
	this.initButtonOutput("L3");
	this.initButtonOutput("R3");
	
	this.initButtonOutput("C1");
	this.initButtonOutput("C2");
	this.initButtonOutput("C3");
	this.initButtonOutput("C4");
	
};

VGamepad.prototype.jStructToString = function(j) {
	var s = "";
	s+= "LA: " + Math.round(j.LAxis.x) + "," + Math.round(j.LAxis.y) + "; ";
	s+= "RA: " + Math.round(j.RAxis.x) + "," + Math.round(j.RAxis.y) + "; ";
	s+= "P: " + Math.round(j.Pad.x) + "," + Math.round(j.Pad.y) + "; ";
	
	var boolToDigit = function(bool) {
		if (bool) {return 1;}
		else {return 0;}
	};
	
	s+="B: ";
	s+=boolToDigit(j.a) + ",";
	s+=boolToDigit(j.b) + ",";
	s+=boolToDigit(j.x) + ",";
	s+=boolToDigit(j.y) + ",  ";
	
	s+=boolToDigit(j.l1) + ",";
	s+=boolToDigit(j.r1) + ",";
	s+=boolToDigit(j.l2) + ",";
	s+=boolToDigit(j.r2) + ",  ";
	
	s+=boolToDigit(j.select) + ",";
	s+=boolToDigit(j.start) + ",";
	s+=boolToDigit(j.l3) + ",";
	s+=boolToDigit(j.r3) + ",  ";
	
	s+=boolToDigit(j.c1) + ",";
	s+=boolToDigit(j.c2) + ",";
	s+=boolToDigit(j.c3) + ",";
	s+=boolToDigit(j.c4);
	
	return s;
};


VGamepad.prototype.map = function(input) {
	var j = input.poll();
	if (j==null) return false;
	
	this.axis["LAxis"].setPos(j.LAxis.x, j.LAxis.y);
	this.axis["RAxis"].setPos(j.RAxis.x, j.RAxis.y);
	this.axis["Pad"].setPos(j.Pad.x, j.Pad.y);
	
	this.button["A"].set(j.a);
	this.button["B"].set(j.b);
	this.button["X"].set(j.x);
	this.button["Y"].set(j.y);
	
	this.button["L1"].set(j.l1);
	this.button["R1"].set(j.r1);
	this.button["L2"].set(j.l2);
	this.button["R2"].set(j.r2);
	
	this.button["Select"].set(j.select);
	this.button["Start"].set(j.start);
	this.button["L3"].set(j.l3);
	this.button["R3"].set(j.r3);
	
	this.button["C1"].set(j.c1);
	this.button["C2"].set(j.c2);
	this.button["C3"].set(j.c3);
	this.button["C4"].set(j.c4);
	
	if (j.connect) {
		var ev = new Event(this.joyname + "_connect");
		this.eventPerform(ev);
	}
	
	if (j.disconnect) {
		var ev = new Event(this.joyname + "_disconnect");
		this.eventPerform(ev);
	}
	
	return true;
}

VGamepad.prototype.poll = function(delta) {
	this.axis["LAxis"].poll(delta);
	this.axis["RAxis"].poll(delta);
	this.axis["Pad"].poll(delta);
	
	this.button["A"].poll(delta);
	this.button["B"].poll(delta);
	this.button["X"].poll(delta);
	this.button["Y"].poll(delta);
	
	this.button["L1"].poll(delta);
	this.button["R1"].poll(delta);
	this.button["L2"].poll(delta);
	this.button["R2"].poll(delta);
	
	this.button["Select"].poll(delta);
	this.button["Start"].poll(delta);
	this.button["L3"].poll(delta);
	this.button["R3"].poll(delta);
	
	this.button["C1"].poll(delta);
	this.button["C2"].poll(delta);
	this.button["C3"].poll(delta);
	this.button["C4"].poll(delta);
};

VGamepad.prototype.update = function(delta) {
	if (this.input != null) {
		this.map(this.input);
	}
	this.poll(delta);
};

/////////////////////////////////////////////
//IC Gamepad
/////////////////////////////////////////////
InputController.prototype.checkJoyDevicesAndMap = function() {
	if (!this.touch_enabled) {
		if (this.javajoy.isConnected() )
			this.vg.setMap(this.javajoy);
		else
			this.vg.setMap(this.kbjoy);
		}
};


InputController.prototype.initGamepad = function() {
	
	//Make virtual gamepad
	this.vg = new VGamepad("vg");
	
	//Go down the list, map the first that works
	this.touchjoy = new MultiTouchVG(this,this.touch_enabled);
	this.javajoy = new JSJoystick();
	this.kbjoy = new KeyboardVG(this);
	
	this.javajoy_enabled = this.javajoy.isWorking();
	
	//need test to see if joystick is working....  need to do this each step...
	//check if plugin is installed (jsjoy)
	if (this.touch_enabled)
		this.vg.setMap(this.touchjoy);
	else
		{
		//Not a touch device
		this.checkJoyDevicesAndMap();
		}
	this.bind(this.vg);
};

InputController.prototype.onGamepadStep = function(){
	this.checkJoyDevicesAndMap();
	this.vg.update(this.delta);
};

InputController.prototype.vg_addButton = function(name,x,y,w,h) {
	return this.touchjoy.addButton(name,x,y,w,h);
};
InputController.prototype.vg_addAxis = function(name,x,y,inner_radius, outer_radius,type) {
	return this.touchjoy.addAxis(name,x,y,inner_radius, outer_radius,type);
};

InputController.prototype.vg_getAxis = function(name) {
	return this.vg.getAxis(name);
};

InputController.prototype.vg_clearGUI = function() {
	this.touchjoy.clearGUI();
};

//////////////////////////////////////////////////////////////////////////////////////////
//Joystick APIs
//////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////
//Parent :)
/////////////////////////////////////////////
//include api parent here (don't need one yet...)

/////////////////////////////////////////////
//KeyboardVG
/////////////////////////////////////////////
function KeyboardVG(input) {
	initEvents(this);
	this.bind( input );
	this.input = input;
	
	this.working = true;
	this.connected = this.working;
	this.productName = "Keyboard";
	
	this.vgk = this.getDefaultVGK();
}

KeyboardVG.prototype.initVGK = function() {
//Key Map data structure
/*
	var vgk = {
		
		LAxis: {
			up:,
			down:,
			left:,
			right:,
		},
		
		RAxis: {
			up:,
			down:,
			left:,
			right:,
		},
		
		Pad: {
			up:,
			down:,
			left:,
			right:,
		},
		
		a:,
		b:,
		x:,
		y:,
		
		l1:,
		r1:,
		l2:,
		r2:,
		
		select:,
		start:,
		l3:,
		r3:,
		
		c1:,
		c2:,
		c3:,
		c4:,
	};
	*/

};

KeyboardVG.prototype.assignButton = function(button_name, key) {
	var bn = button_name.toLowerCase();
	switch (bn) {
		case "a": this.vgk.a = key;
		case "b": this.vgk.b = key;
		case "x": this.vgk.x = key;
		case "y": this.vgk.y = key;
		
		case "l1": this.vgk.l1 = key;
		case "r1": this.vgk.r1 = key;
		case "l2": this.vgk.l2 = key;
		case "r2": this.vgk.r2 = key;
		
		case "select": this.vgk.select = key;
		case "start": this.vgk.start = key;
		case "l3": this.vgk.l3 = key;
		case "r3": this.vgk.r3 = key;
		
		case "c1": this.vgk.c1 = key;
		case "c2": this.vgk.c2 = key;
		case "c3": this.vgk.c3 = key;
		case "c4": this.vgk.c4 = key;
	}
};

KeyboardVG.prototype.assignAxis = function(axis_name,up,down,left,right) {
	var an = button_name.toLowerCase();
	switch (an) {
		case "laxis": this.vgk.LAxis = { up:up, down:down, left:left, right:right }; break;
		case "raxis": this.vgk.RAxis = { up:up, down:down, left:left, right:right }; break;
		case "pad": this.vgk.Pad = { up:up, down:down, left:left, right:right }; break;
	}
};

KeyboardVG.prototype.getDefaultVGK = function() {
//Key Map data structure
	var vgk = {
		
		LAxis: {
			up: "up",
			down: "down",
			left: "left",
			right: "right",
		},
		
		RAxis: {
			up:"w",
			down:"s",
			left:"a",
			right:"d",
		},
		
		Pad: {
			up:"8",
			down:"2",
			left:"4",
			right:"6",
		},
		
		a:"z",
		b:"x",
		x:"c",
		y:"v",
		
		l1:"ctrl",
		r1:"alt",
		l2:"q",
		r2:"e",
		
		select:"space",
		start:"return",
		l3:"7",
		r3:"9",
		
		c1:null,
		c2:null,
		c3:null,
		c4:null,
	};
	return vgk;

};


KeyboardVG.prototype.getNullVGK = function() {
//Key Map data structure
	var vgk = {
		
		LAxis: {
			up: null,
			down: null,
			left: null,
			right: null,
		},
		
		RAxis: {
			up: null,
			down: null,
			left: null,
			right: null,
		},
		
		Pad: {
			up: null,
			down: null,
			left: null,
			right: null,
		},
		
		a: null,
		b: null,
		x: null,
		y: null,
		
		l1: null,
		r1: null,
		l2: null,
		r2: null,
		
		select: null,
		start: null,
		l3: null,
		r3: null,
		
		c1: null,
		c2: null,
		c3: null,
		c4: null,
	};
	return vgk;

};

KeyboardVG.prototype.keyPressed = function(key_string) {
	if (key_string == null) {return false;}
	else {return this.input.isKeyPressed(key_string);}
}

KeyboardVG.prototype.getAxisPos = function(neg,pos) {
		var v = 0;
		if ( this.keyPressed(neg) ) v-=1;
		if ( this.keyPressed(pos) ) v+=1;
		
		if ( (neg == null) || (pos == null) ) return 0;
		
		return v;
	};

KeyboardVG.prototype.poll = function() {
	//returns 'j' data structure
	var j = {
		LAxis: {
			x: this.getAxisPos(this.vgk.LAxis.left, this.vgk.LAxis.right),
			y: this.getAxisPos(this.vgk.LAxis.up, this.vgk.LAxis.down),
			},
		RAxis: {
			x: this.getAxisPos(this.vgk.RAxis.left, this.vgk.RAxis.right),
			y: this.getAxisPos(this.vgk.RAxis.up, this.vgk.RAxis.down),
			},
		Pad: {
			x: this.getAxisPos(this.vgk.Pad.left, this.vgk.Pad.right),
			y: this.getAxisPos(this.vgk.Pad.up, this.vgk.Pad.down),
			},
	};
	
	j.a = this.keyPressed(this.vgk.a);
	j.b = this.keyPressed(this.vgk.b);
	j.x = this.keyPressed(this.vgk.x);
	j.y = this.keyPressed(this.vgk.y);
		
	j.l1 = this.keyPressed(this.vgk.l1);
	j.r1 = this.keyPressed(this.vgk.r1);
	j.l2 = this.keyPressed(this.vgk.l2);
	j.r2 = this.keyPressed(this.vgk.r2);
	
	j.select = this.keyPressed(this.vgk.select);
	j.start =  this.keyPressed(this.vgk.start);
	j.l3 =     this.keyPressed(this.vgk.l3);
	j.r3 =     this.keyPressed(this.vgk.r3);
	
	j.c1 = this.keyPressed(this.vgk.c1);
	j.c2 = this.keyPressed(this.vgk.c2);
	j.c3 = this.keyPressed(this.vgk.c3);
	j.c4 = this.keyPressed(this.vgk.c4);
	
	return j;
};

/////////////////////////////////////////////
//MultiTouchVG (requires a multitouch device)
/////////////////////////////////////////////
function MultiTouchVG_Input(x,y,w,h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	
	this.inner_radius = null;
	this.outer_radius = null;
	
	this.bbox = {
		x: 0,
		y: 0,
		w: this.w,
		h: this.h
	};
	
	this.press = false;
	this.axis = {x:0,y:0};
	
	this.initPeg();
}


MultiTouchVG_Input.prototype.getX = function() {return this.axis.x;};
MultiTouchVG_Input.prototype.getY = function() {return this.axis.y;};

MultiTouchVG_Input.prototype.initPeg = function() {
		this.peg = {
					x: null,
					y: null,
					o: null
		};
};

MultiTouchVG_Input.prototype.setPeg = function(pegX,pegY,pegObj) {
		this.peg.x = pegX;
		this.peg.y = pegY;
		this.peg.o = pegObj;
};

MultiTouchVG_Input.prototype.getPegBbox = function() {
		if (this.peg.o != null) {
			var b = {
				x: 0,
				y: 0,
				width: this.peg.o.bbox.width,
				height: this.peg.o.bbox.height
			};
			
			return b;
		}
		else
			return null;
};

MultiTouchVG_Input.prototype.getBbox = function() {
	var b = {x: this.x + this.bbox.x, y: this.y + this.bbox.y, w: this.w, h: this.h };
	
	if ( this.isPegged() ) {
			var pb = this.getPegBbox();
			
			switch (this.peg.x) {
				case "left": b.x+= pb.x; break;
				case "center": b.x+= pb.x + pb.hw; break;
				case "right": b.x+= pb.x + pb.width; break;// - b.w; break;
			}
			switch (this.peg.y) {
				case "top": b.y+= pb.y; break;
				case "middle": b.y+=  pb.y + pb.hh ; break;
				case "bottom": b.y+= pb.y + pb.height; break; // - b.h; break;
			}
		}
	return b;
}

	
MultiTouchVG_Input.prototype.isPegged = function() {
		return (this.peg.o != null);
};
/////////////////////////
function MultiTouchVG_Axis(x,y,inner_radius,outer_radius,type) {
	this.x = x;
	this.y = y;
	this.w = outer_radius * 2;
	this.h = this.w;
	
	this.type = type;
	
	this.inner_radius = inner_radius;
	this.outer_radius = outer_radius;
	this.radius_ratio = inner_radius / outer_radius;
	this.rrsq = this.radius_ratio * this.radius_ratio;
	
	this.bbox = {
		x: - outer_radius,
		y: - outer_radius,
		w: this.w,
		h: this.h
	};
	
	this.press = false;
	this.axis = {x:0,y:0};
	
	this.initPeg();
}

MultiTouchVG_Axis.prototype = new MultiTouchVG_Input();
MultiTouchVG_Axis.prototype.constructor=MultiTouchVG_Axis;

MultiTouchVG_Axis.prototype.getRadiusRatio = function() {
	return this.radius_ratio;
};
MultiTouchVG_Axis.prototype.getRadiusRatioSq = function() {
	return this.rrsq;
};
MultiTouchVG_Axis.prototype.getType = function() {
	return this.type;
};
/////////////////////////

function MultiTouchVG(input,touch_enabled) {
	initEvents(this);
	this.bind( input );
	this.working = touch_enabled;
	this.connected = this.working;
	this.productName = "Touchscreen";
	
	this.clearGUI();
	this.setEvent("global_touchdown",this.onTouchDown);
	this.setEvent("global_touchmove",this.onTouchDown);
	this.setEvent("global_touchup",this.onTouchUp);
}

MultiTouchVG.prototype.isWorking = function() { return this.working; };
MultiTouchVG.prototype.getWin = function() { return this.g2.getWin(); };

MultiTouchVG.prototype.getAxisCode = function(name) {
	switch (name) {
		case "LAxis": return 0; break;
		case "RAxis": return 1; break;
		case "Pad": return 2; break;
		
		default: alert('MultiTouchVG:  Not a valid axis name!!!');
				return null;
	}
	
};
		

MultiTouchVG.prototype.getButtonCode = function(name) {
	switch (name) {
		case "A": return 0; break;
		case "B": return 1; break;
		case "X": return 2; break;
		case "Y": return 3; break;
		
		case "L1": return 4; break;
		case "R1": return 5; break;
		case "L2": return 6; break;
		case "R2": return 7; break;
		
		case "Select": return 8; break;
		case "Start": return 9; break;
		case "L3": return 10; break;
		case "R3": return 11; break;
		
		case "C1": return 12; break;
		case "C2": return 13; break;
		case "C3": return 14; break;
		case "C4": return 15; break;
		
		default: alert('MultiTouchVG:  Not a valid button name!!!');
				return null;
	}
	
};

MultiTouchVG.prototype.pointRectIntersection = function(px,py,rx,ry,rw,rh) {
	return !( (px > rx + rw) | 
            	(px < rx) | 
            	(py > ry + rh) |
            	(py < ry) );	
};

MultiTouchVG.prototype.addButton = function(name,x,y,w,h) {
	var b = this.getButtonCode(name);
	this.vbutton[b] = new MultiTouchVG_Input(x,y,w,h);
	return this.vbutton[b];
};

MultiTouchVG.prototype.addAxis = function(name,x,y,inner_radius,outer_radius,type) {
	var b = this.getAxisCode(name);
	this.vaxis[b] = new MultiTouchVG_Axis(x,y,inner_radius,outer_radius,type);
	return this.vaxis[b];
};

MultiTouchVG.prototype.clearGUI = function() {
	this.vbutton = [];
	this.vaxis = [];
	
	for (var i=0;i<16;i++)
		this.vbutton[i]=null;
	for (var i=0;i<3;i++)
		this.vaxis[i]=null;
};

MultiTouchVG.prototype.checkTouchButton = function(id,tx,ty,touching) {
	if (this.vbutton[id] != null) {
		var r = this.vbutton[id].getBbox();
		if ( this.pointRectIntersection(tx,ty,r.x,r.y,r.w,r.h) ) {
			this.vbutton[id].press = touching;	
		}
	}
};

MultiTouchVG.prototype.calcAxis_fourdir = function(x,y) {
				
				var val = 0;
				var p = {x: 0, y: 0};
				if (x>-y) val+=1;
				if (x>y) val+=2;
	
				switch (val) {
					case 0: var p = {x:-1, y:0 }; break;
					case 1: var p = {x:0, y:1 }; break;
					case 2: var p = {x:0, y:-1 }; break;
					case 3: var p = {x:1, y:0 }; break;
					default: var p = {x:0, y:0 }; break;
				}
				return p;
};

MultiTouchVG.prototype.calcAxis_eightdir = function(x,y) {
				
				var val = 0;
				var aa = 0.42;
				var ab = 1 / 0.42;
				var p = {x: 0, y: 0};
				if (x>y*aa) val+=1;
				if (x>y*ab) val+=2;
				if (x>-y*ab) val+=4;
				if (x>-y*aa) val+=8;
				
	
				switch (val) {
					case 0: var p = {x:-1, y:0 }; break;
					case 2: var p = {x:-1, y:-1 }; break;
					case 3: var p = {x:0, y:-1 }; break;
					case 11: var p = {x:1, y:-1 }; break;
					case 15: var p = {x:1, y:0 }; break;
					case 13: var p = {x:1, y:1 }; break;
					case 12: var p = {x:0, y:1 }; break;
					case 4: var p = {x:-1, y:1 }; break;
					default: var p = {x:0, y:0 }; break;
				}
				return p;
};

MultiTouchVG.prototype.calcAxis_analog = function(x,y,axis) {
				var sm = (x*x) + (y*y);
				var p = {x: x, y:y};
				
				if ( sm > axis.getRadiusRatioSq() ) {
					var m = Math.sqrt(sm);
					var rr = axis.getRadiusRatio();
					p.x/= m;
					p.y/= m;
				}
				
				else {
					var m = 1 / ( axis.getRadiusRatio() );
					p.x*=m;
					p.y*=m;
				}
				return p;
};

MultiTouchVG.prototype.calcAxis = function(x,y,axis) {
	switch (axis.getType() ) {
		case "4dir": return this.calcAxis_fourdir(x,y); break;
		case "8dir": return this.calcAxis_eightdir(x,y); break;
		//case "analog": 
		default: return this.calcAxis_analog(x,y,axis); break;
	}
};


MultiTouchVG.prototype.checkTouchAxis = function(id,tx,ty,touching) {
	if (this.vaxis[id] != null) {
		var r = this.vaxis[id].getBbox();
		var hw = (r.w/2)+r.x;
		var hh = (r.h/2)+r.y; 
		
		if ( this.pointRectIntersection(tx,ty,r.x,r.y,r.w,r.h) 
			&& touching	) {
				var p = {
				x : (((tx-r.x) / r.w)*2)-1,
				y : (((ty-r.y) / r.h)*2)-1,
				};
				
				p = this.calcAxis(p.x,p.y,this.vaxis[id]);
				
				this.vaxis[id].axis.x = p.x;
				this.vaxis[id].axis.y = p.y;
			}	
		else {
				this.vaxis[id].axis.x = 0;
				this.vaxis[id].axis.y = 0;
			}
	}
};

MultiTouchVG.prototype.checkTouch = function(tx,ty,touching) {
	for (var i=0;i<3;i++) {
		this.checkTouchAxis(i,tx,ty,touching);
	}
	for (var i=0;i<16;i++) {
		this.checkTouchButton(i,tx,ty,touching);
	}
};

MultiTouchVG.prototype.onTouchDown = function(e) {
	this.checkTouch(e.wx,e.wy,true);
};
MultiTouchVG.prototype.onTouchUp = function(e) {
	this.checkTouch(e.wx,e.wy,false);
};

MultiTouchVG.prototype.getButtons = function() {
	var b = [];
	for (var i=0;i<16;i++) {
		if (this.vbutton[i] == null)
			b[i] = false;
		else 
			b[i] = this.vbutton[i].press;
		}
		
	return b;
};



MultiTouchVG.prototype.poll = function() {
	
	if (!this.working) return null;
	
	//returns 'j' data structure
	var j = {
		LAxis: {x:0,y:0},
		RAxis: {x:0,y:0},
		Pad: {x:0,y:0},
	};
	
	j.connect = false;
	j.disconnect = false;
	j.connected = this.connected;
	
	if (this.vaxis[0] != null) {
		j.LAxis.x = this.vaxis[0].getX();
		j.LAxis.y = this.vaxis[0].getY();
	}
	
	if (this.vaxis[1] != null) {
		j.RAxis.x = this.vaxis[1].getX();
		j.RAxis.y = this.vaxis[1].getY();
	}
	
	if (this.vaxis[2] != null) {
		j.Pad.x = this.vaxis[2].getX();
		j.Pad.y = this.vaxis[2].getY();
	}
	
	var b = this.getButtons();
	
	j.a = b[0];
	j.b = b[1];
	j.x = b[2];
	j.y = b[3];
		
	j.l1 = b[4];
	j.r1 = b[5];
	j.l2 = b[6];
	j.r2 = b[7];
	
	j.select = b[8];
	j.start =  b[9];
	j.l3 =     b[10];
	j.r3 =     b[11];
	
	j.c1 = b[12];
	j.c2 = b[13];
	j.c3 = b[14];
	j.c4 = b[15];
	
	return j;
};
	
/////////////////////////////////////////////
//JSJoystick (javascript-joystick plugin)
/////////////////////////////////////////////
function JSJoystick() {
	this.working = true;
	this.connected = false;
	this.productName = null;
	
	this.ctl = JSJoystick.createPlugin();
	
	if (this.ctl == null) {
		this.working = false;
	}
	else {
		this.ctl.setAutoPoll(false);
	
		if ( this.ctl.isConnected() )
			this.productName = this.ctl.getProductName();
		}
	this.axis_active = [];
	this.axis_active[0]=false;
	this.axis_active[1]=false;
	this.axis_active[2]=false;
}

JSJoystick.CENTER = 32768;
JSJoystick.prototype.isWorking = function() {return this.working};
JSJoystick.prototype.isConnected = function() {
	if (this.working)
		{return this.ctl.isConnected();}
	else
		{return false;}
	};

JSJoystick.prototype.getButtonData = function() {
	var data = this.ctl.buttons;
	var b = [];
	
	var size = 16;
	for (var i = 0; i<size; i++) {
		var p = Math.pow(2,i);
		var bit = Math.floor((data % (p*2) ) / p);
		b[i] = (bit == 1) ? true : false;
	}
	
	return b;
	
};

JSJoystick.prototype.poll = function() {
	
	if (!this.working) return null;
	
	//poll the device
	this.ctl.poll();
	
	//returns 'j' data structure
	var c = this.ctl.isConnected();
	var j = {
		LAxis: {x:0,y:0},
		RAxis: {x:0,y:0},
		Pad: {x:0,y:0},
	};
	
	j.connect = (c && !this.connected);
	j.disconnect = (!c && this.connected);
	j.connected = c;
	this.connected = c;
	
	if (j.connect) {
		this.productName = this.ctl.getProductName();
	};
	
	j.LAxis.x = this.getX();
	j.LAxis.y = this.getY();
	if (!this.axis_active[0]) j.LAxis = {x:0, y:0};
	
	j.RAxis.x = this.getZ();
	j.RAxis.y = this.getR();
	if (!this.axis_active[1]) j.RAxis = {x:0, y:0};
	
	
	j.Pad.x = this.getU();
	j.Pad.y = this.getV();
	if (!this.axis_active[2]) j.Pad = {x:0, y:0};
	
	
	var b = this.getButtonData();
	
	j.a = b[0];
	j.b = b[1];
	j.x = b[2];
	j.y = b[3];
		
	j.l1 = b[4];
	j.r1 = b[5];
	j.l2 = b[6];
	j.r2 = b[7];
	
	j.select = b[8];
	j.start =  b[9];
	j.l3 =     b[10];
	j.r3 =     b[11];
	
	j.c1 = b[12];
	j.c2 = b[13];
	j.c3 = b[14];
	j.c4 = b[15];
	
	return j;
};

JSJoystick.prototype.getX = function() {
	var p;
	p = (this.ctl) ? this.ctl.x : JSJoystick.CENTER;
	if (this.ctl.x != 0) this.axis_active[0]=true;
	p-=JSJoystick.CENTER;
	p/=JSJoystick.CENTER;
	return p;
};
JSJoystick.prototype.getY = function() {
	var p;
	p = (this.ctl) ? this.ctl.y : JSJoystick.CENTER;
	if (this.ctl.y != 0) this.axis_active[0]=true;
	p-=JSJoystick.CENTER;
	p/=JSJoystick.CENTER;
	return p;
};
JSJoystick.prototype.getZ = function() {
	var p;
	p = (this.ctl) ? this.ctl.z : JSJoystick.CENTER;
	if (this.ctl.z != 0) this.axis_active[1]=true;
	p-=JSJoystick.CENTER;
	p/=JSJoystick.CENTER;
	return p;
};
JSJoystick.prototype.getR = function() {
	var p;
	p = (this.ctl) ? this.ctl.r : JSJoystick.CENTER;
	if (this.ctl.r != 0) this.axis_active[1]=true;
	p-=JSJoystick.CENTER;
	p/=JSJoystick.CENTER;
	return p;
};
JSJoystick.prototype.getU = function() {
	var p;
	p = (this.ctl) ? this.ctl.u : JSJoystick.CENTER;
	if (this.ctl.u != 0) this.axis_active[2]=true;
	p-=JSJoystick.CENTER;
	p/=JSJoystick.CENTER;
	return p;
};
JSJoystick.prototype.getV = function() {
	var p;
	p = (this.ctl) ? this.ctl.v : JSJoystick.CENTER;
	if (this.ctl.v != 0) this.axis_active[2]=true;
	p-=JSJoystick.CENTER;
	p/=JSJoystick.CENTER;
	return p;
};

//************** Static Methods **************/
/**
 * Creates the browser dependent plug-in or ActiveX counterpart.
 */
JSJoystick.createPlugin = function() {
	var ctrlIE = document.createElement("object");
	if (ctrlIE) {
		try {
			ctrlIE.classid = "CLSID:3AE9ED90-4B59-47A0-873B-7B71554B3C3E";
			if (ctrlIE.setDevice(0) != null) {
				/*
				 * IE always returns a Boolean for this call, so any non-null
				 * value is success at this point.
				 */
				return ctrlIE;
			}
		} catch (e) {
			/*
			 * Either we're not using IE or the plug-in is not installed,
			 * so ignore any exceptions and try the next method.
			 */
		}
	}
	
	var ctrlFF = document.createElement("embed");
	if (ctrlFF) {
		if (navigator && navigator.plugins) {
			/*
			 * In order that users without the plug-in don't get a pop-up
			 * alerting them to missing plug-ins each, we search for the
			 * potential existence first.
			 */
			var found = false;
			for (var n = 0; n < navigator.plugins.length; n++) {
				if (navigator.plugins[n].name.indexOf("Joystick") != -1) {
					found = true;
					break;
				}
			}
			if (!found) {
				return null;
			}
		}
		try {
			ctrlFF.type = "application/x-vnd.numfum-joystick";
			ctrlFF.width  = 0;
			ctrlFF.height = 0;
			/*
			 * Before accessing the plug-in's script interface it needs to be
			 * added to the page. If the 'setDevice' call fails, the plug-in
			 * is assumed to either not be installed or not working in this
			 * browser, in which case it is removed in the catch.
			 */
			document.body.appendChild(ctrlFF, document.body);
			if (ctrlFF.setDevice(0) != null) {
				/*
				 * As with the code for IE, any non-null value is a
				 * success.
				 */
				return ctrlFF;
			}
		} catch (e) {
			/*
			 * It's assumed at this point the plug-in is not installed.
			 */
			this.working = false;
		}
		/*
		 * If we've reached here something has gone wrong after adding the
		 * plug-in to the page, so we remove it.
		 */
		document.body.removeChild(ctrlFF);
	}
	
	return null;
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
InputController.prototype.clear = function() {
		this.clearMouse();
		
		if (this.touch_enabled) {
			this.clearTouch();
			}
};

InputController.prototype.step = function(e) {
		this.delta = e.delta;
		this.onKeyStep();
		this.onMouseStep();
		
		if (this.touch_enabled) {
			this.onTouchStep();
			} 
			
		this.onGamepadStep(); //gamepad dependent on touch events
			
		this.clear();
};

InputController.prototype.getWin = function() {
	return this.g2.getWin();
};

