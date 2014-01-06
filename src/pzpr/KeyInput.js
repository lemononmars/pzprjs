// KeyInput.js v3.4.0

//---------------------------------------------------------------------------
// ★KeyEventクラス キーボード入力に関する情報の保持とイベント処理を扱う
//---------------------------------------------------------------------------
// パズル共通 キーボード入力部
// KeyEventクラスを定義
pzpr.createPuzzleClass('KeyEvent',
{
	initialize : function(){
		this.cursor = this.owner.cursor;

		this.enableKey = true;		// キー入力は有効か

		this.keyreset();
	},

	enablemake : false,
	enableplay : false,
	keyup_event : false,	/* keyupイベントでもパズル個別のキーイベント関数を呼び出す */

	// const値
	KEYUP : 'up',
	KEYDN : 'down',
	KEYLT : 'left',
	KEYRT : 'right',

	//---------------------------------------------------------------------------
	// kc.keyreset()     キーボード入力に関する情報を初期化する
	// kc.isenablemode() 現在のモードでキー入力が有効か判定する
	//---------------------------------------------------------------------------
	keyreset : function(){
		this.isCTRL  = false;
		this.isMETA  = false;	// MacのCommandキーなど
		this.isALT   = false;	// ALTはメニュー用なので基本的に使わない
		this.isSHIFT = false;
		this.isZ = false;
		this.isX = false;
		this.isY = false;

		this.keydown = false;
		this.keyup   = false;

		this.ca = '';
		this.event = null;

		this.prev = null;
	},
	isenablemode : function(){
		return ((this.owner.editmode&&this.enablemake)||(this.owner.playmode&&this.enableplay));
	},

	//---------------------------------------------------------------------------
	// kc.e_keydown()  キーを押した際のイベント共通処理
	// kc.e_keyup()    キーを離した際のイベント共通処理
	// kc.e_keypress() キー入力した際のイベント共通処理(-キー用)
	//---------------------------------------------------------------------------
	// この3つのキーイベントはwindowから呼び出される(kcをbindしている)
	e_keydown : function(e){
		if(!this.enableKey){ return;}
		
		this.event = e;
		var c = this.getchar(e);
		if(c){ this.keyevent(c,0);}
	},
	e_keyup : function(e){
		if(!this.enableKey){ return;}
		
		this.event = e;
		var c = this.getchar(e);
		if(c){ this.keyevent(c,1);}
	},
	e_keypress : function(e){
		if(!this.enableKey){ return;}
		
		this.event = e;
		var c = this.getcharp(e);
		if(c){ this.keyevent(c,0);}
	},

	//---------------------------------------------------------------------------
	// kc.checkmodifiers()  Shift, Ctrl, Alt, Metaキーをチェックする
	// kc.checkbutton()     Z, X, Yキーの押下状況をチェックする
	//---------------------------------------------------------------------------
	checkmodifiers : function(e){
		if(this.isSHIFT ^ e.shiftKey){ this.isSHIFT = e.shiftKey;}
		if(this.isCTRL  ^ e.ctrlKey) { this.isCTRL  = e.ctrlKey; }
		if(this.isMETA  ^ e.metaKey) { this.isMETA  = e.metaKey; }
		if(this.isALT   ^ e.altKey)  { this.isALT   = e.altKey;  }
	},
	checkbutton : function(c){
		if(this.keydown){
			if(c==='z' && !this.isZ){ this.isZ=true;}
			if(c==='x' && !this.isX){ this.isX=true;}
			if(c==='y' && !this.isY){ this.isY=true;}
		}
		else{
			if(c==='z' && this.isZ){ this.isZ=false;}
			if(c==='x' && this.isX){ this.isX=false;}
			if(c==='y' && this.isY){ this.isY=false;}
		}
	},

	//---------------------------------------------------------------------------
	// kc.getchar()  入力されたキーを表す文字列を返す
	// kc.getcharp() 入力されたキーを表す文字列を返す(keypressの時)
	//---------------------------------------------------------------------------
	// 48～57は0～9キー、65～90はa～z、96～105はテンキー、112～123はF1～F12キー
	getchar : function(e){
		this.checkmodifiers(e);

		if     (e.keyCode==38){ return this.KEYUP;}
		else if(e.keyCode==40){ return this.KEYDN;}
		else if(e.keyCode==37){ return this.KEYLT;}
		else if(e.keyCode==39){ return this.KEYRT;}

		var keycode = (!!e.keyCode ? e.keyCode: e.charCode);
		if     ( 48<=keycode && keycode<= 57){ return (keycode-48).toString(36);}
		else if( 65<=keycode && keycode<= 90){ return (keycode-55).toString(36);} //アルファベット
		else if( 96<=keycode && keycode<=105){ return (keycode-96).toString(36);} //テンキー対応
		else if(112<=keycode && keycode<=123){ return 'F'+(keycode - 111).toString(10);} /* 112～123はF1～F12キー */
		else if(keycode==32 || keycode==46)  { return ' ';} // 32はスペースキー 46はdelキー
		else if(keycode==8)                  { return 'BS';}

		else if(e.shiftKey){ return 'shift';}

		return '';
	},
	// (keypressのみ)45は-(マイナス)
	getcharp : function(e){
		this.checkmodifiers(e);

		if((!!e.keyCode ? e.keyCode: e.charCode)==45){ return '-';}
		return '';
	},

	//---------------------------------------------------------------------------
	// kc.keyevent()  キーイベント処理
	// kc.stopEvent() カーソル移動時などに、ウィンドウがスクロールしないようにする
	//---------------------------------------------------------------------------
	keyevent : function(c, step){
		this.keydown = (step===0);
		this.keyup   = (step===1);

		this.owner.opemgr.newOperation(!!this.keydown);

		this.ca = c;
		this.checkbutton(c);

		if(this.keydown && !this.isZ){ this.owner.board.errclear();}

		if(!this.owner.execListener('key',c)){ return;}
		if(!this.isenablemode()){ return;}
		if(this.keydown && this.moveTarget(c)){ return;}
		if(this.keydown || (this.keyup && this.keyup_event)){ this.keyinput(c);}	/* 各パズルのルーチンへ */
	},
	stopEvent : function(){
		pzpr.util.preventDefault(this.event);
		this.keyreset();
	},

	//---------------------------------------------------------------------------
	// kc.keyinput() キーを押した/離した際の各パズルごとのイベント処理。
	//               各パズルのファイルでオーバーライドされる。
	//---------------------------------------------------------------------------
	// オーバーライド用
	keyinput : function(c){
		this.key_inputqnum(c); /* デフォルトはCell数字入力 */
	},

	//---------------------------------------------------------------------------
	// kc.moveTarget()  キーボードからの入力対象を矢印キーで動かす
	// kc.moveTCell()   Cellのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTCross()  Crossのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTBorder() Borderのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTC()      上記3つの関数の共通処理
	//---------------------------------------------------------------------------
	moveTarget  : function(ca){ return this.moveTCell(ca);},
	moveTCell   : function(ca){ return this.moveTC(ca,2);},
	moveTCross  : function(ca){ return this.moveTC(ca,2);},
	moveTBorder : function(ca){ return this.moveTC(ca,1);},
	moveTC : function(ca,mv){
		var tcp = this.cursor.getTCP(), dir = this.owner.board.BDIR;
		switch(ca){
			case this.KEYUP: if(tcp.by-mv>=this.cursor.miny){ dir = k.UP;} break;
			case this.KEYDN: if(tcp.by+mv<=this.cursor.maxy){ dir = k.DN;} break;
			case this.KEYLT: if(tcp.bx-mv>=this.cursor.minx){ dir = k.LT;} break;
			case this.KEYRT: if(tcp.bx+mv<=this.cursor.maxx){ dir = k.RT;} break;
			default: return false;
		}

		this.cursor.movedir_cursor(dir,mv);

		tcp.draw();
		this.cursor.getTCP().draw();
		this.stopEvent();	/* カーソルを移動させない */

		return true;
	},

	//---------------------------------------------------------------------------
	// kc.key_inputcross() 上限maxまでの数字をCrossの問題データをして入力する(keydown時)
	//---------------------------------------------------------------------------
	key_inputcross : function(ca){
		var cross = this.cursor.getTXC();
		var max = cross.nummaxfunc(), val=-1;

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca), cur = cross.getQnum();
			if(cur<=0 || cur*10+num>max){ cur=0;}
			val = cur*10+num;
			if(val>max){ return;}
		}
		else if(ca==='-'){ cross.setQnum(cross.getQnum()!==-2 ? -2 : -1);}
		else if(ca===' '){ cross.setQnum(-1);}
		else{ return;}

		cross.setQnum(val);
		cross.draw();
	},
	//---------------------------------------------------------------------------
	// kc.key_inputqnum() 上限maxまでの数字をCellの問題データをして入力する(keydown時)
	//---------------------------------------------------------------------------
	key_inputqnum : function(ca){
		var cell = this.cursor.getTCC(), cell0=cell, bd=this.owner.board;
		if(this.owner.editmode && bd.rooms.hastop){
			cell0 = cell = bd.rooms.getTopOfRoomByCell(cell);
		}
		else if(bd.linfo.moveline && this.getConfig('dispmove')){
			if(cell.isDestination()){ cell = cell.base;}
			else if(cell.lcnt()>0){ return;}
		}

		if(this.key_inputqnum_main(cell,ca)){
			this.prev = cell;
			if(bd.linfo.moveline && this.getConfig('dispmove') && cell.noNum()){
				bd.linfo.eraseLineByCell(cell);		/* 丸数字がなくなったら付属する線も消去する */
			}
			cell0.draw();
		}
	},
	key_inputqnum_main : function(cell,ca){
		var max = cell.nummaxfunc(), min = cell.numminfunc(), val=-1;

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca), cur = cell.getNum();
			if(cur<=0 || cur*10+num>max || this.prev!==cell){ cur=0;}
			val = cur*10+num;
			if(val>max || (min>0 && val===0)){ return false;}
		}
		else if(ca==='-') { val = ((this.owner.editmode&&!cell.disInputHatena)?-2:-1);}
		else if(ca===' ') { val = -1;}
		else if(ca==='s1'){ val = -2;}
		else if(ca==='s2'){ val = -3;}
		else{ return false;}

		cell.setNum(val);
		return true;
	},

	//---------------------------------------------------------------------------
	// kc.key_inputdirec()  四方向の矢印などを設定する
	//---------------------------------------------------------------------------
	key_inputdirec : function(ca){
		if(!this.isSHIFT){ return false;}

		var cell = this.cursor.getTCC(), pid = this.owner.pid;
		if(pid==="firefly" || pid==="snakes" || pid==="yajikazu" || pid==="yajirin"){
			if(cell.getQnum()===-1){ return false;}
		}

		var flag = true;
		switch(ca){
			case this.KEYUP: cell.setQdir(cell.getQdir()!==k.UP?k.UP:0); break;
			case this.KEYDN: cell.setQdir(cell.getQdir()!==k.DN?k.DN:0); break;
			case this.KEYLT: cell.setQdir(cell.getQdir()!==k.LT?k.LT:0); break;
			case this.KEYRT: cell.setQdir(cell.getQdir()!==k.RT?k.RT:0); break;
			default: flag = false;
		}

		if(flag){
			this.cursor.getTCP().draw();
			this.stopEvent();	/* カーソルを移動させない */
		}
		return flag;
	},

	//---------------------------------------------------------------------------
	// kc.inputnumber51()  [＼]の数字等を入力する
	// kc.setnum51()      モード別に数字を設定する
	// kc.getnum51()      モード別に数字を取得する
	//---------------------------------------------------------------------------
	inputnumber51 : function(ca,max_obj){
		var tc = this.cursor;
		if(tc.chtarget(ca)){ return;}

		var obj = tc.getOBJ();
		var target = tc.detectTarget(obj);
		if(target===0 || (obj.iscellobj && obj.is51cell())){
			if(ca==='q' && !obj.isnull){
				if(obj.is51cell()){ obj.set51cell();}
				else              { obj.remove51cell();}
				tc.getTCP().draw();
				return;
			}
		}
		if(target==0){ return;}

		var def = this.owner.Cell.prototype[(target===2?'qnum':'qnum2')];
		var max = max_obj[target], val=def;

		if('0'<=ca && ca<='9'){
			var num=parseInt(ca), cur=this.getnum51(obj,target);
			if(cur<=0 || cur*10+num>max || this.prev!==(obj.iscellobj ? obj : null)){ cur=0;}
			val = cur*10+num;
			if(val>max){ return;}
		}
		else if(ca=='-' || ca==' '){ val=def;}
		else{ return;}

		this.setnum51(obj,target,val);
		this.prev = (obj.iscellobj ? obj : null);
		tc.getTCP().draw();
	},
	setnum51 : function(obj,target,val){
		(target==2 ? obj.setQnum(val) : obj.setQnum2(val));
	},
	getnum51 : function(obj,target){
		return (target==2 ? obj.getQnum() : obj.getQnum2());
	}
});

//---------------------------------------------------------------------------
// ★TargetCursorクラス キー入力のターゲットを保持する
//---------------------------------------------------------------------------

pzpr.createPuzzleClass('TargetCursor',
{
	initialize : function(){
		// 現在入力ターゲットになっている場所(border座標系)
		this.pos = new this.owner.Address(1,1);

		// 有効な範囲(minx,miny)-(maxx,maxy)
		this.minx;
		this.miny;
		this.maxx;
		this.maxy;
	},

	crosstype : false,

	//---------------------------------------------------------------------------
	// tc.setminmax()  初期化時・モード変更時にプロパティを設定する
	// tc.initCursor() 初期化時にカーソルの位置を設定する
	// 
	// tc.adjust_init()       初期化時にカーソルの位置がおかしい場合に調整する
	// tc.adjust_modechange() モード変更時に位置がおかしい場合に調節する(オーバーライド用)
	//---------------------------------------------------------------------------
	setminmax : function(){
		var bd = this.owner.board, bm = (!this.crosstype?1:0);
		this.minx = bd.minbx + bm;
		this.miny = bd.minby + bm;
		this.maxx = bd.maxbx - bm;
		this.maxy = bd.maxby - bm;

		this.adjust_init();
	},
	initCursor : function(){
		if(this.crosstype){ this.pos = new this.owner.Address(0,0);}
		else              { this.pos = new this.owner.Address(1,1);}

		this.adjust_init();
	},

	adjust_init : function(){
		if(this.pos===(void 0)){ return;}
		if(this.pos.bx<this.minx){ this.pos.bx=this.minx;}
		if(this.pos.by<this.miny){ this.pos.by=this.miny;}
		if(this.pos.bx>this.maxx){ this.pos.bx=this.maxx;}
		if(this.pos.by>this.maxy){ this.pos.by=this.maxy;}
	},
	adjust_modechange : function(){ },

	//---------------------------------------------------------------------------
	// tc.movedir_cursor() ターゲットの位置を動かす
	//---------------------------------------------------------------------------
	movedir_cursor : function(dir,mv){
		this.pos.movedir(dir,mv);
	},

	//---------------------------------------------------------------------------
	// tc.getTCP() ターゲットの位置をAddressクラスのオブジェクトで取得する
	// tc.setTCP() ターゲットの位置をAddressクラスのオブジェクトで設定する
	// tc.getTCC() ターゲットの位置をCellのIDで取得する
	// tc.setTCC() ターゲットの位置をCellのIDで設定する
	// tc.getTXC() ターゲットの位置をCrossのIDで取得する
	// tc.setTXC() ターゲットの位置をCrossのIDで設定する
	// tc.getTBC() ターゲットの位置をBorderのIDで取得する
	// tc.setTBC() ターゲットの位置をBorderのIDで設定する
	// tc.getTEC() ターゲットの位置をEXCellのIDで取得する
	// tc.setTEC() ターゲットの位置をEXCellのIDで設定する
	// tc.getOBJ() ターゲットの位置をオブジェクトで取得する
	// tc.setOBJ() ターゲットの位置をオブジェクトで設定する
	//---------------------------------------------------------------------------
	getTCP : function(){ return this.pos.clone();},
	setTCP : function(pos){
		if(pos.bx<this.minx || this.maxx<pos.bx || pos.by<this.miny || this.maxy<pos.by){ return;}
		this.pos.set(pos);
	},

	getTCC : function(){ return this.pos.getc();},
	setTCC : function(cell){ this.pos.init(cell.bx,cell.by);},

	getTXC : function(){ return this.pos.getx();},
	setTXC : function(cross){ this.pos.init(cross.bx,cross.by);},

	getTBC : function(){ return this.pos.getb();},
	setTBC : function(border){ this.pos.init(border.bx,border.by);},

	getTEC : function(){ return this.pos.getex();},
	setTEC : function(excell){ this.pos.init(excell.bx,excell.by);},

	getOBJ : function(){ return this.owner.board.getobj(this.pos.bx, this.pos.by);},
	setOBJ : function(obj){
		if(obj.isnull){ return;}
		this.pos.init(obj.bx,obj.by);
	},

	//---------------------------------------------------------------------------
	// tc.chtarget()     SHIFTを押した時に[＼]の入力するところを選択する
	// tc.detectTarget() [＼]の右・下どちらに数字を入力するか判断する
	//---------------------------------------------------------------------------
	targetdir : 2,
	chtarget : function(ca){
		if(ca!='shift'){ return false;}
		if(this.targetdir==2){ this.targetdir=4;}
		else{ this.targetdir=2;}
		this.getTCC().draw();
		return true;
	},
	detectTarget : function(obj){
		var bd = this.owner.board;
		if(obj.isnull){ return 0;}
		else if(obj.iscellobj){
			if     (obj.ques!==51 || obj.id===bd.cellmax-1){ return 0;}
			else if((obj.rt().isnull || obj.rt().getQues()===51) &&
				    (obj.dn().isnull || obj.dn().getQues()===51)){ return 0;}
			else if(obj.rt().isnull || obj.rt().getQues()===51){ return 4;}
			else if(obj.dn().isnull || obj.dn().getQues()===51){ return 2;}
		}
		else if(obj.isexcellobj){
			if     (obj.id===bd.qcols+bd.qrows){ return 0;}
			else if((obj.by===-1 && obj.relcell(0,2).getQues()===51) ||
				    (obj.bx===-1 && obj.relcell(2,0).getQues()===51)){ return 0;}
			else if(obj.by===-1){ return 4;}
			else if(obj.bx===-1){ return 2;}
		}
		else{ return 0;}

		return this.targetdir;
	}
});
