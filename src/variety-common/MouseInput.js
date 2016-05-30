// MouseCommon.js v3.4.1

pzpr.classmgr.makeCommon({
//---------------------------------------------------------
MouseEvent:{
	// 共通関数
	//---------------------------------------------------------------------------
	// mv.inputcell() Cellのqans(回答データ)に0/1/2のいずれかを入力する。
	// mv.decIC()     0/1/2どれを入力すべきかを決定する。
	//---------------------------------------------------------------------------
	inputcell : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.inputData===null){ this.decIC(cell);}

		this.mouseCell = cell;

		if(cell.numberRemainsUnshaded && cell.qnum!==-1 && (this.inputData===1||(this.inputData===2 && this.puzzle.painter.bcolor==="white"))){ return;}
		if(this.RBShadeCell && this.inputData===1){
			if(this.firstCell.isnull){ this.firstCell = cell;}
			var cell0 = this.firstCell;
			if(((cell0.bx&2)^(cell0.by&2))!==((cell.bx&2)^(cell.by&2))){ return;}
		}

		(this.inputData===1?cell.setShade:cell.clrShade).call(cell);
		cell.setQsub(this.inputData===2?1:0);

		cell.draw();
	},
	decIC : function(cell){
		if(this.puzzle.getConfig('use')===1){
			if     (this.btn==='left') { this.inputData=(cell.isUnshade()  ? 1 : 0); }
			else if(this.btn==='right'){ this.inputData=((cell.qsub!==1)? 2 : 0); }
		}
		else if(this.puzzle.getConfig('use')===2){
			if(cell.numberRemainsUnshaded && cell.qnum!==-1){
				this.inputData=((cell.qsub!==1)? 2 : 0);
			}
			else if(this.btn==='left'){
				if     (cell.isShade()){ this.inputData=2;}
				else if(cell.qsub===1) { this.inputData=0;}
				else{ this.inputData=1;}
			}
			else if(this.btn==='right'){
				if     (cell.isShade()){ this.inputData=0;}
				else if(cell.qsub===1) { this.inputData=1;}
				else{ this.inputData=2;}
			}
		}
	},
	//---------------------------------------------------------------------------
	// mv.inputqnum()      Cellのqnum(数字データ)に数字を入力する
	// mv.inputqnum_main() Cellのqnum(数字データ)に数字を入力する(メイン処理)
	//---------------------------------------------------------------------------
	inputqnum : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}

		if(cell!==this.cursor.getc()){
			this.setcursor(cell);
		}
		else{
			this.inputqnum_main(cell);
		}
		this.mouseCell = cell;
	},
	inputqnum_main : function(cell){
		var cell0=cell, puzzle=this.puzzle, bd=puzzle.board;
		if(puzzle.editmode && bd.roommgr.hastop){
			cell0 = cell = cell.room.top;
		}
		else if(puzzle.execConfig('dispmove')){
			if(cell.isDestination()){ cell = cell.base;}
			else if(cell.lcnt>0){ return;}
		}

		var subtype=0; // qsubを0～いくつまで入力可能かの設定
		if     (puzzle.editmode)    { subtype =-1;}
		else if(cell.numberWithMB)  { subtype = 2;}
		else if(cell.numberAsObject){ subtype = 1;}
		if(puzzle.pid==="roma" && puzzle.playmode){ subtype=0;}

		if(puzzle.playmode && cell.qnum!==puzzle.klass.Cell.prototype.qnum){ return;}

		var max=cell.getmaxnum(), min=cell.getminnum();
		var num=cell.getNum(), qs=(puzzle.editmode ? 0 : cell.qsub);
		var val=-1, ishatena=(puzzle.editmode && !cell.disInputHatena);

		// playmode: subtypeは0以上、 qsにqsub値が入る
		// editmode: subtypeは-1固定、qsは常に0が入る
		if(this.btn==='left'){
			if     (num>=max){ val = ((subtype>=1) ? -2 : -1);}
			else if(qs === 1){ val = ((subtype>=2) ? -3 : -1);}
			else if(qs === 2){ val = -1;}
			else if(num===-1){ val = (ishatena ? -2 : min);}
			else if(num< min){ val = min;}
			else             { val = num+1;}
		}
		else if(this.btn==='right'){
			if     (qs === 1){ val = max;}
			else if(qs === 2){ val = -2;}
			else if(num===-1){
				if     (subtype===1){ val = -2;}
				else if(subtype===2){ val = -3;}
				else                { val = max;}
			}
			else if(num> max){ val = max;}
			else if(num<=min){ val = (ishatena ? -2 : -1);}
			else if(num===-2){ val = -1;}
			else             { val = num-1;}
		}
		cell.setNum(val);

		if(puzzle.execConfig('dispmove') && cell.noNum()){
			cell.eraseMovedLines();		/* 丸数字がなくなったら付属する線も消去する */
		}

		cell0.draw();
	},

	//---------------------------------------------------------------------------
	// mv.inputQues() Cellのquesデータをarrayのとおりに入力する
	//---------------------------------------------------------------------------
	inputQues : function(array){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell!==this.cursor.getc()){
			this.setcursor(cell);
		}
		else{
			this.inputQues_main(array,cell);
		}
	},
	inputQues_main : function(array,cell){
		var qu = cell.ques, len = array.length;
		if(this.btn==='left'){
			for(var i=0;i<=len-1;i++){
				if(qu===array[i]){
					cell.setQues(array[((i<len-1)?i+1:0)]);
					break;
				}
			}
		}
		else if(this.btn==='right'){
			for(var i=len-1;i>=0;i--){
				if(qu===array[i]){
					cell.setQues(array[((i>0)?i-1:len-1)]);
					break;
				}
			}
		}
		cell.draw();
	},

	//---------------------------------------------------------------------------
	// mv.inputMB()   Cellのqsub(補助記号)の○, ×データを入力する
	//---------------------------------------------------------------------------
	inputMB : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		cell.setQsub((this.btn==='left'?[1,2,0]:[2,0,1])[cell.qsub]);
		cell.draw();
	},

	//---------------------------------------------------------------------------
	// mv.inputdirec()      Cellのdirec(方向)のデータを入力する
	// mv.inputarrow_cell() Cellの矢印を入力する
	//---------------------------------------------------------------------------
	inputdirec : function(){
		var pos = this.getpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var cell = this.prevPos.getc();
		if(!cell.isnull){
			if(cell.qnum!==-1){
				var dir = this.prevPos.getdir(pos,2);
				if(dir!==cell.NDIR){
					cell.setQdir(cell.qdir!==dir?dir:0);
					cell.draw();
				}
			}
		}
		this.prevPos = pos;
	},
	inputarrow_cell : function(){
		var pos = this.getpos(0);
		if(this.prevPos.equals(pos) && this.inputData===1){ return;}

		var dir = pos.NDIR, cell = this.prevPos.getc();
		if(!cell.isnull){
			var dir = this.prevPos.getdir(pos,2);
			if(dir!==pos.NDIR){
				this.inputarrow_cell_main(cell, dir);
				cell.draw();
				this.mousereset();
				return;
			}
		}
		this.prevPos = pos;
	},
	inputarrow_cell_main : function(cell, dir){
		if(cell.numberAsObject){ cell.setNum(dir);}
	},

	//---------------------------------------------------------------------------
	// mv.inputtile()  黒タイル、白タイルを入力する
	//---------------------------------------------------------------------------
	inputtile : function(){
		var cell = this.getcell();
		if(cell.isnull || cell.is51cell() || cell===this.mouseCell){ return;}
		if(this.inputData===null){ this.decIC(cell);}

		this.mouseCell = cell;
		var clist = cell.room.clist;
		for(var i=0;i<clist.length;i++){
			var cell2 = clist[i];
			if(this.inputData===1 || cell2.qsub!==3){
				(this.inputData===1?cell2.setShade:cell2.clrShade).call(cell2);
				cell2.setQsub(this.inputData===2?1:0);
			}
		}
		clist.draw();
	},

	//---------------------------------------------------------------------------
	// mv.input51()   [＼]を作ったり消したりする
	//---------------------------------------------------------------------------
	input51 : function(){
		var piece = this.getcell_excell(); /* piece : cell or excell */
		if(piece.isnull){ return;}

		var group = piece.group;
		if(group==='excell' || (group==='cell' && piece!==this.cursor.getc())){
			this.setcursor(piece);
		}
		else if(group==='cell'){
			this.input51_main(piece);
		}
	},
	input51_main : function(cell){
		if(this.btn==='left'){
			if(!cell.is51cell()){ cell.set51cell();}
			else{ this.cursor.chtarget();}
		}
		else if(this.btn==='right'){ cell.remove51cell();}

		cell.drawaround();
	},

	//---------------------------------------------------------------------------
	// mv.inputcross()     Crossのques(問題データ)に0～4を入力する。
	// mv.inputcrossMark() Crossの黒点を入力する。
	//---------------------------------------------------------------------------
	inputcross : function(){
		var cross = this.getcross();
		if(cross.isnull || cross===this.mouseCell){ return;}

		if(cross!==this.cursor.getx()){
			this.setcursor(cross);
		}
		else{
			this.inputcross_main(cross);
		}
		this.mouseCell = cross;
	},
	inputcross_main : function(cross){
		if(this.btn==='left'){
			cross.setQnum(cross.qnum!==4 ? cross.qnum+1 : -2);
		}
		else if(this.btn==='right'){
			cross.setQnum(cross.qnum!==-2 ? cross.qnum-1 : 4);
		}
		cross.draw();
	},
	inputcrossMark : function(){
		var pos = this.getpos(0.24);
		if(!pos.oncross()){ return;}
		var bd = this.board, bm = (bd.hascross===2?0:2);
		if(pos.bx<bd.minbx+bm || pos.bx>bd.maxbx-bm || pos.by<bd.minby+bm || pos.by>bd.maxby-bm){ return;}

		var cross = pos.getx();
		if(cross.isnull){ return;}

		this.puzzle.opemgr.disCombine = true;
		cross.setQnum(cross.qnum===1?-1:1);
		this.puzzle.opemgr.disCombine = false;

		cross.draw();
	},
	//---------------------------------------------------------------------------
	// mv.inputborder()     盤面境界線のデータを入力する
	// mv.inputQsubLine()   盤面の境界線用補助記号を入力する
	//---------------------------------------------------------------------------
	inputborder : function(){
		var pos = this.getpos(0.35);
		if(this.prevPos.equals(pos)){ return;}

		var border = this.prevPos.getborderobj(pos);
		if(!border.isnull){
			if(this.inputData===null){ this.inputData=(border.isBorder()?0:1);}
			if     (this.inputData===1){ border.setBorder();}
			else if(this.inputData===0){ border.removeBorder();}
			border.draw();
		}
		this.prevPos = pos;
	},
	inputQsubLine : function(){
		var pos = this.getpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var border = this.prevPos.getnb(pos);
		if(!border.isnull){
			if(this.inputData===null){ this.inputData=(border.qsub===0?1:0);}
			if     (this.inputData===1){ border.setQsub(1);}
			else if(this.inputData===0){ border.setQsub(0);}
			border.draw();
		}
		this.prevPos = pos;
	},

	//---------------------------------------------------------------------------
	// mv.inputLine()     盤面の線を入力する
	// mv.inputMoveLine() 移動系パズル向けに盤面の線を入力する
	//---------------------------------------------------------------------------
	inputLine : function(){
		var pos, border;
		if(!this.board.borderAsLine){
			pos = this.getpos(0);
			if(this.prevPos.equals(pos)){ return;}
			border = this.prevPos.getnb(pos);
		}
		else{
			pos = this.getpos(0.35);
			if(this.prevPos.equals(pos)){ return;}
			border = this.prevPos.getborderobj(pos);
		}
		
		if(!border.isnull){
			if(this.inputData===null){ this.inputData=(border.isLine()?0:1);}
			if     (this.inputData===1){ border.setLine();}
			else if(this.inputData===0){ border.removeLine();}
			border.draw();
		}
		this.prevPos = pos;
	},
	inputMoveLine : function(){
		/* "ものを動かしたように描画する"でなければinputLineと同じ */
		if(!this.puzzle.execConfig('dispmove')){
			this.inputLine();
			return;
		}
		
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var cell0 = this.mouseCell, pos = cell.getaddr();
		/* 初回はこの中に入ってきます。 */
		if(this.mousestart && cell.isDestination()){
			this.mouseCell = cell;
			this.prevPos = pos;
			cell.draw();
		}
		/* 移動中の場合 */
		else if(this.mousemove && !cell0.isnull && !cell.isDestination()){
			var border = this.prevPos.getnb(pos);
			if(!border.isnull && ((!border.isLine() && cell.lcnt===0) || (border.isLine() && cell0.lcnt===1))){
				this.mouseCell = cell;
				this.prevPos = pos;
				if(!border.isLine()){ border.setLine();}else{ border.removeLine();}
				border.draw();
			}
		}
	},

	//---------------------------------------------------------------------------
	// mv.inputpeke()   盤面の線が通らないことを示す×を入力する
	//---------------------------------------------------------------------------
	inputpeke : function(){
		var pos = this.getpos(0.22);
		if(this.prevPos.equals(pos)){ return;}

		var border = pos.getb();
		if(!border.isnull){
			if(this.inputData===null){ this.inputData=(border.qsub===0?2:3);}
			if(this.inputData===2 && border.isLine() && this.puzzle.execConfig('dispmove')){}
			else if(this.inputData===2){ border.setPeke();}
			else if(this.inputData===3){ border.removeLine();}
			border.draw();
		}
		this.prevPos = pos;
	},

	//---------------------------------------------------------------------------
	// mv.inputTateyoko() 縦棒・横棒をドラッグで入力する
	//---------------------------------------------------------------------------
	inputTateyoko : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var amibo = (this.pid==="amibo");

		// 黒マス上なら何もしない
		if     (!amibo && cell.ques===1){ }
		else if( amibo && cell.isNum()){ }
		// 初回 or 入力し続けていて別のマスに移動した場合
		else if(this.mouseCell!==cell){
			this.firstPoint.set(this.inputPoint);
		}
		// まだ入力していないセルの場合
		else if(this.firstPoint.bx!==null){
			var val=null,
				dx = this.inputPoint.bx-this.firstPoint.bx,
				dy = this.inputPoint.by-this.firstPoint.by;
			if     (dy<=-0.50 || 0.50<=dy){ val=1;}
			else if(dx<=-0.50 || 0.50<=dx){ val=2;}
			
			if(val!==null){
				var shape = {0:0,11:3,12:1,13:2}[cell.qans];
				if((this.inputData===null) ? (shape & val) : this.inputData<=0){
					val = (!amibo ? 0 : -val);
				}
				
				// 描画・後処理
				if(!amibo)    { shape  = val;}
				else if(val>0){ shape |= val;}
				else          { shape &= ~(-val);}
				cell.setQans([0,12,13,11][shape]);
				cell.draw();
				
				this.inputData = +(val>0);
				this.firstPoint.reset();
			}
		}

		this.mouseCell = cell;
	},

	//---------------------------------------------------------------------------
	// mv.dispRedBlk()  ひとつながりの黒マスを赤く表示する
	// mv.dispRedBlk8() ななめつながりの黒マスを赤く表示する
	// mv.dispRedLine()   ひとつながりの線を赤く表示する
	//---------------------------------------------------------------------------
	dispRedBlk : function(){
		var cell = this.getcell();
		this.mousereset();
		if(cell.isnull || !cell.isShade()){ return;}
		if(!this.RBShadeCell){ cell.sblk.clist.setinfo(1);}
		else{ this.dispRedBlk8(cell);}
		this.board.haserror = true;
		this.puzzle.redraw();
	},
	dispRedBlk8 : function(cell0){
		var stack=[cell0];
		while(stack.length>0){
			var cell = stack.pop();
			if(cell.qinfo!==0){ continue;}

			cell.setinfo(1);
			var bx=cell.bx, by=cell.by, clist=this.board.cellinside(bx-2,by-2,bx+2,by+2);
			for(var i=0;i<clist.length;i++){
				var cell2 = clist[i];
				if(cell2.qinfo===0 && cell2.isShade()){ stack.push(cell2);}
			}
		}
	},

	dispRedLine : function(){
		var bd = this.board, border = this.getborder(0.15);
		this.mousereset();
		if(border.isnull){ return;}

		if(!border.isLine()){
			var piece = (!bd.borderAsLine ? this.getcell() : this.getcross()); /* cell or cross */
			if(piece.isnull || (bd.linegraph.isLineCross && (piece.lcnt===3 || piece.lcnt===4))){ return;}
			var adb = piece.adjborder;
			if     (adb.left.isLine()  ){ border = adb.left;  }
			else if(adb.right.isLine() ){ border = adb.right; }
			else if(adb.top.isLine()   ){ border = adb.top;   }
			else if(adb.bottom.isLine()){ border = adb.bottom;}
			else{ return;}
		}
		if(border.isnull){ return;}

		bd.border.setinfo(-1);
		border.path.setedgeinfo(1);
		bd.haserror = true;
		this.puzzle.redraw();
	}
}
});