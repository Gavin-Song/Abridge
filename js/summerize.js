/*This file finds text in the document and tries to summerize 
it by altering the style of the section to be highlighted

This code probably needs to be refactored, but it works well as it is*/

/*Don't summerize if the page was already summerized*/
if(document.getElementById("chrome_extension_summerize")){
	alert("This page has already been summarized. If you would like to summarize it again, refresh the page");
	throw new Error("Page already summerized");
}

/*Try to extract settings from the page*/
try{
	var settings = JSON.parse( document.getElementById("settings").innerHTML );
}catch(e){
	alert("There has been an error obtaining the settings, try refreshing the document. If this problem persists please "
		+ "leave a bug report on our github page: " + github_page);
	throw e;
}



/*Variables*/
/*===========================================================*/


/*Variables to keep track of*/
var timeline = [];
var timeline_data = [];
var important_sentences = [];

/*Variables used in some calculations*/
var sentence_nodes = [];
var sentence_dict = {};


/*Obtain all the paragraphs*/
tags = Array.prototype.slice.call( document.getElementsByTagName("p") );

/*Obtain all <div> and <span>s too*/
if( settings.search_all ){
	tags = tags.concat( Array.prototype.slice.call( document.getElementsByTagName("div") ).filter(function(x){return !x.innerHTML.includes("<");}) );
	tags = tags.concat( Array.prototype.slice.call( document.getElementsByTagName("span") ).filter(function(x){return !x.innerHTML.includes("<");}) );
}

if(!settings.search_hidden){
	tags = tags.filter( function(e){ return !!( e.offsetWidth || e.offsetHeight || e.getClientRects().length ); }); /*Remove invisible*/
}

var new_tags = [];

/*Filter out only text that might contain useful information*/
for( var i=0;i<tags.length;i++){
	if( tags[i].innerText.length > 75 ){
		new_tags.push([tags[i].innerHTML,tags[i],tags[i].innerText]);
	}
}

/*Keyword finding*/
/*===========================================================*/
var entire_text = new_tags.map(x=>x[2]).join(" ");
var keywords = {};

/*Find the keywords from the entire text*/
var words = entire_text.split(/\b/);
for(var i=0;i<words.length;i++){
	words[i] = words[i].toLowerCase();
	/*Only match important words (Characters only)*/
	if( !stop_words.includes(words[i]) && !/[^a-zA-Z]/.test(words[i]) && words[i].length > 3 ){
		keywords["_" + words[i]] = (keywords["_" + words[i]] || 0) + 1;
	}
}


/*Obtain first 20 keywords, or entire array if there aren't enough words*/
var keywords2 = Object.keys(keywords).map(function(key){return [key, keywords[key]];});
keywords2.sort(function(a,b){return a[1] - b[1]; }); /*Sort keywords by count*/
keywords2 = keywords2.slice( Math.max( keywords2.length-20, 0 ) ); /*Get first 20 keywords only*/
keywords = keywords2.map(x=>x[0].slice(1)); /*Format keywords (Ignore first char which is _)*/
keywords2 = keywords; /*Copy keywords for future use*/


/*Sentence slicing and highlighting*/
/*===========================================================*/

/*Various variables to aid in sentence extraction*/
var num_exp = /[^\\\/\]\[]\d+[ ,;.?!\[]/g;
var date_exp = /(.*?)\d{1,4}\D\d{1,4}\D\d{1,4}(.*?)/g;
var four_digit_exp = /[^0-9][0-9]{4}[^0-9]/g;
var advanced_date_exp = /\d{1,} (bc|b\.c|ad|a\.d|ce|c\.e|b\.c\.e|bce)[ .?!,;)(]/g;
var bce_exp = /\d{1,} (bc|b\.c|b\.c\.e|bce)[ .?!,;)(]/g;
var advanced_date_exp2 = /( bc| b\.c| ad| a\.d| ce| c\.e| b\.c\.e| bce) \d{1,}[ .?!,;)(]/g;
var bce_exp2 = /( bc| b\.c| b\.c\.e| bce) \d{1,}[ .?!,;)(]/g;
var alphanumeric_exp = /[a-zA-Z0-9]/g;

var months = ["january","february","march","april","may","june","july","august","september","october",
	"november","december","jan","feb","mar","apr","may", "jun","jul","aug","sep","oct","nov","dec"];

var sentences = [];
var text_sentences; 
var start = 0;
var body_text;
var inside_citation;
var current_year;

/*Statistics*/
var total_sentences = 0;
var total_words = 0;
var total_chars = 0;
var total_paragraphs = 0;

var start_time = (new Date).getTime(); /*Keep track of execution time*/

var to_highlight = []; /*Stuff to highlight in the future*/


/*Get important sentences for highlighting*/ 
for( var j=0;j<new_tags.length;j++){
	/*Reset certain varaibles*/
	body_text = new_tags[j][0];
	sentences = [];
	start = 0;
	current_year = false;

	
	total_paragraphs++; /*Add a paragraph to count*/
	
	sentence_nodes = [];
	sentence_dict = {};
	
	if( !settings.no_timeout && (new Date).getTime() - start_time > 1000 * 15 ){ /*Execution took more than 15 seconds*/
		setTimeout( function(){ alert("Could not summarize, task is taking too long..."); }, 500 );
		break;
	}

	/*Extract sentences from the paragraph*/
	/*Split the new string into sentences
	> If a string ends in a period it's a sentence unless 
	> The string is an known abbreviation like U.S. or Dr.
		> Detected by a group of text not seperated by periods
	> The string has a period inside of a quote, in which would indicate the end, ie bob." 
	> Multiple periods such as ...
	> Sentences ending in punctuation such as ? or !

	The punctuation at the end will not be removed*/
	
	for(var i=0;i<body_text.length;i++){
		/*Check if it's an end of a sentence*/
		var temp = body_text.slice(start,Math.min(body_text.length-1,i+1)).split(" "); 
		if( body_text[i] == "[" ){
			inside_citation = true;
		}else if( body_text[i] == "]" ){
			inside_citation = false; 
		}
		
		
		if( 
			[".","?","!"].includes(body_text[i]) &&    /*Check for end of sentence punctuation*/
			/*Check for spaces/special chars that make sure it's the end of an sentence*/
			( body_text[i+1] == " " || body_text[i+1] == "[" || body_text[i+1] == '"' || i >= body_text.length - 1  ) && 
			/*Check that it's really the end and not an abbreviation*/
			!isAbbrev( temp[temp.length-1] ) &&
			!inside_citation
		){
			sentences.push( body_text.slice(start,Math.min(body_text.length,i+1)) );
			start = i+1;
		}
	}
	
	total_sentences += sentences.length;
	total_words     += sentences.join(" ").split(" ").length; 
	total_chars     += sentences.join(" ").length;
	
	/*Ignore <p> with less than 2 sentences, not considered a paragraph*/
	if( sentences.length < 2 ){
		continue;
	}
	
	
	/*Sentences contain raw html for highlighting, convert to text only
	for better word analysis*/
	text_sentences = sentences.map(x=>strip(x).replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ') ); 
	
	/*Iterate through text sentences*/
	for(var k=0;k<text_sentences.length;k++){
		/*Only 1 number matched, suggests no date ranges and is simply an event*/
		if( text_sentences[k].match(num_exp) && text_sentences[k].match(num_exp).length == 1 ){
			to_highlight.push( [new_tags[j][1], sentences[k], colors[settings["highlight_key_stat"]] , TEXT_COLOR] );
		}
		/*Multiple number matched, suggests important comparison of events or range
		This strategy mostly works as rarely will two dates be mentioned but be unimportant*/
		else if( text_sentences[k].match(num_exp) && text_sentences[k].match(num_exp).length > 1 ){
			to_highlight.push( [new_tags[j][1], sentences[k], colors[settings["highlight_key_event"]] , TEXT_COLOR] );
		}
		

		/*Remove wikipedia citations, ie [32]*/
		if( text_sentences[k].startsWith("[") ){
			text_sentences[k] = text_sentences[k].substring( text_sentences[k].indexOf("]")+2 );
		}

		/*Calculate sentence similarity and store it in a graph*/
		for( var n=0;n<text_sentences.length;n++){
			if(!sentence_nodes[k]){
				sentence_nodes[k] = [];
			}
			sentence_nodes[k][n] = intersect( text_sentences[k], text_sentences[n] );
		}
	}
	
	/*Calculate sentence dictionary based on similarity graph*/
	for( var n=0;n<text_sentences.length;n++){
		/*Calculate the weight of the sentence based on similarity to other sentences*/
		sentence_dict[n] = sentence_nodes[n].reduce(function(a,b){return a+b;});
		
		/*Some biases, but only applied to long paragraphs as short paragraphs 
		tend to make more of an argument so there is less "fact filler" and thus 
		some biases don't apply.*/
		if( text_sentences.length > 6 ){
			/*Bias the weight based on position (Front and end are more important)*/
			sentence_dict[n] += 1 - Math.pow( Math.abs((text_sentences.length-1)/2-n) / text_sentences.length , POS_BIAS );
		}			
		
		/*Bias the weight based on number of keywords in contains*/
		sentence_dict[n] += Math.pow( containsCount( text_sentences[n], keywords ) / 10, KEY_BIAS);

		/*Bias sentence based on it's length, longer sentences tend to contain more information*/
		sentence_dict[n] += Math.pow( text_sentences[n].length / 700, LEN_BIAS ); 

	}
	
	/*Highlight important sentences in the paragraph*/
	if( Object.keys(sentence_dict).length > 0 ){
		/*Sort most important sentences in the paragraph as an array formatted as 
			[ index of sentence in array, sentence ranking in paragraph ]
		Sorted from highest rank to lowest*/
		var best_sentences = Object.keys(sentence_dict).map(function(key){return [key, sentence_dict[key]];}).sort(function(a,b){return b[1] - a[1]; });
		var best = best_sentences[0][0];

		
		/*Highlight the best sentence*/
		to_highlight.push([ new_tags[j][1], sentences[best], colors[settings["highlight_key_phrase"]] , TEXT_COLOR, 
			settings.debug_mode ? "{Primary Summary sentence | Ranking: " + best_sentences[0][1]  : ""
		]);
		
		if( text_sentences.length > 6 ){
			/*Highlight second best sentence for long paragraphs if it differs only by 
			SECOND_MAX_DIF or less */
			if( best_sentences[0][1] - best_sentences[1][1] <= SECOND_MAX_DIF ){
				to_highlight.push( [new_tags[j][1], sentences[ best_sentences[1][0] ], colors[settings["highlight_key_phrase"]] , TEXT_COLOR, 
					settings.debug_mode ? "2nd Summary sentence | Ranking: " + best_sentences[1][1] : ""
				] );
			}
		}
	}
	
}

/*Highlight all the words 
--------------------------------------------*/
if( document.getElementsByClassName("extension_highlight").length > 0 ){
	throw new Error("already summarized");
}


for( var i=0;i<to_highlight.length;i++){
	var c = to_highlight[i];
	highlight(c[0], c[1], c[2], c[3], c[4], settings["highlight_type"]);
}




/*Don't create tabs option is enabled*/
if( settings["dont_create_tabs"] ){
	throw new Error("Not creating any tabs");
}


/*Get important sentences for tabs*/
for( var j=0;j<new_tags.length;j++){
	/*Reset certain varaibles*/
	body_text = new_tags[j][2];
	sentences = [];
	start = 0;
	current_year = false;


	sentence_nodes = [];
	sentence_dict = {};
	
	if( !settings.no_timeout && (new Date).getTime() - start_time > 1000 * 15 ){ /*Execution took more than 15 seconds*/
		setTimeout( function(){ alert("Could not summarize, task is taking too long..."); }, 500 );
		break;
	}

	/*Extract sentences from the paragraph*/
	/*Split the new string into sentences
	> If a string ends in a period it's a sentence unless 
	> The string is an known abbreviation like U.S. or Dr.
		> Detected by a group of text not seperated by periods
	> The string has a period inside of a quote, in which would indicate the end, ie bob." 
	> Multiple periods such as ...
	> Sentences ending in punctuation such as ? or !

	The punctuation at the end will not be removed*/
	
	for(var i=0;i<body_text.length;i++){
		/*Check if it's an end of a sentence*/
		var temp = body_text.slice(start,Math.min(body_text.length-1,i+1)).split(" "); 
		if( body_text[i] == "[" ){
			inside_citation = true;
		}else if( body_text[i] == "]" ){
			inside_citation = false; 
		}
		
		
		if( 
			[".","?","!"].includes(body_text[i]) &&    /*Check for end of sentence punctuation*/
			/*Check for spaces/special chars that make sure it's the end of an sentence*/
			( body_text[i+1] == " " || body_text[i+1] == "[" || body_text[i+1] == '"' || i >= body_text.length - 1  ) && 
			/*Check that it's really the end and not an abbreviation*/
			!isAbbrev( temp[temp.length-1] ) &&
			!inside_citation
		){
			sentences.push( body_text.slice(start,Math.min(body_text.length,i+1)) );
			start = i+1;
		}
	}

	if( sentences.length < 2 ){
		sentences = [body_text];
	}
	
	
	/*Sentences contain raw html for highlighting, convert to text only
	for better word analysis*/
	text_sentences = sentences.map(x=>strip(x).replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ') ); 
	
	/*Iterate through text sentences*/
	for(var k=0;k<text_sentences.length;k++){
		/*Remove wikipedia citations, ie [32]*/
		if( text_sentences[k].startsWith("[") ){
			text_sentences[k] = text_sentences[k].substring( text_sentences[k].indexOf("]")+2 );
		}
		
		if( contains( text_sentences[k].toLowerCase(), months ) && !isDate( text_sentences[k] ) ){
			if( current_year ){
				text_sentences[k] = "In the year " + current_year + ", " + 
					text_sentences[k].charAt(0).toLowerCase() + text_sentences[k].slice(1);
			}
		}
		
		var is_date = isDate( text_sentences[k] );
		if( is_date && isNotCitation(text_sentences[k]) && !text_sentences[k].toLowerCase().includes("learn more") ){
			/*Add context for pharses that might be out of context*/
			if( need_context_words.includes(text_sentences[k].toLowerCase().split(" ")[0]) && k > 0 
				&& (!isDate(text_sentences[k-1]) ||
					isDate(text_sentences[k-1]) == isDate(text_sentences[k])
					)
			){
				timeline.push(text_sentences[k-1] + " " + text_sentences[k]);
			}else{
				timeline.push(text_sentences[k]);
			}
			
			timeline_data.push( is_date ); 
			
			current_year = getDate( text_sentences[k], is_date );
			if( current_year < 0 ){
				current_year = -current_year + " BC";
			}
		}

		/*Calculate sentence similarity and store it in a graph*/
		for( var n=0;n<text_sentences.length;n++){
			if(!sentence_nodes[k]){
				sentence_nodes[k] = [];
			}
			sentence_nodes[k][n] = intersect( text_sentences[k], text_sentences[n] );
		}
	}
	
	/*Calculate sentence dictionary based on similarity graph*/
	for( var n=0;n<text_sentences.length;n++){
		/*Calculate the weight of the sentence based on similarity to other sentences*/
		sentence_dict[n] = sentence_nodes[n].reduce(function(a,b){return a+b;});
		
		/*Some biases, but only applied to long paragraphs as short paragraphs 
		tend to make more of an argument so there is less "fact filler" and thus 
		some biases don't apply.*/
		if( text_sentences.length > 6 ){
			/*Bias the weight based on position (Front and end are more important)*/
			sentence_dict[n] += 1 - Math.pow( Math.abs((text_sentences.length-1)/2-n) / text_sentences.length , POS_BIAS );
		}			
		
		/*Bias the weight based on number of keywords in contains*/
		sentence_dict[n] += Math.pow( containsCount( text_sentences[n], keywords ) / 10, KEY_BIAS);

		/*Bias sentence based on it's length, longer sentences tend to contain more information*/
		sentence_dict[n] += Math.pow( text_sentences[n].length / 700, LEN_BIAS ); 
	}
	
	/*Highlight important sentences in the paragraph*/
	if( Object.keys(sentence_dict).length > 0 ){
		/*Sort most important sentences in the paragraph as an array formatted as 
			[ index of sentence in array, sentence ranking in paragraph ]
		Sorted from highest rank to lowest*/
		var best_sentences = Object.keys(sentence_dict).map(function(key){return [key, sentence_dict[key]];}).sort(function(a,b){return b[1] - a[1]; });
		var best = best_sentences[0][0];
		
		/*Add best sentences in each paragraph to important sentences*/
		if( best_sentences[1] ){
			important_sentences.push( text_sentences[ best_sentences[1][0] ] );
		}
		important_sentences.push( text_sentences[ best_sentences[0][0] ] );
	}
	
}


