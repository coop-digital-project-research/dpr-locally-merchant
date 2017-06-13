"use strict";

/*
function readData(data) {
	console.log(data);
}

qrcode.callback = readData();
*/

var gCtx = null;
var gCanvas = null;
var c = 0;
var haveConfiguredType = false;
var gUM = false;
var webkit = false;
var moz = false;
var videoTag = null;


function handleQrCodeData(a)
{
  window.location.assign(encodeURI('/enter-amount.html?qrcode=' + a));
}

function loadScanner()
{
	if(isCanvasSupported() && window.File && window.FileReader)
	{
		initCanvas(800, 600);
		qrcode.callback = handleQrCodeData;

		videoTag = document.getElementById("v");
		setwebcam();
	}
	else {
		alert("Scanning not supported not supported");
	}
}

function isCanvasSupported(){
	var elem = document.createElement('canvas');
	return !!(elem.getContext && elem.getContext('2d'));
}

function initCanvas(w,h)
{
	gCanvas = document.getElementById("qr-canvas");
	gCanvas.style.width = w + "px";
	gCanvas.style.height = h + "px";
	gCanvas.width = w;
	gCanvas.height = h;
	gCtx = gCanvas.getContext("2d");
	gCtx.clearRect(0, 0, w, h);
}


function setwebcam()
{
  var options = true;
  if(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices()
      .then(function(devices) {
        devices.forEach(function(device) {
          console.log("device.kind:" + device.kind + ", label:" + device.label +" id:" + device.deviceId);

          if (device.kind === 'videoinput') {
            if(device.label.toLowerCase().search("back") > -1) {
	      console.log("Found back-facing camera, using that.");
              options = {
                'deviceId': {
                  'exact': device.deviceId
                },
                'facingMode':'environment'
              };

	      detectCameraTypeAndScheduleProcessing(options);
            }
          }
        }.bind(options));
      });
  }
  else {
    console.warn("no navigator.mediaDevices.enumerateDevices" );
  }

  detectCameraTypeAndScheduleProcessing(options);
}

function detectCameraTypeAndScheduleProcessing(options)
{
	console.log("camera options:", options);

	var n = navigator;
	if(n.getUserMedia) {
		webkit = true;
		n.getUserMedia({video: options, audio: false}, success, error);
	}
	else if(n.webkitGetUserMedia) {
		webkit = true;
		n.webkitGetUserMedia({video:options, audio: false}, success, error);
	}
	else if(n.mozGetUserMedia) {
		moz = true;
		n.mozGetUserMedia({video: options, audio: false}, success, error);
	}

	haveConfiguredType = true;
	setTimeout(captureToCanvas, 500);
}

function success(stream) {
	if(webkit) {
		videoTag.src = window.URL.createObjectURL(stream);
	}
	else if(moz) {
		videoTag.mozSrcObject = stream;
		videoTag.play();
	}
	else {
		videoTag.src = stream;
	}
	gUM=true;
	setTimeout(captureToCanvas, 500);
}

function error(error) {
	gUM=false;
	console.error(error);
	alert(error);
	return;
}


function captureToCanvas() {
	if(!haveConfiguredType) {
	  console.error("captureToCanvas called with haveConfiguredType=false");
		return;
	}

	if(gUM)
	{
		try{
			gCtx.drawImage(videoTag,0,0);
			try{
				qrcode.decode();
			}
			catch(e){
				console.log(e);
				setTimeout(captureToCanvas, 500);
			};
		}
		catch(e){
			console.log(e);
			setTimeout(captureToCanvas, 500);
		};
	}
}

function wireUpKeypadButtons() {
  var keypadButtons = [].slice.call(document.getElementsByClassName("keypad-button"), 0);

  console.log(keypadButtons);

  keypadButtons.forEach(function(item, i) {
    item.addEventListener('click', handleKeypadButtonClick);
  });


}

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
      return Array(+(zero > 0 && zero)).join("0") + num;
}

function formatPennies(pennies) {
  var pounds = zeroPad(parseInt(pennies / 100), 1);
  var pence = zeroPad(pennies % 100, 2);

  console.log("pennies:", pennies, "pounds:", pounds, "pence:", pence);
  return pounds + '.' + pence;
}

function handleKeypadButtonClick(event) {
  var amountInput = document.getElementById('amount-input');
  var keyPressed = event.target.text;

  var currentPennies = parseInt(amountInput.value.replace(/[^0-9]/g, ""));
  if(isNaN(currentPennies)) {
    currentPennies = 0;
  }

  console.log("currentPennies:", currentPennies);
  console.log('key pressed:', keyPressed);

  switch(keyPressed) {
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case "0": {
      var newPennies = (currentPennies * 10) + parseInt(keyPressed);
      amountInput.value = formatPennies(newPennies);
      break;
    }

    case "00": {
      var newPennies = (currentPennies * 100);
      amountInput.value = formatPennies(newPennies);
      break;
    }

    case "X": {
      var newPennies = parseInt(currentPennies / 10);
      amountInput.value = formatPennies(newPennies);

      break;
    }

    default: {
    }

  }
}
