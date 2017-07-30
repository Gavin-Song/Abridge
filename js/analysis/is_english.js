/* is_english.js
 *
 * Simple function to check if the text 
 * is english or not. Does this by counting stop_words 
 * An approximation is only needed for this
 *
 * Gavin Song 2017*/
 
function isEnglish(sample){
	/*Checks if string sample is english
	Does so by finding most common words, then checking 
	of a majority of them is in key_words*/
	var keywords = {};

	/*Find the keywords from the entire text*/
	var words = sample.split(/\b/);
	for(var i=0;i<words.length;i++){
		words[i] = words[i].toLowerCase();
		/*Only match important words (Characters only)*/
		if( !/[^a-zA-Z]/.test(words[i]) ){
			keywords["_" + words[i]] = (keywords["_" + words[i]] || 0) + 1;
		}
	}

	/*Obtain first 20 keywords, or entire array if there aren't enough words*/
	var keywords2 = Object.keys(keywords).map(function(key){return [key, keywords[key]];});
	keywords2.sort(function(a,b){return a[1] - b[1]; }); /*Sort keywords by count*/
	keywords2 = keywords2.slice( Math.max( keywords2.length-20, 0 ) ); /*Get first 20 keywords only*/
	keywords = keywords2.map(x=>x[0].slice(1)); /*Format keywords (Ignore first char which is _)*/
	
	/*Count number of keywords which are stop words*/ 
	stop_word_keywords = keywords.filter(function(x){ return stop_words.includes(x); }).length;
	return (stop_word_keywords / keywords.length) > 0.3; 
}