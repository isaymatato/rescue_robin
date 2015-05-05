function Event(name) {
	this.name = name;
}

function initEvents(obj) {
	obj.ev_bindList = [];  //Watchers
	obj.ev_hList = []; //My handler list
	
	obj.bind = function(o) {
		//check if bindlist already
		var inlist = false;
		var size = o.ev_bindList.length;
		
		bind_iloop: for (var i = 0; i < size; i++) {
			if (o.ev_bindList[i] == this) {
				inlist = true;
				break bind_iloop;
			}
		}
		
		//if not, add
		if (!inlist) { 
			o.ev_bindList.push(this); 
			}
	}
	
	obj.unbind = function(o) {
		//parse bindlist and remove
		for (var i = 0; i < o.ev_bindList.length; i++) {
			if (o.ev_bindList[i] == this) {
				o.ev_bindList.splice(i,1);
			}
		}
	}
	
	obj.setEvent = function(evname, func) {
		
		//Note:  This allows for multiple function handlers of a single event
		//No current way to remove handler from a function
		
		var h = {
			name: evname,
			f: func,
			obj: this
		};
		this.ev_hList.push(h);
	}
	
	
	obj.eventPerform = function(ev_obj) {
		
		var addHandlers = function(slist,tlist,evname) {
			var size = slist.length;
		
			for (var i=0; i < size; i++) {
				 if (slist[i].name == evname) {
				 	tlist.push(slist[i]);
				 	}
				}
			
		};
		
		var parseBindList = function(blist,hlist,evname,loopcount){
			
			var size = blist.length;
			
			for (var i=0; i < size; i++) {
				addHandlers(blist[i].ev_hList, hlist, evname);
				parseBindList(blist[i].ev_bindList, hlist, evname, loopcount-1);
				}
		}
		
		var h_list = []; //create temp handler list
		
		//Fill handler list w handlers from bindlist & my own handlers
		addHandlers(this.ev_hList, h_list, ev_obj.name);
		parseBindList(this.ev_bindList,h_list,ev_obj.name,100);
		
		//parse handler list and call functions
		var size = h_list.length;
		for (var i=0; i < size; i++) {
			//with handler obj, do handler function(e)
			h_list[i].f.call(h_list[i].obj,ev_obj); 
			}
		
		};
	
	
	};

