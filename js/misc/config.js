/* config.js
 *
 * Config variables
 *
 * Gavin Song 2017*/
 
var extension_name = "Abridge";
var extension_version = "1.0.0";
var github_page = "https://github.com/Gavin-Song/abridge";
 
var POS_BIAS = 1.50; /*Position bias, closer to 0 = more bias*/
var KEY_BIAS = 1.15; /*Keyword bias,  closer to 0 = more bias*/
var LEN_BIAS = 1.50; /*Length bias,   closer to 0 = more bias*/

var SECOND_MAX_DIF = 0.15; /*Max difference in rank between best and second best sentence*/

/*These colours are only used to determine pre-defined darker shades of 
some colours, actual colours used in highlighting is below in the colors 
dictionary*/
var TEXT_COLOR = "black"; /*Default text color for highlighting*/
var COLOR_ORANGE = "#FFA64D";
var COLOR_GREEN  = "#5BEB71";
var COLOR_RED    = "#FF7777";
var COLOR_DGREEN = "#B6D4BA";
var COLOR_YELLOW = "#EDFA00";
var COLOR_BLUE   = "#69BBFF";

var COLOR_DARK_ORANGE = "#E6A800";
var COLOR_DARK_BLUE   = "#003AE8";
var COLOR_DARK_YELLOW = "#E8AE00";

/*Colours used for highlighting*/
var colors = {
	"blue": "#69BBFF",
	"green": "#B6D4BA",
	"red" : "#FF7777",
	"brown" : "#D16900",
	"purple": "#D71DF0",
	"orange": "#FFA64D",
	"yellow": "#EDFA00",
	"light_blue": "#30DCF2",
	"pink": "#FF78DD",
	"gray": "#DDD",
	"none": "transparent"
};

/*The color of the text in the 'data analysis' tab
of the numbers in the code boxes*/
var analysis_number_color = "#3B778F";
