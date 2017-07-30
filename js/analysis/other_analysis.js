/* other_analysis.js
 *
 * Methods and varaibles required to analyze 
 * the remaining things in data analysis 
 * Such as lexical density and tone 
 *
 * Gavin Song 2017*/
 
 function positiveNegativeRatio(s){
	/*Returns an array [positive, negative] 
	of the number of positive/negative words that occur 
	in the string*/ 
	var pos = 0;
	var neg = 0;
	for( var i=0;i<positive_words.length;i++){
		pos += occurrences(s, positive_words[i]);
	}
	for( var i=0;i<negative_words.length;i++){
		neg += occurrences(s, negative_words[i]);
	}
	
	return [pos,neg];
}

function countLexical(s){
	/*Counts the number of lexical words in the sentence
	Lexical words are nouns, adjectives, verbs, and adverbs*/
	var count = 0;
	for( var i=0;i<verbs.length;i++){
		count += occurrences(s, verbs[i]);
	}
	for( var i=0;i<adjev.length;i++){
		count += occurrences(s, adjev[i]);
	}
	for( var i=0;i<nouns.length;i++){
		count += occurrences(s, nouns[i]);
	}

	return count;
}