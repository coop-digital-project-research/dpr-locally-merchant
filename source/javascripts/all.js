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
	alert(a);
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
					if (device.kind === 'videoinput') {
						if(device.label.toLowerCase().search("back") > -1) {
							options = {
								'deviceId': {
									'exact':device.deviceId
								},
								'facingMode':'environment'
							};
						}
					}
					console.log(device.kind + ": " + device.label +" id = " + device.deviceId);
				});
			});
	}
	else {
		console.log("no navigator.mediaDevices.enumerateDevices" );
	}

	detectCameraTypeAndScheduleProcessing(options);
}

function detectCameraTypeAndScheduleProcessing(options)
{
	console.log(options);

	if(haveConfiguredType) {
		setTimeout(captureToCanvas, 500);
		return;
	}

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
