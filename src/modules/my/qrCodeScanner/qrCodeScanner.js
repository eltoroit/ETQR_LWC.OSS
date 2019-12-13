/* eslint-disable no-debugger */
/* eslint-disable @lwc/lwc/no-async-operation */

import { LightningElement } from 'lwc';
import jsQR from 'jsqr'; // npm install jsqr --save

export default class QrCodeScanner extends LightningElement {
	vars = null;

	renderedCallback() {
		if (!this.vars) {
			this.vars = {};
			this.vars.video = document.createElement('video');
			this.vars.canvasElement = this.template.querySelector('[data-id=canvas]');
			this.vars.canvas = this.vars.canvasElement.getContext('2d');
			this.vars.loadingMessage = this.template.querySelector('[data-id=loadingMessage]');
			this.vars.outputContainer = this.template.querySelector('[data-id=output]');
			this.vars.outputMessage = this.template.querySelector('[data-id=outputMessage]');
			this.vars.outputData = this.template.querySelector('[data-id=outputData]');

			// Use facingMode: environment to attemt to get the front camera on phones
			navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(stream => {
				this.vars.video.srcObject = stream;
				this.vars.video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
				this.vars.video.play();
				window.requestAnimationFrame(() => {
					this._tick();
				});
			});
		}
	}

	_tick() {
		this.vars.loadingMessage.innerText = '⌛ Loading video...';
		if (this.vars.video.readyState === this.vars.video.HAVE_ENOUGH_DATA) {
			this.vars.loadingMessage.hidden = true;
			this.vars.canvasElement.hidden = false;
			this.vars.outputContainer.hidden = false;

			this.vars.canvasElement.height = this.vars.video.videoHeight;
			this.vars.canvasElement.width = this.vars.video.videoWidth;
			this.vars.canvas.drawImage(this.vars.video, 0, 0, this.vars.canvasElement.width, this.vars.canvasElement.height);
			let imageData = this.vars.canvas.getImageData(0, 0, this.vars.canvasElement.width, this.vars.canvasElement.height);
			let code = jsQR(imageData.data, imageData.width, imageData.height, {
				inversionAttempts: 'dontInvert'
			});
			if (code) {
				this._drawLine(code.location.topLeftCorner, code.location.topRightCorner, '#FF3B58');
				this._drawLine(code.location.topRightCorner, code.location.bottomRightCorner, '#FF3B58');
				this._drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, '#FF3B58');
				this._drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, '#FF3B58');
				this.vars.outputMessage.hidden = true;
				this.vars.outputData.parentElement.hidden = false;
				this.vars.outputData.innerText = code.data;
				// } else {
				// 	this.vars.outputMessage.hidden = false;
				// 	this.vars.outputData.parentElement.hidden = true;
			}
		}
		window.requestAnimationFrame(() => {
			this._tick();
		});
	}

	_drawLine(begin, end, color) {
		this.vars.canvas.beginPath();
		this.vars.canvas.moveTo(begin.x, begin.y);
		this.vars.canvas.lineTo(end.x, end.y);
		this.vars.canvas.lineWidth = 4;
		this.vars.canvas.strokeStyle = color;
		this.vars.canvas.stroke();
	}
}
