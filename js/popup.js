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



chrome.storage.sync.get('settings',function(settings){
	settings = settings.settings;
	if(!settings){
		settings.debug = false; 
		settings.search_all = false; 
		settings.no_timeout = false; 
		settings.search_hidden = false;
		settings.dont_create_tabs = false;
		
		settings.highlight_type = "underline";
		settings.highlight_key_phrase = "orange";
		settings.highlight_key_event = "yellow";
		settings.highlight_key_stat = "blue";
	}
	
	document.getElementById("debug_mode").checked = settings.debug;
	document.getElementById("search_all").checked = settings.search_all;
	document.getElementById("no_timeout").checked = settings.no_timeout;
	
	document.getElementById("search_hidden").checked = settings.search_hidden;
	
	document.getElementById("dont_create_tabs").checked = settings.dont_create_tabs;
	
	document.getElementById("highlight type").value = settings.highlight_type;
	document.getElementById("highlight-color-1").value = settings.highlight_key_phrase;
	document.getElementById("highlight-color-2").value = settings.highlight_key_event;
	document.getElementById("highlight-color-3").value = settings.highlight_key_stat;
	
	document.getElementById("square1").style.borderColor = colors[settings.highlight_key_phrase];
	document.getElementById("square2").style.borderColor = colors[settings.highlight_key_event];
	document.getElementById("square3").style.borderColor = colors[settings.highlight_key_stat];
});

function main() {
	/*Load in settings*/
	var settings = saveSettings();
	
	chrome.tabs.executeScript({code: 
		'document.getElementById("settings").innerHTML = "' + JSON.stringify(settings).replace(/[\""]/g, '\\"') + '";'
	});
	
	
	/*Load all the important files*/ 
	chrome.tabs.executeScript({file: 'js/misc/config.js'});
	
	chrome.tabs.executeScript({file: 'js/analysis/words.js'});
	chrome.tabs.executeScript({file: 'js/analysis/string.js'});
	chrome.tabs.executeScript({file: 'js/analysis/reading_level.js'});
	chrome.tabs.executeScript({file: 'js/analysis/other_analysis.js'});
	chrome.tabs.executeScript({file: 'js/analysis/is_english.js'});
	
	chrome.tabs.executeScript({file: 'js/timeline/date.js'});
	
	chrome.tabs.executeScript({file: 'js/misc/html.js'});
	chrome.tabs.executeScript({file: 'js/misc/descriptions.js'});
	chrome.tabs.executeScript({file: 'js/summary_functions.js'});

	/*Summarize everything*/
	chrome.tabs.executeScript({file: 'js/summerize.js'});
	chrome.tabs.executeScript({file: 'js/tabs.js'});
	chrome.tabs.executeScript({file: 'js/dom.js'});

}


function saveSettings(){
	var settings = {};
	settings["debug_mode"] = document.getElementById("debug_mode").checked;
	settings["search_all"] = document.getElementById("search_all").checked;
	settings["no_timeout"] = document.getElementById("no_timeout").checked;
	settings["search_hidden"] = document.getElementById("search_hidden").checked;
	
	settings["dont_create_tabs"] = document.getElementById("dont_create_tabs").checked;
	
	settings["highlight_type"] = document.getElementById("highlight type").value;
	settings["highlight_key_phrase"] = document.getElementById("highlight-color-1").value;
	settings["highlight_key_event"] = document.getElementById("highlight-color-2").value;
	settings["highlight_key_stat"] = document.getElementById("highlight-color-3").value;
	
	chrome.storage.sync.set({'settings': settings}, function(e){console.log(e);});
	
	document.getElementById("square1").style.borderColor = colors[settings.highlight_key_phrase];
	document.getElementById("square2").style.borderColor = colors[settings.highlight_key_event];
	document.getElementById("square3").style.borderColor = colors[settings.highlight_key_stat];
	
	return settings;
}

function resetSettings(){
	var c = confirm("Are you sure you want to reset all settings to default?");
	if( c ){
		document.getElementById("debug_mode").checked = false;
		document.getElementById("search_all").checked = false;
		document.getElementById("no_timeout").checked = false;
		
		document.getElementById("search_hidden").checked = false;
		
		document.getElementById("dont_create_tabs").checked = false;
		
		document.getElementById("highlight type").value = "underline";
		document.getElementById("highlight-color-1").value = "orange";
		document.getElementById("highlight-color-2").value = "yellow";
		document.getElementById("highlight-color-3").value = "blue";
		
		saveSettings();
	}
}


document.getElementById("debug_mode").onchange = saveSettings;
document.getElementById("search_all").onchange = saveSettings;
document.getElementById("no_timeout").onchange = saveSettings;

document.getElementById("search_hidden").onchange = saveSettings;

document.getElementById("dont_create_tabs").onchange = saveSettings;

document.getElementById("highlight type").onchange = saveSettings;
document.getElementById("highlight-color-1").onchange = saveSettings;
document.getElementById("highlight-color-2").onchange = saveSettings;
document.getElementById("highlight-color-3").onchange = saveSettings;

document.getElementById('summerize').addEventListener('click', main);
document.getElementById("reset_settings").addEventListener('click', resetSettings);


document.getElementById("settings_button").addEventListener('click',function(){
	document.getElementById("settings_div").style.left = "0px";
	document.getElementById("main_div").style.left = "-320px";
});

document.getElementById("back_button").addEventListener('click',function(){
	document.getElementById("settings_div").style.left = "320px";
	document.getElementById("main_div").style.left = "0px";
});




document.addEventListener('DOMContentLoaded', function () {
	var links = document.getElementsByTagName("a");
	for (var i = 0; i < links.length; i++) {
		(function () {
			var ln = links[i];
			var location = ln.href;
			ln.onclick = function () {
				chrome.tabs.create({active: true, url: location});
			};
		})();
	}
});





