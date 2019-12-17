/* eslint-disable no-alert */
/* eslint-disable no-debugger */
/* eslint-disable @lwc/lwc/no-async-operation */

import { LightningElement, api } from 'lwc';
import jsQR from 'jsqr'; // npm install jsqr --save

export default class QrCodeScanner extends LightningElement {
	_ui = null;
	_isVisible = false;

	@api
	get isVisible() {
		return this._isVisible;
	}

	set isVisible(value) {
		this._isVisible = value;
		if (this._isVisible) {
			this._startVideo();
		} else {
			this._stopVideo();
		}
	}

	renderedCallback() {
		if (!this._ui) {
			this._ui = {};
			this._ui.video = document.createElement('video');
			this._ui.canvasElement = this.template.querySelector('[data-id=canvas]');
			this._ui.canvas = this._ui.canvasElement.getContext('2d');
			this._ui.loadingMessage = this.template.querySelector('[data-id=loadingMessage]');
			this._ui.loadingMessage.innerText = '⌛ Loading video...';
		}
	}

	_tick() {
		if (this.isVisible) {
			if (this._ui.video.readyState === this._ui.video.HAVE_ENOUGH_DATA) {
				try {
					this._ui.loadingMessage.hidden = true;
					this._ui.canvasElement.hidden = false;
					this._ui.canvasElement.height = this._ui.video.videoHeight;
					this._ui.canvasElement.width = this._ui.video.videoWidth;
					this._ui.canvas.drawImage(this._ui.video, 0, 0, this._ui.canvasElement.width, this._ui.canvasElement.height);
					let imageData = this._ui.canvas.getImageData(0, 0, this._ui.canvasElement.width, this._ui.canvasElement.height);
					let code = jsQR(imageData.data, imageData.width, imageData.height, {
						inversionAttempts: 'dontInvert'
					});
					if (code) {
						try {
							this._drawBox(code);
							this.dispatchEvent(new CustomEvent('scanned', { detail: code.data }));
						} catch (e) {
							console.log(code.data);
							console.error(e);
						}
					}
				} catch (e) {
					console.log(e);
				}
			} else {
				this._ui.loadingMessage.hidden = !true;
				this._ui.canvasElement.hidden = !false;
			}
			window.requestAnimationFrame(() => {
				this._tick();
			});
		}
	}

	_drawBox(code) {
		this._drawLine(code.location.topLeftCorner, code.location.topRightCorner);
		this._drawLine(code.location.topRightCorner, code.location.bottomRightCorner);
		this._drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner);
		this._drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner);
	}

	_drawLine(begin, end) {
		let color = '#FF3B58';
		this._ui.canvas.beginPath();
		this._ui.canvas.moveTo(begin.x, begin.y);
		this._ui.canvas.lineTo(end.x, end.y);
		this._ui.canvas.lineWidth = 4;
		this._ui.canvas.strokeStyle = color;
		this._ui.canvas.stroke();
	}

	_stopVideo() {
		// Stop all video streams.
		if (this._ui && this._ui.video && this._ui.video.srcObject) {
			this._ui.video.srcObject.getVideoTracks().forEach(videoTrack => videoTrack.stop());
		}
	}

	_startVideo() {
		if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			// Use facingMode: environment to attemt to get the front camera on phones
			navigator.mediaDevices
				.getUserMedia({ video: { facingMode: 'environment' } })
				.then(stream => {
					this._ui.video.srcObject = stream;
					this._ui.video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
					this._ui.video.play();
					window.requestAnimationFrame(() => {
						this._tick();
					});
				})
				.catch(() => {
					alert('Your browser does not support camera, sorry. (1)');
				});
		} else {
			alert('Your browser does not support camera, sorry. (2)');
		}
	}
}
