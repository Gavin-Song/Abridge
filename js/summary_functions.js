/*Misc functions*/


/*Functions*/
/*===========================================================*/

function getImportantSentences(sentences){
	var chunks = [];
	for(var i = 0; i < sentences.length; i += 20) {
		chunks.push(sentences.slice(i,i+20));
	}
	var returned = [];
	for(var i=0; i< chunks.length;i++){
		returned = returned.concat( getImportantSentencesSub(chunks[i], i*20) );
	}
	return returned;
}

function getImportantSentencesSub(sentences, add){
	/*Extracts key sentences from array of sentences*/
	var sentence_nodes = [];
	for(var k=0;k<sentences.length;k++){
		for( var n=0;n<sentences.length;n++){
			if(!sentence_nodes[k]){
				sentence_nodes[k] = [];
			}
			sentence_nodes[k][n] = intersect( sentences[k], sentences[n] );
		}
	}
	
	var sentence_dict = {};
	
	for( var n=0;n<sentences.length;n++){
		/*Calculate the weight of the sentence based on similarity to other sentences*/
		sentence_dict[n+add] = sentence_nodes[n].reduce(function(a,b){return a+b;});
		
		/*Bias the weight based on number of keywords in contains*/
		sentence_dict[n+add] += Math.pow( containsCount( sentences[n], keywords ) / 10, KEY_BIAS);
	}
	
	return Object.keys(sentence_dict).map(function(key){return [key, sentence_dict[key]];}).sort(function(a,b){return b[1] - a[1]; });	
}


function isAbbrev(s){
	/*Checks if string s is an abbreviation (With periods)*/
	/*Follows the simple abbreviation patterns*/
	if(single_abbrv.includes(s.toLowerCase()) || single_abbrv.includes(s.toLowerCase().substring(0,s.length-1))){
		return true;
	}
	
	/*Possibly an abbreviation like U.S. or D.C, check if it contains periods with less than 2 letters between each period*/
	if( s.endsWith(".") )
		s = s.substring(0,s.length-1);
	s = s.split(".");
	return s.length > 1 && s.filter(function(x){return x.length <= 2;}).length > 0;
}


function intersect(sentence1,sentence2){
	/*Evaluates "similarity" between 2 sentences*/
	sentence1 = sentence1.toLowerCase().split(" ");
	sentence2 = sentence2.toLowerCase().split(" ");
	
	var w = sentence1.filter(function(n) {
		/*Remove sentence endings for better word matching*/
		n = n.replace(".","").replace(",","").replace(";","").replace("?","").replace("!",""); 
		if( stop_words.includes(n) ){
			return false;
		}
		return sentence2.indexOf(n) !== -1;
	}).length;
	return w / ( (sentence1.length + sentence2.length) / 2 );
}

function roundToDigits(num,per,leading){
	/*Rounds num to percision, and adds <leading> leading 0s*/
	if( Number.isNaN(num) ){
		return "0." + "0".repeat(per);
	} 
	
	try{
		zeros = "0".repeat( leading - Math.floor(Math.log10(num)) - 1 );
	}catch(e){
		zeros = "";
	}
	return zeros + num.toFixed(per);
}

function roundNaN(num){
	/*Rounds num, but returns string if num is null*/
	return Number.isNaN(num) ? "unknown" : Math.round(num);
}