/* string.js 
 *
 * Stores useful string functions that reformat 
 * and analyze basic strings. 
 *
 * Gavin Song 2017*/
 
/*Some string prototype functions. Prototyping should be fine here 
as js files outside the chrome extension should not be overriden.*/
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};



/** Function that count occurrences of a substring in a string;
 * @param {String} string               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 *
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 */
function occurrences(string, subString, allowOverlapping) {
    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}


/*Some count and contains functions*/
function contains(string,a){
	/*
	string: {String}
	a:		{Array of strings}
	
	Checks if string contains an item in array a
	
	For example, if a = ['ball','dog'] and 
	string = 'the kid threw the ball'
	it would return true as 'ball' is in string 
	
	Only 1 matching element is required, and case is ignored. 
	
	Note that this is not a simple .includes, it check if the words match, so 
	if a = ['august'] and string = ['Her name is Augustine'] it would not match 
	even though 'august' is in the string, as there is no single word 'august'. 
	
	Non-words (Nonalphabetic characters) are ignored. 
	*/
	string = string.toLowerCase().split(" ").map(x=>x.replace(/[^A-Za-z]/g, ""));
	for( var i=0;i<string.length;i++){
		for( var j=0;j<a.length;j++){
			if( a[j] == string[i] ){
				return true;
			}
		}
	}
	return false;
}

function containsCount(string,a){
	/*
	string: {String}
	a:		{Array of strings}
	
	Simple counting function that counts the total number 
	of occurences an element in array a occurs in string 
	
	For example, if a = ['ab','cd','ef'] and string = 'ababcdefsomething'
	it would return 4 (2 'ab' + 1 'cd' + 1 'ef') 
	
	Unlike contains this is a simple .includes, it counts occurences 
	even if they occur in the middle of a string.
	*/
	var c = 0;
	for(var i=0;i<a.length;i++){
		c += string.split(a[i]).length-1;
	}
	return c;
}

var citation_regex = /(.*?),(.*?) \d+, \d+./g;

function isNotCitation(string){
	/*Check if string is a citation such as Vol. 190, November 12, 2016, p. 12.*/
	return !string.match(citation_regex);
}



