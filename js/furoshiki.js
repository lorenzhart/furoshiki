$(function() {
	//leapmotionが返す座標を変換するために必要な値を取得
	var centerX = $(window).width() / 2;
	var bodyHeight = $(window).height();

	//最初に.clickable要素を取得
	var clickableElements = $(".clickable");
	console.log(clickableElements);

	//カーソルが乗っている要素
	var lastClickableElement = null;

	//カーソルを描画するcanvas要素を作成
	var canvas = $("<canvas id='cursor-canvas'/>").css({"position": "fixed",
													"left": 0,
													"top": 0, 
													"z-index": 1,}).appendTo("#frame");
	canvas.attr({height:$(window).height()});
	canvas.attr({width:$(window).width()});

	//カーソルの位置を記録
	//スクロールのとき、前のフレームでの指の位置からの差を求めるため
	var lastPosition;

	//leapmotion
	Leap.loop({enableGestures:true}, function(frame){
		//指がない場合はreturn
		if(frame.fingers.length == 0){
			return;
		}

		//指が4本以上ならスクロール
		if(frame.fingers.length > 3){
			var handX = frame.hands[0].stabilizedPalmPosition[0];
			var handY = frame.hands[0].stabilizedPalmPosition[1];
			var handZ = frame.hands[0].stabilizedPalmPosition[2];
			//ディスプレイの左上を原点とした座標に変換(＆ディスプレイ全体に動かせるように調整)
			var handPosition = [handX * 6 + centerX, bodyHeight - handY * 3, handZ];
			
			drawHandCursor(handPosition[0], handPosition[1], handPosition[2]);
			
			//手を奥に突き出したときスクロール
			if(handPosition[2] < 0){
				posDelta = [handPosition[0] - lastPosition[0], handPosition[1] - lastPosition[1]];

				body = $("body");
				body.scrollLeft(body.scrollLeft() - posDelta[0]);
				body.scrollTop(body.scrollTop() - posDelta[1]);	
			}

			lastPosition = handPosition;
			return;	
		}

		//指の座標を取得
		var x = frame.fingers[0].tipPosition[0];
		var y = frame.fingers[0].tipPosition[1];
		var z = frame.fingers[0].tipPosition[2];
		//ディスプレイの左上を原点とした座標に変換(＆ディスプレイ全体に動かせるように調整)
		var pos = [x * 6 + centerX, bodyHeight - y * 3, z];

		//カーソルの座標にある.clickable要素を探す
		//毎フレーム総当りで探索していると重いので半分に間引き
		//TODO: 探索アルゴリズムを考える。DOMの位置関係を取得して周辺の要素から探すなど
		if(frame.timestamp % 2 == 0){
			var element = hit(pos);	
		}else{
			var element = lastClickableElement;
		}
		
		//カーソルの乗った／外れたdivのクラスを変更
		if(element != lastClickableElement){
			if(lastClickableElement){
				lastClickableElement.removeClass("onCursor").addClass("offCursor");
			}

			if(element){
				element.removeClass("offCursor").addClass("onCursor");
			}

			lastClickableElement = element;
		}

		//keyTapジェスチャで選択
		if(frame.gestures.length > 0){
			if(frame.gestures[0].type == 'keyTap'){
				if(lastClickableElement){
					var selectedElement = lastClickableElement;
					selectedElement.addClass("selected");
					setTimeout(function(){ selectedElement.removeClass("selected"); }, 1000);
				}
			}
		}

		//カーソルを描画
		drawCursor(pos[0], pos[1]);
		lastPosition = pos;
	});

	//pos = [x座標, y座標]の配列を受け取って、その座標を含む.clickable要素を返す。
	function hit(pos){
		body = $("body");
		positionInPage = [pos[0] + body.scrollLeft(), pos[1] + body.scrollTop()];
		var hitElement = null;
		clickableElements.each(function(){
			var offset = $(this).offset();
			var top = offset.top;
			var left = offset.left;
			var bottom = top + $(this).height();
			var right = left + $(this).width();

			if (positionInPage[1] < top || positionInPage[0] > right || positionInPage[0] < left || positionInPage[1] > bottom){
				return true; //次の要素を判定
			} else {
				hitElement = $(this);
				return false; //eachループから抜ける
			}
		});
		return hitElement;
	}

	//カーソルを描画
	function drawCursor(x, y){
		radius = 30;
		var canvas = $("#cursor-canvas")[0];
		var context = canvas.getContext("2d");
		context.globalAlpha = 0.7;
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.beginPath();
		context.fillStyle = 'rgb(192, 80, 77)';
		context.arc(x, y, radius, 0, Math.PI * 2, false);
		context.fill();
	}

	//スクロール時のカーソルを描画
	function drawHandCursor(x, y, z){
		zoom = z > 0 ? 100 + z/2 : 100;
		var canvas = $("#cursor-canvas")[0];
		var context = canvas.getContext("2d");
		context.globalAlpha = 0.7;
		context.clearRect(0, 0, canvas.width, canvas.height);
		var handImage = new Image();
		handImage.src = "img/hand.png";
		context.drawImage(handImage, x, y, 300 * zoom/100, 300 * zoom/100);
	}
});