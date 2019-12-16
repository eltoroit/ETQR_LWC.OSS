/* eslint-disable no-alert */
/* eslint-disable no-debugger */
/* eslint-disable @lwc/lwc/no-async-operation */

import { LightningElement, api } from 'lwc';
import jsQR from 'jsqr'; // npm install jsqr --save

export default class QrCodeScanner extends LightningElement {
	vars = null;
	_data = null;
	_isVisible = false;

	@api
	get isVisible() {
		return this._isVisible;
	}

	set isVisible(value) {
		this._isVisible = value;

		if (this._isVisible) {
			this._startVideo();
			this._showDiv('divCapture');
		} else {
			this._stopVideo();
			this._showDiv('divButton');
		}
	}

	scanAgain() {
		this.isVisible = true;
	}

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
		}
	}

	_tick() {
		if (this.isVisible) {
			this.vars.loadingMessage.innerText = '⌛ Loading video...';
			if (this.vars.video.readyState === this.vars.video.HAVE_ENOUGH_DATA) {
				try {
					console.log('Scanning');
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
						this._reportData(code.data);
						// } else {
						// 	this.vars.outputMessage.hidden = false;
						// 	this.vars.outputData.parentElement.hidden = true;
					}
				} catch (e) {
					console.log(e);
				}
			}
			window.requestAnimationFrame(() => {
				this._tick();
			});
		}
	}

	_reportData(sData) {
		const jData = JSON.parse(sData);
		if (sData !== this._data && jData.copy1 === jData.copy2) {
			this._data = sData;
			this.isVisible = false;

			const fetchUrl = `/reportQRCode`;
			const fetchOptions = {
				method: 'post',
				headers: {
					'Content-Type': 'application/json'
				},
				body: sData
			};
			fetch(fetchUrl, fetchOptions)
				.then(response => {
					return response.json();
				})
				.then(json => {
					console.log(JSON.stringify(json));
				})
				.catch(e => {
					throw new Error(e);
				});

			// // Fire platform event
			// const fetchUrl = `${jData.serverUrl}/services/data/v47.0/sobjects/QRScan__e`;
			// const fetchOptions = {
			// 	method: 'post',
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 		Authorization: `Bearer ${jData.sessionId}`
			// 	},
			// 	body: JSON.stringify({
			// 		DTTM__c: jData.dttm,
			// 		RecordId__c: jData.copy1
			// 	})
			// };
			// fetch(fetchUrl, fetchOptions)
			// 	.then(response => {
			// 		return response.json();
			// 	})
			// 	.then(json => {
			// 		console.log(JSON.stringify(json));
			// 	})
			// 	.catch(e => {
			// 		throw new Error(e);
			// 	});
		}
	}

	_drawLine(begin, end, color) {
		this.vars.canvas.beginPath();
		this.vars.canvas.moveTo(begin.x, begin.y);
		this.vars.canvas.lineTo(end.x, end.y);
		this.vars.canvas.lineWidth = 4;
		this.vars.canvas.strokeStyle = color;
		this.vars.canvas.stroke();
	}

	_stopVideo() {
		// Stop all video streams.
		if (this.vars && this.vars.video && this.vars.video.srcObject) {
			this.vars.video.srcObject.getVideoTracks().forEach(videoTrack => videoTrack.stop());
		}
	}

	_startVideo() {
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
		if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			// Use facingMode: environment to attemt to get the front camera on phones
			navigator.mediaDevices
				.getUserMedia({ video: { facingMode: 'environment' } })
				.then(stream => {
					this.vars.video.srcObject = stream;
					this.vars.video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
					this.vars.video.play();
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

	_showDiv(showDiv) {
		try {
			const divs = {
				divButton: this.template.querySelector('[data-id="divButton"]'),
				divCapture: this.template.querySelector('[data-id="divCapture"]')
			};

			Object.keys(divs).forEach(key => {
				if (key === showDiv) {
					divs[key].classList.add('slds-show');
					divs[key].classList.remove('slds-hide');
				} else {
					divs[key].classList.remove('slds-show');
					divs[key].classList.add('slds-hide');
				}
			});
		} catch (e) {
			console.log(e);
		}
	}
}
