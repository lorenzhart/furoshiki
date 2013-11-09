$(function() {
	//leapmotionが返す座標を変換するために必要な値を取得
	var centerX = $("#frame").width() / 2;
	var bodyHeight = $("#frame").height();

	//最初に.clickable要素を取得
	var clickableElements = $(".clickable");
	console.log(clickableElements);

	//カーソルが乗っている要素
	var lastClickableElement = null;

	//leapmotion
	Leap.loop(function(frame){
		//指がない場合はreturn
		if(frame.fingers.length == 0){
			return;
		}

		//カーソルを消去
		$("#frame").find("#cursor").remove();

		//指の座標を取得
		var x = frame.fingers[0].tipPosition[0];
		var y = frame.fingers[0].tipPosition[1];
		var z = frame.fingers[0].tipPosition[2];
		//ディスプレイの左上を原点とした座標に変換(＆ディスプレイ全体に動かせるように調整)
		var pos = [x * 12 + centerX, bodyHeight - y * 6, z];

		//カーソルを描画
		$("<div id='cursor'></div>").css({"top": pos[1], "left": pos[0], "position": "absolute"}).appendTo("#frame");

		//カーソルの座標にある.clickable要素を探す
		var element = hit(pos);
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
	});

	//pos = [x座標, y座標]の配列を受け取って、その座標を含む.clickable要素を返す。
	function hit(pos){
		var hitElement = null;
		clickableElements.each(function(){
			var offset = $(this).offset();
			var top = offset.top;
			var left = offset.left;
			var bottom = top + $(this).height();
			var right = left + $(this).width();

			if (pos[1] < top || pos[0] > right || pos[0] < left || pos[1] > bottom){
				return true; //次の要素を判定
			} else {
				hitElement = $(this);
				return false; //eachループから抜ける
			}
		});
		return hitElement;
	}
});