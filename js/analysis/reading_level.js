/* reading_level.js
 *
 * All the methods required to analyze 
 * the reading level of the article
 *
 * Gavin Song 2017*/
 
 function syllables(word) {
	/*Count syllables in the word*/
	word = word.toLowerCase();    
	if(word.length <= 3) { 
		return 1; 
	}         
	/*Magic vowel regex replace thing, do not touch*/
	word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');   
	word = word.replace(/^y/, ''); 
	var matched = word.match(/[aeiouy]{1,2}/g);
	if(!matched){
		return 1;
	}
	return matched.length;                   
}

function fleschDifficultyTest(sentences, words){
	/*Computes 2 values for the fleschDifficultyTest
	A raw value and a grade value, returns array*/
	var total_syllables = 0;
	for( var i=0;i<words.length;i++){
		total_syllables += syllables(words[i]);
	}
	
	return [206.835 - 1.105 * (words.length/sentences.length) - 84.6 * (total_syllables / words.length),
		0.39 * (words.length/sentences.length) + 11.8 * (total_syllables/words.length) - 15.59];
}

function gunningFogIndex(sentences, words){
	/*Compute the gunning-fox index for a string s*/
	var fog_index = words.length / sentences.length;

	var difficult_words = words.filter( function(x){
		/*A difficult word is defined as 
			> Having 3 or more syllables 
			> Not a proper noun 
		Common suffixes are removed*/ 
		if( x[0] === x[0].toUpperCase() ){ /*Proper noun (Probably)*/
			return false;
		}
		
		/*Remove suffixes at the end*/
		for( var i=0;i<suffixes.length;i++){
			if( x.length > suffixes[i].length && x.endsWith( suffixes[i] ) ){
				x = x.slice(0, x.length - suffixes[i].length );
			}
		}
		
		return syllables(x) >= 3;
	});

	return 0.4 * (fog_index + 100 * (difficult_words.length/words.length) );
}

function daleChallDifficulty(sentences, words){
	var ASL = words.length / sentences.length;
	var PDW = (words.length - words.filter( function(x){ return easy_words.includes(x.toLowerCase()); } ).length) / words.length;
	PDW *= 100;
	var raw = 0.1579 * (PDW) + 0.0496 * ASL;
	
	if( PDW > 5 ){
		return raw + 3.6365;
	}
	return raw; 
}
