Main.prototype.loadres = function()  {
	//create seperate imglist for loadingscreen, load first
	//this.loading.imglist = this.createImgList();
	this.imglist = this.createImgList();
	this.initImg();
	this.loadSpAnim();
	this.loadAudio();
	}

Main.prototype.initImg = function() {
};
  	
Main.prototype.loadSpAnim = function() {
  		//load SpriteAnims
  		this.sp = {};
  		this.sp.tp = [];
  		var framesPerRow = 8;
  		var img = "images/tpSheet96x48px_8x4t.png";
  		
  		for (var i=0;i<5;i++) {
  			var off = i * 4;
  			this.sp.tp[i]={};
  			this.sp.tp[i].body = this.createSpriteAnim(this.imglist,img,1,framesPerRow,96,48,off,0,0);
  			this.sp.tp[i].body.setOrigin(48,48);
  			this.sp.tp[i].eyes = this.createSpriteAnim(this.imglist,img,3,framesPerRow,96,48,off+1,0,0);
  			this.sp.tp[i].eyes.setOrigin(48,0);
  		}
  		
  		this.sp.n = [];
  		for (var i=0;i<3;i++) {
  			var off = (i * 4)+20;
  			this.sp.n[i]={};
  			this.sp.n[i].body = this.createSpriteAnim(this.imglist,img,1,framesPerRow,96,48,off,0,0);
  			this.sp.n[i].body.setOrigin(48,48);
  			this.sp.n[i].eyes = this.createSpriteAnim(this.imglist,img,3,framesPerRow,96,48,off+1,0,0);
  			this.sp.n[i].eyes.setOrigin(48,0);
  		}
  		
  		this.sp.lWing = this.createSpriteAnim(this.imglist,"images/tpLWing24px_4t.png",4,4,24,24,0,0,0);
		this.sp.lWing.setSpeed(16);
		
		
		this.sp.bg = this.createSpriteAnim(this.imglist,"images/cavebg_paint.png",1,1,1366,728,0,0,0);
		this.sp.bg.centerOrigin();
		
		this.sp.av = {};
		
		this.sp.av.grad = this.createSpriteAnim(this.imglist,"images/gradColors_128.png",8,4,128,128,0,0,0);
		this.sp.av.grad.setOrigin(64,128);
		
		this.sp.av.bodFront = [];
		for (var i=0;i<3;i++) {
			this.sp.av.bodFront[i] = this.createSpriteAnim(this.imglist,"images/mainCharMap_256.png",1,4,64,80,i,0,128);
			this.sp.av.bodFront[i].setOrigin(32,86);
		}
		
		this.sp.av.handLeft = [];
		for (var i=0;i<3;i++) {
			this.sp.av.handLeft[i] = this.createSpriteAnim(this.imglist,"images/mainCharMap_256.png",1,8,32,32,i+8,0,0);
			this.sp.av.handLeft[i].setOrigin(28,18);
		}
		this.sp.av.handRight = [];
		for (var i=0;i<3;i++) {
			this.sp.av.handRight[i] = this.createSpriteAnim(this.imglist,"images/mainCharMap_256.png",1,8,32,32,i+8+3,0,0);
			this.sp.av.handRight[i].setOrigin(4,18);
		}
		this.sp.av.hairFront = [];
		for (var i=0;i<3;i++) {
			this.sp.av.hairFront[i] = this.createSpriteAnim(this.imglist,"images/mainCharMap_256.png",1,8,32,32,i+8+18,0,0);
			this.sp.av.hairFront[i].setOrigin(16,91);
		}
		this.sp.av.hairSide = [];
		for (var i=0;i<3;i++) {
			this.sp.av.hairSide[i] = this.createSpriteAnim(this.imglist,"images/mainCharMap_256.png",1,8,32,32,i+8+21,0,0);
			this.sp.av.hairSide[i].setOrigin(16,91);
		}
		
		this.sp.av.mouthFront = this.createSpriteAnim(this.imglist,"images/mainCharMap_256.png",1,2,32,16,0,0,0);
		this.sp.av.mouthFront.setOrigin(16,23);
		
		this.sp.av.footFront = [];
		this.sp.av.footFront[0] = this.createSpriteAnim(this.imglist,"images/mainCharMap_256.png",1,2,32,16,1,0,0);
		this.sp.av.footFront[0].setOrigin(38,16);
		this.sp.av.footFront[1] = this.createSpriteAnim(this.imglist,"images/mainCharMap_256.png",1,2,32,16,3,0,0);
		this.sp.av.footFront[1].setOrigin(-4,16);
			
		this.sp.av.eyesFront = this.createSpriteAnim(this.imglist,"images/mainCharMap_256.png",3,4,64,32,1,0,0);
		this.sp.av.eyesFront.setOrigin(32,52);
		//this.createSpriteAnim(r2d_imglist , filename , # of frames, frames per row,
		//frame width , frame height , frame offset,
		//pixel offset x, pixel offset y) 
};

Main.prototype.loadAudio = function() {
}
  	
