/*JS file that's injected into the DOM*/
var BUTTON_NUMBER = 4;
var BUTTON_EXTRA = 2;

function animateHeight(id, target, speed, start){
	/*Custom function to animate the height because 
	CSS transitions are annoying*/ 
	var suffix = "";
	if( target.includes("px") ){ suffix = "px"; }
	else if( target.includes("%") ){ suffix = "%"; }
	
	if( document.getElementById(id).style.bottom == "" ){
		document.getElementById(id).style.bottom = start;
	}

	var start = +document.getElementById(id).style.bottom.match(/-?\d+/g)[0];
	var end = +target.match(/-?\d+/g)[0];
	var i = 0;
	
	if( start == end ){
		return;
	}

	if( start < end ){
		while( start < end ){
			start += speed * i;

			setTimeout( function(s){
				if( s  > end ){
					s = end;
				}
				
				document.getElementById(id).style.bottom = s + suffix;
			}, 10 * i, start );
			i++;
			if( i > 30) {
				break;
			}
		}
	}else{
		while( start > end ){
			start -= speed * i;
			setTimeout( function(s){
				if( s < end ){
					s = end;
				}
				document.getElementById(id).style.bottom = s + suffix;
			}, 10 * i, start );
			i++;
			
			if( i > 30) {
				break;
			}
		}
	}
}


function openClose(id){
	/*if(clickedBefore < BUTTON_NUMBER - 1){
		clickedBefore++;
		return false;
	}*/

	/*The tab is currently closed, close all other tabs
	raise all buttons up and open this tab*/
	
	/*Logic: if the tab itself is lready up, simply fade otherwise move down*/

	if( document.getElementById("bottom_tab" + id).style.bottom == "0%" || document.getElementById("bottom_tab" + id).style.bottom == "" ){
		/*The tab is on the bottom, move the selected content up with animation*/
		animateHeight("summary_tab" + id, "0%", 1, "-75%");
		document.getElementById("summary_tab" + id).style.opacity = "1";


		document.getElementById("bottom_tab" + id).style.borderColor = "#888888";
		document.getElementById("bottom_tab" + id).style.backgroundColor = "#444F57";
		
		for( var i=1;i<=BUTTON_NUMBER + BUTTON_EXTRA;i++){
			animateHeight("bottom_tab" + i, "75%", 1, "0%");
		}
	}
	else if( document.getElementById("bottom_tab" + id).style.bottom == "75%" ){
		/*Tab is already up. If the id of the tab that is up is equal to the 
		clicked tab, move everything down, otherwise fade to new tab*/ 
		if( document.getElementById("summary_tab" + id).style.bottom == "0%" ){
			closeAll();
			return;
		}
		
		document.getElementById("summary_tab" + id).style.bottom = "0%";
		document.getElementById("summary_tab" + id).style.opacity = "1";

		document.getElementById("bottom_tab" + id).style.borderColor = "#888888";
		document.getElementById("bottom_tab" + id).style.backgroundColor = "#444F57";
		
		/*Fade to new tab*/ 
		for( var i=1;i<=BUTTON_NUMBER;i++){
			if( i != id ){
				setTimeout(function(i){
					document.getElementById("summary_tab" + i).style.opacity = "0";
				}, 200, i);

				document.getElementById("bottom_tab" + i).style.borderColor = "#646464";
				document.getElementById("bottom_tab" + i).style.backgroundColor = "#363F45";
				
				setTimeout(function(i){
					document.getElementById("summary_tab" + i).style.bottom = "-75%";
				}, 200, i);
			}
		}
	}
}

function closeAll(){
	for( var i=1;i<=BUTTON_NUMBER + BUTTON_EXTRA;i++){
		if( i <= BUTTON_NUMBER){
			animateHeight("summary_tab" + i, "-75%", 1, "0%");
		}
		animateHeight("bottom_tab" + i, "0%", 1, "75%");
		document.getElementById("bottom_tab" + i).style.borderColor = "#646464";
		document.getElementById("bottom_tab" + i).style.backgroundColor = "#363F45";
	}
}

function toggleState(){
	if( document.getElementById("bottom_tab1").style.bottom == "0%" ){
		openClose(1);
	}else{
		closeAll();
	}
}

function removeAllTabs(){
	var input = confirm("Are you sure you want to delete all tabs?");
	if( input ){
		for( var i=1;i<=BUTTON_NUMBER + BUTTON_EXTRA;i++){
			if( i <= BUTTON_NUMBER){
				var a = document.getElementById("summary_tab" + i);
				a.outerHTML = "";
				delete a;
			}
			var b = document.getElementById("bottom_tab" + i);
			b.outerHTML = "";
			delete b;
		}
	}
}

document.getElementById("bottom_tab1").onclick = function(){ openClose("1"); };
document.getElementById("bottom_tab2").onclick = function(){ openClose("2"); };
document.getElementById("bottom_tab3").onclick = function(){ openClose("3"); };
document.getElementById("bottom_tab4").onclick = function(){ openClose("4"); };
document.getElementById("bottom_tab5").onclick = function(){ toggleState(); };
document.getElementById("bottom_tab6").onclick = function(){ removeAllTabs(); };



