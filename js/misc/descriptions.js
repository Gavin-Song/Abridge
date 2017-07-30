/* descriptions.js
 *
 * Methods and varaibles required to get 
 * an english sentence describing the 
 * analysis results 
 *
 * Gavin Song 2017*/
 
function getLexicalDensityDescription(density){
	/*Gets lexical density description for density (A percentage, 0-100)*/
	if( density <= 40 ){
		return "The text is very uninformative, and offers little informational value relative to its length.";
	}else if( density <= 47 ){
		return "The text is roughly as informative as normal speech (Such as interviews).";
	}else if( density <= 51 ){
		return "The text is roughly as informative as an average prose or work of fiction.";
	}else if( density <= 60 ){
		return "The text is roughly as informative as expository writing such as wiki articles or newspapers.";
	}else if( density <= 75 ){
		return "The text is highly informative and detailed, although harder to read.";
	}else{
		return "The text is incredibly informative, although it might be hard to read.";
	}
}

function getReadingLevelDescription(level){
	/*Returns description for reading level*/
	if( level < 1 ){
		return "The text is so easy to read that a baby could read it.";
	}else if( level <= 3 ){
		return "Extremely easy to read. The text is ideal for young children.";
	}else if( level <= 6 ){
		return "Very easy to read. The text is around the conversational English level for consumers.";
	}else if( level == 7 ){
		return "Fairly easy to read. The text is around 7th grade level, slightly easier than regular english.";
	}else if( level <= 9 ){
		return "Plain English. The text is around 9-10th grade level, easily understood by 13-15 year olds.";
	}else if( level <= 12 ){
		return "Fairly difficult to read. The difficulty is about that of high school texts.";
	}else if( level <= 16 ){
		return "Difficult to read. College level text, recommended for college students.";
	}else{
		return "Very difficult to read. Post-graduate level reading.";
	}
}

function getReadingLevelName(level){
	/*Get english name for reading level*/ 
	level = Math.round(level);
	if( level < 1 ){
		return "preschool";
	}else if( level <= 12 ){
		return "grade " + level;
	}else if( level <= 16 ){
		return "college year " + (level - 12);
	}else{
		return "post graduate";
	}
}

function daleReadingLevel( dale_chall_value ){
	if( dale_chall_value <= 4.9 ){
		return 4;
	}else if( dale_chall_value <= 5.9 ){
		return 6;
	}else if( dale_chall_value <= 6.9 ){
		return 8;
	}else if( dale_chall_value <= 7.9 ){
		return 10;
	}else if( dale_chall_value <= 8.9 ){
		return 12;
	}else if( dale_chall_value <= 9.9 ){
		return 14;
	}else{
		return 17;
	}
}