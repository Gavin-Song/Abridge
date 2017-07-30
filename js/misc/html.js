/* html.js
 *
 * Methods and varaibles required to format
 * and handle html in the article 
 *
 * Gavin Song 2017*/



function darkenColor(c){
	/*Replaces color c with dark varaient, as defined in config.js*/
	switch(c){
		case COLOR_BLUE:{
			return COLOR_DARK_BLUE; 
		}
		case COLOR_ORANGE:{
			return COLOR_DARK_ORANGE; 
		}
		case COLOR_YELLOW:{
			return COLOR_DARK_YELLOW;
		}
	}
	return c; 
}
 
function highlight(tag, txt, highlight_color, text_color, title, type){
	/*In the given tag, alter the occurance of text so it will be 
	highlighted with highlight_color and the text with text_color*/
	
	/*Delete whitespace at front and end*/
	txt = txt.replace(/^\s+/, '').replace(/\s+$/, '');
	
	/*Attempt to balance out <a> tags*/
	if( txt.split("<a ").length > txt.split("</a>").length ){
		txt = txt + "</a>";
	}else if( txt.split("<a ").length < txt.split("</a>").length ){
		txt = txt.slice(txt.indexOf("</a>")).replace("</a>","");
	}

	/*Ignore malformatted html*/
	if( txt.length <= 1 ){
		return false;
	}
	
	/*Images break*/
	if( tag.innerHTML.includes("<img") && tag.innerHTML.includes('title=') ){
		return false; 
	}
	

	if( type == "highlight" ){
		/*Block highlighting, wrap in block div*/
		tag.innerHTML = tag.innerHTML.replace( txt, 
			'<span class="extension_highlight" id="extension_highlight" '
				+ (title ? ('title="' + title + '"') : "")
				+ 'style="background-color:' + highlight_color + ' !important;color:' 
				+ text_color + ' !important;border-color: ' + highlight_color + ' !important">' + txt + "</span>"
		);
	}
	else if( type == "subtle_change" ){
		/*Subtlely change the color of the text with dark varient*/
		text_color = darkenColor(highlight_color);
		highlight_color = "transparent";
		tag.innerHTML = tag.innerHTML.replace( txt, 
			'<span class="extension_highlight" id="extension_highlight" '
				+ (title ? ('title="' + title + '"') : "")
				+ 'style="background-color:' + highlight_color + ' !important;color:' 
				+ text_color + ' !important;border-color: transparent !important">' + txt + "</span>"
		);
	}
	else if( type == "underline" ){
		/*Underline the text*/
		tag.innerHTML = tag.innerHTML.replace( txt, 
			'<span class="extension_highlight" id="extension_highlight" '
				+ (title ? ('title="' + title + '"') : "")
				+ 'style="border-bottom-color:' + highlight_color + ' !important;border-bottom-width: 2px">' + txt + "</span>"
		);
	}
	
}

function strip(html){
   /*Strips tags from raw html*/
   var tmp = document.implementation.createHTMLDocument("New").body;
   if( html.includes(">") && html.split(">").length != html.split("<").length ){ /*For misparsed tags in the sentence extraction*/
	   html = html.slice(html.indexOf(">")).replace(">","");
   }
   
   tmp.innerHTML = html;
   return tmp.textContent.replace(/^\s+|\s+$/g, '') || tmp.innerText.replace(/^\s+|\s+$/g, '') || "";
}

/*Copies text to clipboard*/
function copyToClipboard(txt){
	/*Obtain some varaibles*/
	var doc = document.documentElement;
	var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
	
	/*Create a textarea, select the text, copy the text and remove*/
	var input = document.createElement('textarea');
	document.body.appendChild(input);
	input.value = txt;
	input.focus();
	input.select();
	document.execCommand('Copy');
	input.remove();
	
	/*Scroll back to inital scroll height*/
	window.scrollTo(0, top);
}

/*Wraps some html with a span with color: color*/
function colorify(txt,color){
	return "<span style='color:" + color + "'>" + txt + "</span>";
}