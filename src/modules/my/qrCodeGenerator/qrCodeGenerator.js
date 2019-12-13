import { LightningElement } from 'lwc';
import QRCode from 'qrcode'; // https://github.com/soldair/node-qrcode

export default class QrCodeGenerator extends LightningElement {
	clickMe() {
		const sData = JSON.stringify(new Date().toJSON());
		QRCode.toCanvas(sData, { width: Math.min(window.innerWidth, window.innerHeight) })
			.then(newCanvas => {
				const canvasDiv = this.template.querySelector('[data-id="QRCode"]');
				while (canvasDiv.firstChild) {
					canvasDiv.removeChild(canvasDiv.firstChild);
				}
				canvasDiv.appendChild(newCanvas);
				console.log('success!');
			})
			.catch(err => {
				throw Error(err);
			});
	}
}
