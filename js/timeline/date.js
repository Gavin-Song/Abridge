/* date.js
 *
 * Methods and varaibles required to analyze 
 * the remaining things in data analysis 
 * Such as lexical density and tone 
 *
 * Gavin Song 2017*/
 
 function isDate(s){
	/*Checks if there is a date inside of s. If so return 
	the date as a string, else return false*/

	s = s.toLowerCase();
	
	/*Risky assumption that a 4 digit number is a date*/
	var four_digit_match = s.match(four_digit_exp);
	if( four_digit_match ){
		for( var i=0;i<four_digit_match.length;i++){
			/*The word year is after, for example 1253 years. Probably false*/
			if( s.includes( four_digit_match[i] + "year") ){
				continue;
			}
			
			/*Get the word after the 4 digit number*/
			var word_after = s.split( four_digit_match[i] )[1].split(" ")[0].replaceAll(" ","").toLowerCase()
				.replace(/[^A-Za-z]/g, "");
			
			/*Word after is either a unit (ie mg, cm) 
			or a plural word (More than 4 letters and ends with s)
			
			For example, 1230 cm or 1500 tables*/
			if( units.includes( word_after ) || 
				(word_after.length > 4 && word_after.endsWith("s"))
			){
				continue;
			}

			
			/*Fix for not matching mid-[year] like mid-1960s*/
			if( !s.includes( "mid" + four_digit_match[i] ) ){
				/*Ignore false date ranges, ie ABC-1234 or 8000-12*/
				if( s.substr( s.indexOf(four_digit_match[i]) + 5, 1 ) == "-" ){
					if( +s.substr( s.indexOf( four_digit_match[i]) + 6, 4 ).replace(/\D/g,'') < +four_digit_match[i].replace(/\D/g,'') ){
						continue;
					}
				}
				/*Values like 2000+ are probably not dates*/ 
				if( s.substr( s.indexOf(four_digit_match[i]) + 5, 1 ) == "+" ){
					continue; 
				}
				/*Ignore non-date formatted things, ie A5024 or !1234*/
				if( s.substr( s.indexOf(four_digit_match[i]), 1 ).match(/[^ /\-]/g) ){
					continue;
				}
				/*Ignore non-date ranges,ie ?&#-1234 or ISO-1234*/
				if( s.substr( s.indexOf(four_digit_match[i]) - 1, 2 ).match(/[^0-9]-/g) ){
					continue;
				}
			
				/*Checks if word before is likely an abbreviation code, ie ISO 1234*/
				var word_before = s.split( four_digit_match[i] )[0].split(" ");
				word_before = word_before[word_before.length-1].replaceAll(" ","").replace(/[^A-Za-z]/g, "");
				if( word_before.length == 3 && !contains(word_before,stop_words)){
					continue; 
				}
				
				/*0000 and 9999 are likely not significant dates*/
				if( +four_digit_match[i].replace(/\D/g,'') == 0 || +four_digit_match[i].replace(/\D/g,'') == 9999 ){
					continue; 
				}
			}
			
			/*Not a multiple thing, ie 5.3 x 1245*/ 
			if( s.includes( "x" + four_digit_match[i] ) ){
				continue;
			}
			
			/*Probably correct*/
			return four_digit_match[i].replace(/\D/g,'');
		}
	}
	
	/*Check the number against advanced date regexes, ie for 1 AD or etc...*/
	if( s.match(advanced_date_exp) ){
		return s.match(advanced_date_exp)[0].replace(/\D/g,'');
	}
	if( s.match(advanced_date_exp2) ){
		return s.match(advanced_date_exp2)[0].replace(/\D/g,'');
	}
	
	return false;
}



function getDate(s, is_date_data ){
	/*Extracts a date (4 digit year) from a string, remove non-numeric characters
	is_date_data is the result of isDate(s), if not given then it calculates isDate(s)
	*/
	s = s.toLowerCase();
	var d = is_date_data || isDate(s);
	if( s.match( bce_exp ) || s.match( bce_exp2 )){
		d = -(+d);
	}
	return d;
}	



function monthValue(s){
	/*Assigns a value to the string (1/13) * (month index + 1) + (day/32), used for 
	timeline sorting purposes 
	
	For example if the string was 'In March 21st something happened' 
	This function would return (1/13)*3 + (21/32) */
	
	string = s.toLowerCase();
	for( var i=0;i<months.length;i++ ){
		if( string.includes(months[i]) ){
			var index = string.indexOf(months[i]); /*Get inital index of month*/
			
			/*Checks if month is valid or is just a string inside a word
			For example, may is valid but Maycomb would not be*/ 
			var after = string.substr( index + months[i].length, 1);
			var before = string.substr( index - 1, 1 );
			
			if( alphanumeric_exp.test(before) || alphanumeric_exp.test(after) ){
				continue;
			}
			
			/*Checks for day after the month, ie November 24*/
			day = string.substr( index + months[i].length + 1, 4); /*Get the day*/
			day = day.replace(/\D/g,''); /*Remove non-numeric characters*/
			day = +day; /*Make day a float*/
			
			if( day > 31 ){ /*Not a valid date, maybe part of a year*/
				/*Try DD/MM format*/
				day = string.substr( index - 4, 4); /*Get the day*/
				day = day.replace(/\D/g,''); /*Remove non-numeric characters*/
				day = +day; /*Make day a float*/
				
				if( day > 31 ){ /*Not valid, maybe no date at all*/
					day = 0;
				}
			}
			
			/*Check for the word 'May' which can be used differently 
			for example, May I use the bathroom?*/
			if( (s.includes("May") && !s.startsWith("May") && !s.match( /[^A-Za-z] May/g )) || day <= 31 ){
				/*Do nothing, date is valid*/
			}
			else{ 
				continue;
			}
			
			return (1/13) * (i%12+1) + (day/32)*(1/13);
		}
	}
	return 0;
}

function getMonthName(s){
	/*Get the month of the string, if it exists 
	Otherwise return an empty string. 
	
	For example, if string='In August George Washington did something' 
	this function would return 'august' */ 
	string = s.toLowerCase();
	for( var i=0;i<months.length;i++ ){
		if( string.includes(months[i]) ){
			var index = string.indexOf(months[i]); /*Get inital index of month*/
			
			/*Checks if month is valid or is just a string inside a word*/ 
			var after = string.substr( index + months[i].length, 1);
			var before = string.substr( index - 1, 1 );

			if( alphanumeric_exp.test(before) || alphanumeric_exp.test(after) ){
				continue;
			}
			
			/*Check for the word 'May' which can be used differently 
			for example, May I use the bathroom?*/
			if( (s.includes("May") && s.startsWith("May")) ){
				continue;
			}
			if( months[i%12] == "may" && !s.includes("May") ){
				continue;
			}
			
			return months[i%12];
		}
	}
	return "";
}

