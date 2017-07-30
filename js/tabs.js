/*Create the tabs*/

/*Precompute getDates for each timeline element*/
var precomputed_timeline = {};
for( var i = 0;i<timeline.length;i++){
	precomputed_timeline[timeline[i]] = +getDate(timeline[i],timeline_data[i]) + monthValue(timeline[i]);
}


/*Sort sentences by date*/
timeline = timeline.sort(function(a,b){
	var date1 = precomputed_timeline[a];
	var date2 = precomputed_timeline[b];
	
	return date1 - date2;
});

/*Pre-summary sentence fixing*/
/*===========================*/
function doesntContainsCopyRight(s){
	return !(s.includes("\u00A9") || s.includes("(c)"));
}



/*Remove citations from wiki text*/
timeline = timeline.map( x=> x.replace(/\[\d+\]/g,"") ).map( x=> x.replace(/\[\d+\]/g,"").replaceAll("citation needed]","") )
				   .map( x=> x.replace('">',"").replaceAll("page needed] ","") )
				   .map( x=> x.replace(/\[[a-z]\]/g,"").replace(/\d+\]/g,"") )
				   .filter( doesntContainsCopyRight );
important_sentences = important_sentences.map( x=> x.replace(/\[\d+\]/g,"").replaceAll("citation needed]","") )
				   .map( x=> x.replace('">',"").replaceAll("page needed] ","") )
				   .map( x=> x.replace(/\[[a-z]\]/g,"").replace(/\d+\]/g,"") )
				   .filter( doesntContainsCopyRight )
				   .filter( function(x){
					   return !x.toLowerCase().includes("learn more");
				   });
										 
/*Count bad words, remove phrases with "bad words" if the count <= 3*/
var bad_word_count = {};
for( var i = 0;i < bad_words; i++ ){
	bad_word_count[bad_words[i]] = 0;
	bad_word_count[bad_words[i]] += timeline.filter(function(x){return x.includes(badwords[i]);}).length;
	bad_word_count[bad_words[i]] += important_sentences.filter(function(x){return x.includes(badwords[i]);}).length;
}
for( var i = 0;i < bad_words; i++ ){
	if( bad_word_count[bad_words[i]] <= 3 ){
		timeline = timeline.filter(function(x){return !x.includes(badwords[i]);});
		important_sentences = important_sentences.filter(function(x){return !x.includes(badwords[i]);});
	}
}

										 
/*Fix quotes in sentences*/
timeline = timeline.map( x=> x.startsWith('" ') ? x.replace('" ','') : x );
important_sentences = important_sentences.map( x=> x.startsWith('" ') ? x.replace('" ','') : x );


/*Remove malformated sentences*/
function isBroken(x){
	/*Checks if a sentence is malformed
	Malformed sentences are:
		> Starts with [and, or] - A sentence was probably split incorrectly 
		> Is shorter than 6 words - Likely is meaningless or of little value 
		> Ends with a ? - Likely a question and not a fact 
	*/
	return !(x.startsWith("and") || x.startsWith("or") || x.split(" ").length < 6) || x.endsWith("?"); 
}

important_sentences = important_sentences.filter( isBroken );
timeline = timeline.filter( isBroken );

/*Remove non sentence ending characters at end*/
function removeNonEndings(x){
	if( ![".","!","?"].includes(x.slice( x.length - 1 )) ){
		return x.slice(0, x.length-1);
	}
	return x;
}

important_sentences = important_sentences.map( removeNonEndings );
important_sentences = important_sentences.filter( isNotCitation );
timeline = timeline.map( removeNonEndings );


var tab1_html, tab2_html, tab3_html, tab4_html;
tab1_html = ""; tab2_html = ""; tab3_html = ""; tab4_html = "";

/*Checks if article is in english, needed to add a warning note on 
  certain features that will not work well on non-english articles.*/
var is_english = isEnglish( important_sentences.join(" ") );


/*Compute some stuff*/ 

var number_to_show = 20;

keywords.sort();

keywords = keywords.map( x=> "<span class='summary_keyword'>" + x + "</span>" );
/*Summerize the entire article by getting most important sentences from entire artcle*/
important_sentences = important_sentences.filter(function(x){ return !x.includes('"'); } ); /*Exclude quotes*/
var importance_data = getImportantSentences(important_sentences);

/*Sort sentences by the order they appear in the article*/
importance_data = importance_data.sort(function(a,b){return a[0] - b[0]; });

/*Compute average "importance" value*/
if( importance_data.length > 0 ){
	var average_importance = importance_data.map(x=>x[1]).reduce(function(a,b){ return a + b;}) / importance_data.length;
}else{
	var average_importance = 1;
}


/*First tab 
-------------------------------------------
Create an abridged version of the article, 
complete with a title, an image and around 
10 sentence summary 
*/

/*Obtain the article title*/
var title;
if( document.getElementsByTagName("h1")[0] ){
	title = "";
	var h1_tags = document.getElementsByTagName("h1");
	for( var i = 0; i < h1_tags.length; i++ ){
		if( h1_tags[i].innerText.length > title.length ){
			title = h1_tags[i].innerText;
		}
	}
}else if( document.title ){
	title = document.title;
}else if( keywords[0] ){
	title = "Article about " + keywords[0];
}else{
	title = "[Could not find title]";
}

tab1_html += "<h1 class='summary_h1'>" + title + "</h1>";
tab1_html += "<div id='summary_image' style='width:35%'></div>";

var importance_data_tab1 = importance_data.filter( function(x){
	return x[1] > average_importance;
});

var temp = Math.min(importance_data_tab1.length,12);
for( var i=0;i<temp;i++){
	var current_sentence = important_sentences[importance_data_tab1[i][0]];
	tab1_html += current_sentence + " ";

	
	/*Divide into paragraphs if article is long enough*/
	if( i%4 == 3 && temp >= 8 ){
		tab1_html += "<br><br>";
	}
}


/*Wrap with padding*/
tab1_html = "<div class='summary_tab_inside'>" + tab1_html + "</div>";

/*Second tab
-------------------------------------------
Handles the scond tab, which is a summary
of the entire article, along with keywords 
and various other stuff.
*/


tab2_html += "<input type='text' id='summary_keyword_bar' class='summary_search_bar' placeholder='Search by keywords' title='Seperate phrases by commas'><br>"
		   + "<input type='range' class='summary_range_slider' id='summary_size' min='4' max='" +  important_sentences.length + "' step='1'>";
tab2_html += "<br><h2 class='summary_h2'></h2>";
tab2_html += keywords.join(" ");
tab2_html += "<br><h2 class='summary_h2'></h2>";
tab2_html += "<div id='summary_length'></div><hr class='summary_hr' style='visibility:hidden'>";


var summary_html = "";
for( var i=0;i<Math.min(importance_data.length,number_to_show);i++){
	/*Get current sentence, highlight keywords*/
	var current_sentence = important_sentences[importance_data[i][0]];
	
	/*Below average importance = gray, otherwise black*/
	summary_html += (importance_data[i][1] < average_importance ? 
		"<span id='summary_" + importance_data[i][1] + "' style='color:gray'>" : "<span id='summary_" + importance_data[i][1] + "' >")
		+ current_sentence + "</span><br><br>";
}

tab2_html = tab2_html + "<span id='summary_everything'>" + summary_html + "</span>";
tab2_html += "<button class='summarize_button' id='copy_summary_full'>Copy All Facts</button> <button class='summarize_button'  id='copy_summary_important'>Copy Important Facts</button><br><br>"; 

var tab2_average_importance = average_importance;
var tab2_importance_data = importance_data;

/*Wrap with padding*/
tab2_html = "<div class='summary_tab_inside'>" + tab2_html + "</div>";


/*Third tab
-------------------------------------------
Timeline and date related stuff 
*/

var timeline_html = "";

/*Compute average "importance" value*/
importance_data = getImportantSentences(timeline);
var mapped_importance = importance_data.map(x=>x[1]);
var average_importance;

if( importance_data.length > 0 ){
	average_importance = mapped_importance[ Math.floor(mapped_importance.length * 0.3) ];
}else{
	average_importance = 0.5;
}

for( var i=0;i<timeline.length;i++){
	var current_date = getDate(timeline[i]);
	current_date; /*JS is shit, sometimes if statement doesn't catch*/
	
	if(!current_date){
		continue;
	}
	
	
	current_date = current_date < 0 ? -current_date + " BC" : current_date;
	var importance = importance_data.filter( function(x){ return x[0] == i; } )[0][1];
	
	timeline_html += "<tr id='timeline_" + importance + "'><th><div class='summary_timeline_year'>" + current_date +
		"<br><span class='summary_timeline_month'>" + getMonthName( timeline[i] ).toUpperCase() + "</span>" +
		"</div></th><th " + (importance>average_importance ? "style='color:gray'": "") + ">" + timeline[i] + "</tr>";
}

tab3_html = "";
tab3_html += "<div class='summary_tab_inside' id='timeline_tab_inside'>"
		   + "<button class='summarize_button' id='copy_timeline_full'>Copy Full Timeline</button> <button class='summarize_button' id='copy_timeline_important'>Copy Condensed Timeline</button><br>"
		   + "<div style='margin-top: 10px'></div>"
		   
		   + "<label class=\"control control-checkbox\">"
		   + "<input class='regular-checkbox' type='checkbox' id='timeline_importance'>Show important events only</input>"
		   + "<div class=\"control_indicator\"></div>"
		   + "</label>"
		   
		   + "<h2 class='summary_h2'></h2>"
		   + "<table class='summary_timeline_table' id='timeline_table'>" + timeline_html + "</table></div>";


/*Fourth tab
-------------------------------------------
Takes the most important words in the article 
and does various tests on the sentences such as 
	> Lexical complexity - How informative the article is 
	> Gunning Fog Index - Reading level the article is for 
	> Flesch test - Another reading level test 
	> Positive/negative tone 
*/

/*Reading level calculation*/
var lexical_complexity = important_sentences.slice(0,8).join(" ");
lexical_complexity = Math.min(1, countLexical(lexical_complexity) / lexical_complexity.split(" ").length);


/*Short intro*/
tab4_html = "This section is about data that is extracted on the text. Various calculations such as reading level (How hard the text is to read),";
tab4_html += " lexical density (How informative the text is) and sentence statistics such as word count and tone.";
tab4_html += "<br>";

if( !is_english ){
	tab4_html += "<br><div class='summary_language_warning'>This article might not be in english, which may affect the accuracy of this analysis</div>";
}

/*Get words from each sentence, replace common non-alphabetic characters 
Then filter out by words that are alphabetic characters only*/
var important_sentences2 = important_sentences.slice(0,20);
var words = important_sentences2.join(" ").split(" ")
	.map(x=>x.replace(".","").replace(",","").replace("?","").replace("!",""))
	.filter(function(x){return !/[^a-zA-Z]/.test(x) && x.replace(" ","").length > 0;}); 

		
		
var gunning_reading_level = gunningFogIndex( important_sentences2, words );
var flesch_reading_level  = fleschDifficultyTest( important_sentences2, words );
var dale_chall_level      = daleChallDifficulty( important_sentences2, words );

var reading_level = gunning_reading_level;

tab4_html += "<br><h2 class='summary_h2'>Reading Level</h2>";
tab4_html += getReadingLevelDescription(reading_level) 
		+ " The text has an estimated <b>reading level of a " + getReadingLevelName( reading_level )
		+ " text</b>. (Reading levels are adjusted from the <a href='https://en.wikipedia.org/wiki/Gunning_fog_index' target='_blank'>gunning-fog index formula</a>)<br>";

tab4_html += ''
	+ "<p class='summary_code'>Gunning fog index: " +  colorify( roundToDigits( gunning_reading_level, 4, 2 ), analysis_number_color )
		+ "	&nbsp;	&nbsp;	&nbsp;(Reading grade level of " + roundNaN(gunning_reading_level) + ")"			
	+ "<br>Flesch Kincaid test: " + colorify( roundToDigits( flesch_reading_level[0], 4, 2), analysis_number_color )
		+ "	&nbsp;	&nbsp;	&nbsp;(Reading grade level of " + roundNaN(flesch_reading_level[1]) + ")"
	+ "<br>Dale Chall formula: " + colorify( roundToDigits( dale_chall_level, 4, 2), analysis_number_color )
		+ "	&nbsp;	&nbsp;	&nbsp;(Reading grade level of " + daleReadingLevel(dale_chall_level) + ")"
	+ "</p><br>";
	
	
tab4_html += "<h2 class='summary_h2'>Reading Time</h2>";
tab4_html += "The text has a silent reading time of about <b>" + Math.round(total_words/280) + " minute(s)</b> and"
		   + " an oral reading time of about <b>" + Math.round(total_words/151) + " minute(s)</b>. (Assuming silent reading speed of 280 WPM and oral reading speed of 151 WPM)"
		   + "<br><br>";
			


/*Get lexical density*/

tab4_html += "<h2 class='summary_h2'>Lexical Density</h2>";
tab4_html += getLexicalDensityDescription(lexical_complexity*100) 
		  + " ( <a href='https://en.wikipedia.org/wiki/Lexical_density' target='_blank'>Lexical density</a> formula: Number of lexical tokens / Number of words * 100 ).<br>";
tab4_html += "<p class='summary_code'>Lexical density: " + colorify( roundToDigits( lexical_complexity*100, 5, 2 ), analysis_number_color ) + "%</p><br>";

tab4_html += "<h2 class='summary_h2'>Text Statistics</h2>";
tab4_html += "Statistics are only approximate, but are pretty accurate.";
tab4_html += "<p class='summary_code'>Total sentences: " + colorify( total_sentences, analysis_number_color )
		  + "<br>Total words: " + colorify( total_words, analysis_number_color )
		  + "<br>Total characters: " + colorify( total_chars , analysis_number_color )
		  + "<br>Total paragraphs: " + colorify( total_paragraphs , analysis_number_color )
		  + "<br><br>Average sentences per pargraph: " + colorify( roundToDigits(total_sentences/total_paragraphs, 4, -1), analysis_number_color )
		  + "<br>Average words per paragraph: " + colorify( roundToDigits(total_words/total_paragraphs, 4, -1), analysis_number_color )
		  + "<br>Average words per sentence: " + colorify( roundToDigits(total_words/total_sentences, 4, -1), analysis_number_color )
		  + "</p><br>";

var tone = positiveNegativeRatio( important_sentences.join(" ") );

tab4_html += "<h2 class='summary_h2'>Article Tone</h2>";
tab4_html += "A neutral article will have a ratio of around 1. P/N (Positive to negative) Ratios larger than 1 are more positive, less than 1 are more negative. The ratio is adjusted as there are more negative words than positive ones.<br>";
tab4_html += "<p class='summary_code'>"
		  +  "Positive word count: " + colorify( tone[0], analysis_number_color )
		  +  "<br>Negative word count: " + colorify( tone[1], analysis_number_color )
		  +  "<br>Adjusted P/N ratio: " + colorify( roundToDigits(tone[0]/(tone[1] * 0.6), 4, -1), analysis_number_color )
		  +  "</p>";


										  
/*Wrap with padding*/
tab4_html = "<div class='summary_tab_inside'>" + tab4_html + "</div>";

if( document.getElementById("summary_tab1") ){
	throw new Error("already summarized");
}

/*Create the tabs at the bottom which store the information*/
document.body.innerHTML += "<div class='summary_tab' id='summary_tab1'>" + tab1_html + "</div>"
						+  "<div class='summary_tab' id='summary_tab2'>" + tab2_html + "</div>"
						+  "<div class='summary_tab' id='summary_tab3'>" + tab3_html + "</div>"
						+  "<div class='summary_tab' id='summary_tab4'>" + tab4_html + "</div>"
						+  "<div class='summary_tab' id='summary_tab5'></div>"
						
						+  "<button class='summary_bottom_tab1 summary_bottom_tab' id='bottom_tab1' onClick='openClose(\"1\")'> Summary</button>"
						+  "<button class='summary_bottom_tab2 summary_bottom_tab' id='bottom_tab2' onClick='openClose(\"2\")'> Key Facts</button>"
						+  "<button class='summary_bottom_tab3 summary_bottom_tab' id='bottom_tab3' onClick='openClose(\"3\")'> Timeline</button>"
						+  "<button class='summary_bottom_tab4 summary_bottom_tab' id='bottom_tab4' onClick='openClose(\"4\")'> Data Analysis</button>"
						+  "<button class='summary_bottom_tab5 summary_bottom_tab' id='bottom_tab5' onClick='toggleState()'>&#9776;</button>" 
						+  "<button class='summary_bottom_tab6 summary_bottom_tab' id='bottom_tab6' onClick='removeAllTabs()'>&#x2715;</button>";


/*Fourth tab
-------------------------------------------
Obtains all images in the articles above a 
certain size, and lists them in a nice table 
*/

var all_images = Array.prototype.map.call(document.images, img => img.src);
var images = [];

for( var i=0;i<all_images.length;i++){
	images.push(new Image());
	images[i].src = all_images[i];
}

setTimeout(function(){
	var best_image = 0;
	for( var i=0;i<images.length;i++ ){
		var img = images[i];
		var height = img.height;
		var width = img.width;
		
		if( height > 150 && width > 150 ){
			if( images[best_image].width < width && width/height < 2.3 ){
				best_image = i;
			}
			if( i > images.length/2.5 ){
				break;
			}
		}
	}	
	
	document.getElementById("summary_image").innerHTML = "<img class='tab1_image' src='" + images[best_image].src + "'>";
	/*If width/height ratio > 1.5, make it full length across*/
	if( images[best_image].width/images[best_image].height > 1.5 && images[best_image].width > 600 ){
		document.getElementById("summary_image").style.width = "100%";
	}
	
},2000);


/*Code for the first tab*/
function searchResultsByKeyWord(input){
	var summary_html = "";
	input = input ? input.toLowerCase().split(",").map(x=>x.trim()) : "";
	
	var new_importance_data = tab2_importance_data;

	if( input != "" ){
		new_importance_data = new_importance_data.filter(function(x){
			return containsCount(important_sentences[x[0]].toLowerCase(),input);
		});
	}
	
	new_importance_data = new_importance_data.sort(function(a,b){return a[0] - b[0]; });
	var all_text = "";
	
	for( var i=0;i<new_importance_data.length;i++){
		if( i >= number_to_show - 1 ){
			break;
		}
		
		/*Get current sentence, highlight keywords*/
		var current_sentence = important_sentences[new_importance_data[i][0]];
		all_text += current_sentence + " ";
		
		/*Below average importance = gray, otherwise black*/
		summary_html += (new_importance_data[i][1] < average_importance ? 
			"<span id='summary_" + new_importance_data[i][1] + "' style='color:gray'>" : "<span id='summary_" + new_importance_data[i][1] + "' >")
			+ current_sentence + "</span><br><br>";
	}
	
	updateReadLength(all_text);
	
	return summary_html;
}

function searchResultsByAmount(input){
	number_to_show = input; 
	document.getElementById("summary_size").value = input;
	document.getElementById("summary_everything").innerHTML = searchResultsByKeyWord(document.getElementById("summary_keyword_bar").value);
}

function updateReadLength(txt){
	var all_text = txt ? txt.split(" ") : important_sentences.slice(0,number_to_show).join(" ").split(" ");
	var time_to_read = Math.round(all_text.length / 280);
	var key_points = (Math.min(number_to_show, important_sentences.length)-1);
	key_points = Math.max(key_points,0);
	
	document.getElementById('summary_length').innerHTML = time_to_read + " MIN (" + all_text.length + " WORDS) 	&nbsp; 	&nbsp; 	&nbsp;"
		+ "SUMMARY LENGTH: " + key_points + " KEY POINTS  &nbsp; &nbsp; (" + Math.round(100 - all_text.length * 100 / total_words) + "% reduction)";
}

document.getElementById('summary_keyword_bar').onkeypress = function(e) {
    var event = e || window.event;
    var charCode = event.which || event.keyCode;

    if ( charCode == '13' ) {
		document.getElementById("summary_everything").innerHTML = searchResultsByKeyWord(this.value);
		return false;
    }
}

document.getElementById("summary_size").oninput = function(e){
	searchResultsByAmount(this.value);
}

document.getElementById("copy_summary_full").onclick = function(){
	copyToClipboard(
		"Full auto-generated summary of the article comprised of the key sentences in each paragraph.\n" +
		"--------------------------------------------------------------------------------------------\n\n" + 
		important_sentences.join("\n\n")
	);
}

document.getElementById("copy_summary_important").onclick = function(){
	var to_copy = "";
	for( var i=0;i<tab2_importance_data.length;i++){
		var current_sentence = important_sentences[tab2_importance_data[i][0]];
		if( tab2_importance_data[i][1] > tab2_average_importance ){
			to_copy += current_sentence + "\n\n";
		}
	}
	copyToClipboard(
		"Auto-generated summary of the article comprised of the most important sentences in the article.\n" +
		"--------------------------------------------------------------------------------------------\n\n" + 
		to_copy
	);
}

document.getElementById("copy_timeline_full").onclick = function(){
	copyToClipboard(
		timeline.map(function(x){
			current_date = getDate(x);
			current_date = current_date < 0 ? -current_date + " BC" : current_date;
			return current_date + ": " + x;
		}).join("\n\n")
	);
}

document.getElementById("copy_timeline_important").onclick = function(){
	var to_copy = "";
	for( var i=0;i<timeline.length;i++){
		var current_date = getDate(timeline[i]);
		current_date = current_date < 0 ? -current_date + " BC" : current_date;
		var importance = importance_data.filter( function(x){ return x[0] == i; } )[0][1];
		
		if( importance > average_importance ){
			to_copy += current_date + ": " + timeline[i] + "\n\n";
		}
	}

	copyToClipboard(to_copy);
}

document.getElementById("timeline_importance").onclick = function(){
	var new_html = "";
	for( var i=0;i<timeline.length;i++){
		var importance = importance_data.filter( function(x){ return x[0] == i; } )[0][1];
		if( document.getElementById("timeline_importance").checked && importance > average_importance ){
			continue;
		}
		
		var current_date = getDate(timeline[i]);
		current_date = current_date < 0 ? -current_date + " BC" : current_date;
		
		new_html += "<tr id='timeline_" + importance + "'><th><div class='summary_timeline_year'>" + current_date +
			"<br><span class='summary_timeline_month'>" + getMonthName( timeline[i] ).toUpperCase() + "</span>" +
			"</div></th><th " + (importance>average_importance ? "style='color:gray'": "") + ">" + timeline[i] + "</tr>";
	}
	
	document.getElementById("timeline_table").innerHTML = new_html;
}

searchResultsByAmount(20);

/*Add the empty states for tabs 1-3*/
if( tab2_importance_data.length == 0 ){
	var broken_html = "<div class='summary_tab_inside'>"
					+ "<img style='width:60%;margin-left:20%;position:relative' src='" + chrome.extension.getURL("img/summary_missing.png") + "'>"
					+ "<br><h2 style='text-align:center'>No Summary Results</h2>"
					+ "There don't appear to be any summary results. Some possible reasons might be that "
					+ "the article is in a non-latin alphabet text, or the article is too short. You can also "
					+ "try enabling Advanced Settings -> 'Search All Tags'.<br><br>"
					+ "If none of the above hold, and problems persist consider submitting a bug report on "
					+ "the github page (<a target='_blank' href='" + github_page + "'>" + github_page + "</a>)"
					+ "<br><br>"
					+ "</div>";
	document.getElementById("summary_tab1").innerHTML = broken_html;
	document.getElementById("summary_tab2").innerHTML = broken_html;
}
if( timeline.length == 0 ){
	var broken_html = "<div class='summary_tab_inside'>"
					+ "<img style='width:60%;margin-left:20%;position:relative' src='" + chrome.extension.getURL("img/timeline_missing.png") + "'>"
					+ "<br><h2 style='text-align:center'>No Timeline Results</h2>"
					+ "<p style='text-align:center'>There don't appear to be any timeline results. &macr;\\_(&#12484;)_/&macr;<br>"
					+ "If this wasn't supposed to happen, try enabling Advanced Settings -> 'Search All Tags'</p>"
					+ "</div>";
	document.getElementById("summary_tab3").innerHTML = broken_html;
}



