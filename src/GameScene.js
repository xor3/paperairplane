var TAG_PLANE = 12345;

var audioEngine = cc.AudioEngine.getInstance();

var Plane = cc.Sprite.extend({
    _radius:12, // collide radius
    _rotation:0,
    _updateSpeed:0,
    onEnter:function(){
	this._super();
	this.initWithFile(s_plane);
	this.setAnchorPoint(cc.p(0.5,0.5));
    },
    update:function(dt){

	// var RotateAction  = cc.RotateTo.create(0.01,this._rotation);
	// var moveAction = cc.MoveBy.create(60, cc.p((90-this._rotation)/15,0));
	// var actions = cc.Sequence.create(RotateAction,moveAction);
	// cc.log("rotation", this._rotation);
	// this.runAction(actions); // duration must be smaller than dt??
	this.setPositionX(this.getPositionX() + (90-this._rotation)/5);
    },
    
    getUpdateSpeed:function(){
	if (this._rotation < 90) {
	    this._updateSpeed = this._rotation / 5 ;
	}
	if (this._rotation > 91) {
	    this._updateSpeed = (180 -  this._rotation) / 5 ;
	}	

	return this._updateSpeed;
    },
    addRotation:function(d){
	this._rotation += d;
	this.setRotation(this._rotation);
    },

    // 检测边缘碰撞
    checkHitEdge: function () {
	var hit = false;
        var winSize = cc.Director.getInstance().getWinSize();
	var curPosX = this.getPositionX();
	if (curPosX > (winSize.width - this._radius - 22) ||  curPosX < this._radius) {
	    hit = true;
	}
	return hit;
    },

    collide: function (gameObject) {
	var oContentsize = gameObject.getContentSize();
	var oPos = gameObject.getPosition();
	var curPos = this.getPosition();
		       
	return this.ComputeCollision(oContentsize.width, oContentsize.height, 
				     this._radius, Math.abs(oPos.x - curPos.x), Math.abs(oPos.y -curPos.y));
    },
    // http://www.cnblogs.com/kuikui/archive/2012/07/01/2572288.html
    ComputeCollision:function(w, h, r, rx, ry) {
            var dx = Math.min(rx, w * 0.5);
            var dx1 = Math.max(dx, -w * 0.5);
            var dy = Math.min(ry, h * 0.5);
            var dy1 = Math.max(dy, -h * 0.5);
            return (dx1 - rx) * (dx1 - rx) + (dy1 - ry) * (dy1 - ry) <= r * r;
    }

});


var GameCloud = cc.Sprite.extend({
    onEnter:function(){
	this._super();
	this.initWithFile(s_gameCloud);
	// var moveUp = cc.MoveBy.create(1,cc.p(0,10));
	// this.runAction(cc.RepeatForever.create(moveUp));
    },
    checkIfOutOfScreen:function(){
	var curPosY = this.getPositionY();
	if(curPosY >= g_winSize.height){
	}
    }
});

var GameBoard = cc.Sprite.extend({
    _checked:false,
    ctor:function(){
	this._super();
	this.initWithFile(s_gameBoard);
	// this.setContentSize(g_winSize);
	// var moveUp = cc.MoveBy.create(1, cc.p(0,20));
	// this.runAction(cc.RepeatForever.create(moveUp));

	// cc.log("contentsize & winsize", [this.getContentSize(), g_winSize]);
    },
    resetBoard:function(){
	this._checked = false;
    },
    setChecked:function(){
	this._checked = true;
    },
    isChecked:function(){
	return this._checked;
    }
});

var GameWall = cc.Sprite.extend({
    ctor:function(){
	this._super();
	this.initWithFile(s_gameWall);
//	this.setAnchorPoint(cc.p(0,0));
	// this.setContentSize(cc.size(g_winSize.width, g_winSize.height);
	this.setPosition(cc.p(0,0));
	this.setScaleX(1.1);
	this.setContentSize(g_winSize);
    }
});
var GameLayer = cc.Layer.extend({
    _wall1:null,
    _wall2:null,
    _cloud:null, //TODO
    _plane:null,
    _boards:[],
    _score:0,
    _bestScore:0,
    _labelScore:null,

    ctor:function(){
	this._super();
        if( 'keyboard' in sys.capabilities ) {
	    cc.log("keyboard ok");
           this.setKeyboardEnabled(true);
        } else {
            cc.log("KEYBOARD Not supported");
        }
	////////////////////////////////////////////////////////////////////////////////
	// walls
	this._wall1 = new GameWall();
	this.addChild(this._wall1,-1);
	this._wall1.setAnchorPoint(cc.p(0,0));
	this._wall1.setPosition(cc.p(0,0));

	this._wall2 = new GameWall(); //cc.Sprite.create(s_gameWall);//new GameWall();
	this.addChild(this._wall2,-2);
	this._wall2.setAnchorPoint(cc.p(0,1));
	this._wall2.setPosition(cc.p(0,0));

	////////////////////////////////////////////////////////////////////////////////
	// cloud
	this._cloud = new GameCloud();
	this._cloud.setPosition(cc.p(g_winSize.width/2, 0));
	
	this.addChild(this._cloud,1);

	////////////////////////////////////////////////////////////////////////////////
	// boards
	for(var i = 0;i <3;i++){
	    this._boards[i] = new GameBoard();
	    this._boards[i].setPosition(cc.p((Math.random() * g_winSize.width),
					     (i-2) * g_winSize.height/ 2));
	    this.addChild(this._boards[i],2);
	}

	////////////////////////////////////////////////////////////////////////////////
	// * plane
	this._plane = new Plane();
	this._plane.setPosition(cc.p(g_winSize.width/2, g_winSize.height - 90));
	this._plane.collide(this._cloud);
	this.addChild(this._plane,3, TAG_PLANE);

	this._labelScore = cc.LabelTTF.create("Score:0",  'Arial', 32, cc.size(320,32), cc.TEXT_ALIGNMENT_LEFT);
	this._labelScore.setColor(new cc.Color3B(0,0,255));
	this.addChild(this._labelScore,7);
	this._labelScore.setAnchorPoint(cc.p(0,0));
	this._labelScore.setPosition(cc.p(20, g_winSize.height - 32));

	////////////////////////////////////////////////////////////////////////////////
	// music
	audioEngine.preloadMusic(s_sound_bg);
	audioEngine.preloadEffect(s_sound_over);
	this.scheduleOnce(function(){audioEngine.playMusic(s_sound_bg,true);});

	// update
	this.schedule(this.update,0.1);
	// this.scheduleUpdate();

    },
    update:function(dt){
	// cc.log("dt",dt);
	// var plane = this.getChildByTag(TAG_PLANE); // for test purpose

	this._plane.update(dt);

	// update background
	var updateSpeed = this._plane.getUpdateSpeed();
	// cc.log("updateSpeed", updateSpeed);
	this._cloud.setPositionY(this._cloud.getPositionY() + updateSpeed);
	this._wall1.setPositionY(this._wall1.getPositionY() + updateSpeed);
	this._wall2.setPositionY(this._wall2.getPositionY() + updateSpeed);
	
	if (this._wall1.getPositionY() >= g_winSize.height) {
	    this._wall1.setPositionY(0);
	}
	if (this._wall2.getPositionY() >= g_winSize.height) {
	    this._wall2.setPositionY(0);
	}

	////////////////////////////////////////////////////////////////////////////////
	// collision check
	if(this._plane.checkHitEdge()){
	    this.onGameOver();
	}
	
	// update score and check collision with board
	for(var i = 0;i <this._boards.length;i++){
	    var bd = this._boards[i];
	    var curPosY = bd.getPositionY();
	    bd.setPositionY(curPosY + updateSpeed + 10);

	    if (!bd.isChecked()) {
		if(curPosY > g_winSize.height -95){
		    this._score += 200;
		    bd.setChecked();
		}
	    }
	    
	    if (curPosY > g_winSize.height ) {
		bd.setPositionY(- g_winSize.height / 2);
		bd.resetBoard();
		var randomX = Math.floor(Math.random()* g_winSize.width);
		bd.setPositionX(randomX);
	    }
	    if(this._plane.collide(bd)){
		this.onGameOver();
	    }
	}

	////////////////////////////////////////////////////////////////////////////////
	// score
	this._labelScore.setString("Score: " + this._score);
    },

    onGameOver:function(){
	// explosion effect
	this._plane.setVisible(false);
	var p = cc.Sprite.create(s_planeExplode);
	this.addChild(p,20);
	p.setPosition(this._plane.getPosition());

	// stop actions and music
	this.stopAllActions();
	this.unscheduleAllCallbacks();
	audioEngine.stopMusic();
	audioEngine.playEffect(s_sound_over);
	
	//update bestscore
	if(this._score > this._bestScore){
	    this._bestScore = this._score;
	}
	
	// Home or Replay
	cc.MenuItemFont.setFontName("Arial");
	var menuMain = cc.MenuItemFont.create("Main Menu", this.onGotoMainMenu, this);
	var menuAgain =  cc.MenuItemFont.create("Replay..", this.onReplay, this);
	menuMain.setColor(new cc.Color3B(0,0,255));
	menuAgain.setColor(new cc.Color3B(0,0,255));
	var menu = cc.Menu.create(menuMain,menuAgain);
	menu.alignItemsVertically();
	this.addChild(menu, 10);
	menu.setPosition(g_winSize.width/2, g_winSize.height/2);
	
    },

    onReplay:function(){
	// cc.log("sur", audioEngine.isFormatSupported("mp3")); // OMG

	audioEngine.playMusic(s_sound_bg,true);
	// cc.log("volume",audioEngine.getMusicVolume() );
	
	var s = new GameScene();
	g_director.replaceScene(s);

    },

    onGotoMainMenu:function(){
	var director = cc.Director.getInstance();
	director.popScene();
    },
    onKeyUp:function(key) {
	// cc.log("Key up:" + key);
    },
    onKeyDown:function(key) {
        // cc.log("Key down:" + key);
	// TODO:cc.Key.left? check API
	if(key == 37){
	    if (this._plane._rotation < 180) {
		this._plane.addRotation(18);
	    }
	}
	// right key
	if(key == 39){
	    if (this._plane._rotation > 0) {
		this._plane.addRotation(-18);
	    }
	}
    },
    onTouchBegan:function () {
        return true;
    }

});

var GameScene = cc.Scene.extend({
    ctor: function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer);
    }
});
