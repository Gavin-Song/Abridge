/*Injects important css into document*/
var link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = chrome.extension.getURL('css/main.css');
document.head.appendChild(link);


/*Inject settings*/
link = document.createElement('span');
link.id = "settings";
document.head.appendChild(link);


