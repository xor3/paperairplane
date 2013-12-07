/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
var TAG_BG_BUILDING = 1234;
var Buildings = cc.Sprite.extend({
    _contentSize:null,
    _velocity:null,
    ctor: function(){
	this._super();
	this.initWithFile(s_bgBuildings);
	this._velocity = cc.p(100,0);
	this.setScale(0.5);
	this.setAnchorPoint(cc.p(0,0));
    },
    //     onEnter:function(){
    
    // //	var action = cc.MoveTo();
    // //	this.runAction(cc.MoveTo.create(5, cc.p(0,0)));
    //     },

    update:function(dt){
	var ws = cc.Director.getInstance().getWinSize();
	var curPosX = this.getPositionX();
	// this.setPosition(cc.pAdd(this.getPosition,cc.pMult(this._velocity,dt)));
	this.setPositionX(curPosX - 100 * dt);
	if(curPosX <= - this._contentSize.width){
	    this.setPositionX(ws.width);
	}
    }
});

var Boy = cc.Sprite.extend({
    ctor:function(){
	this._super();
	this.initWithFile(s_boy2);
	var animation = cc.Animation.create();
	animation.setDelayPerUnit(0.1);
	animation.addSpriteFrameWithFile(s_boy1);
	animation.addSpriteFrameWithFile(s_boy2);
	animation.addSpriteFrameWithFile(s_boy3);
	animation.addSpriteFrameWithFile(s_boy4);
	animation.addSpriteFrameWithFile(s_boy5);

	var action = cc.Animate.create(animation);
	this.runAction(cc.RepeatForever.create(action));
    }

});
var BgCLoud = cc.Sprite.extend({
    ctor:function(){
	this._super();
	this.initWithFile(s_bgCloud);
	this.setAnchorPoint(cc.p(0,0));

	this.runAction(cc.RepeatForever.create(
	    cc.Sequence.create(cc.MoveBy.create(1,cc.p(-50,0)),
			       cc.CallFunc.create(this.adjustPostion,this))));
    },
    adjustPostion:function(){
	if(this.getPositionX() <= - g_winSize.width){
	    this.setPositionX(g_winSize.width);
	}
    }
});

var BaseLayer = cc.Layer.extend({
    _bgSky:null,
    _bgBuildings1:null,
    _bgPlaneLabel:null,
    ctor: function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        var size = cc.Director.getInstance().getWinSize();
        //var bg = cc.Sprite.create(s_Bluesky);
	this._bgSky = cc.LayerColor.create(cc.c4b(0,191,255,255),size.width,size.height);
	this._bgSky.setAnchorPoint(cc.p(0,0));

        this._bgSky.setPosition(cc.p(0.0));
        this.addChild(this._bgSky, 1);

	this._bgPlaneLabel = cc.Sprite.create(s_bgPlaneLabel);
	this.addChild(this._bgPlaneLabel,2);
	this._bgPlaneLabel.setScale(0.5);
	this._bgPlaneLabel.setPosition(size.width / 2, size.height * 2 / 3);

	var acMove = cc.MoveTo.create(10,cc.p(-50,50));
	var acDelay = cc.DelayTime.create(1);
	var action = cc.Sequence.create(acDelay,acMove);

	this._bgBuildings1 = new Buildings();
//	this._bgBuildings1.setAnchorPoint(cc.p(0,0));
	this.addChild(this._bgBuildings1,3);

	this._bgBuildings1.setPosition(cc.p(size.width-100,60));
	// this._bgBuildings1.runAction(action);
	
	var bgBuildings2 = new Buildings();
	this.addChild(bgBuildings2,4, TAG_BG_BUILDING);
	bgBuildings2.setPosition(cc.p(200, 60));

	var bgCloud1 = new BgCLoud();
	this.addChild(bgCloud1,2);
	// bgCloud1.setAnchorPoint(cc.p(0,0));
	bgCloud1.setPosition(cc.p(0,30));

	var bgCloud2 = new BgCLoud();
	this.addChild(bgCloud2,2);
	// bgCloud2.setAnchorPoint(cc.p(0,0));
	bgCloud2.setPosition(cc.p(g_winSize.width,30));	

	var bgEarch = cc.Sprite.create(s_bgEarch);
	this.addChild(bgEarch,5);
	bgEarch.setAnchorPoint(cc.p(0,0));
	bgEarch.setScale(1.3);
	bgEarch.setPosition(cc.p(0,0));

        this.setTouchEnabled(true);
        this.setTouchPriority(cc.MENU_HANDLER_PRIORITY + 1);
        this.setTouchMode(cc.TOUCH_ONE_BY_ONE);

	////////////////////
	//update
	this.schedule(this.update, 0);
    },

    // onTouchBegan:function () {
    //     return true;
    // },

    update:function(dt){
	this._bgBuildings1.update(dt);
	var bgBuildings2 = this.getChildByTag(TAG_BG_BUILDING);
	bgBuildings2.update(dt);
	
    }
});

var HelpLayer = BaseLayer.extend({
    ctor:function(){
	this._super();

	var lineOnePos = cc.p(50,g_winSize.height - 100);
	var lineTwoPos = cc.p(50,g_winSize.height - 160);
	var lineThreePos = cc.p(100, g_winSize.height - 300);

	cc.MenuItemFont.setFontName("Arial");
	var menuMain = cc.MenuItemFont.create("Main Menu", this.onGotoMainMenu, this);
	menuMain.setColor(new cc.Color3B(255,0,0));
	var menu = cc.Menu.create(menuMain);
	this.addChild(menu, 10);
	menu.setPosition(cc.p(g_winSize.width/2, g_winSize.height/3));

	var tag1 = cc.Sprite.create(s_helpTag1);
	this.addChild(tag1, 30);
	tag1.setAnchorPoint(cc.p(0,0));
	tag1.setPosition(lineOnePos);
	
	
	var arrows = cc.Sprite.create(s_helpKeyArrows);
	this.addChild(arrows,30);
	arrows.setAnchorPoint(cc.p(0,0));
	arrows.setPosition(cc.pAdd(lineOnePos, cc.p(60,0)));
	
	var plane = cc.Sprite.create(s_plane);
	this.addChild(plane,30);
	plane.setAnchorPoint(cc.p(0,0));
	plane.setPosition(cc.pAdd(lineOnePos, cc.p(180,0)));

	var tip1 = cc.Sprite.create(s_helpTip1);
	this.addChild(tip1,30);
	tip1.setAnchorPoint(cc.p(0,0));
	tip1.setPosition(cc.pAdd(lineOnePos, cc.p(250,-30)));

	var tag2 = cc.Sprite.create(s_helpTag2);
	this.addChild(tag2, 30);
	tag2.setAnchorPoint(cc.p(0,0));
	tag2.setPosition(lineTwoPos);

	var gameBoard = cc.Sprite.create(s_gameBoard);
	this.addChild(gameBoard, 30);
	gameBoard.setAnchorPoint(cc.p(0,0));
	gameBoard.setPosition(cc.pAdd(lineTwoPos, cc.p(60,0)));

	// var tag2 = cc.Sprite.create(s_helpTag2);
	// this.addChild(tag2, 30);
	// tag2.setAnchorPoint(cc.p(0,0));
	// tag2.setPosition(lineTwoPos);


	var tip2 = cc.Sprite.create(s_helpTip2);
	this.addChild(tip2, 30);
	tip2.setAnchorPoint(cc.p(0,0));
	tip2.setPosition(lineThreePos);

	var boy = new Boy();
	this.addChild(boy,31);
	boy.setPosition(cc.p(g_winSize.width - 80, 150));
	boy.setScale(0.6);
    },
    onGotoMainMenu:function(){
	var director = cc.Director.getInstance();
	director.popScene();
    }
});

var MainLayer = BaseLayer.extend({
    ctor:function(){
	this._super();
	
        // Image Item
        // var menuStart = cc.MenuItemImage.create(s_btnStart, s_btnStart, this.onStartGame, this);

	cc.MenuItemFont.setFontName("Arial");
	var menuStart = cc.MenuItemFont.create("Start Game", this.onStartGame, this);
	var menuHelp = cc.MenuItemFont.create("Help", this.onHelpGame,this);

	var menu = cc.Menu.create(menuStart,menuHelp);
	menu.alignItemsVertically();
	this.addChild(menu, 10);
	menu.setPosition(g_winSize.width/2, g_winSize.height/2);

	var boy = new Boy();
	this.addChild(boy,31);
	boy.setPosition(cc.p(100, 150));
	boy.setScale(0.6);

    },
    onStartGame:function(sender){
	var director = cc.Director.getInstance();
	var s = new GameScene();
	// director.replaceScene(s);
	// director.pushScene(cc.TransitionSlideInT.create(1, s));
	director.pushScene(s);
    },
    onHelpGame:function(){
	var director = cc.Director.getInstance();
	var s = cc.Scene.create();
	s.addChild(new HelpLayer());
	director.pushScene(s);
    }
});

var MyScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new MainLayer();
        this.addChild(layer);
    }
});

