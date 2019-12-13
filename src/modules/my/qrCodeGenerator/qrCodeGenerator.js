import { LightningElement, api } from 'lwc';
import QRCode from 'qrcode'; // https://github.com/soldair/node-qrcode

export default class QrCodeGenerator extends LightningElement {
	@api isVisible = false;

	constructor() {
		super();
		// eslint-disable-next-line @lwc/lwc/no-async-operation
		setInterval(() => {
			if (this.isVisible) {
				this.generateQR();
			}
		}, 1000);
	}

	generateQR() {
		const canvas = this.template.querySelector('[data-id="QRCode"]');
		const sData = JSON.stringify(new Date().toJSON());

		QRCode.toCanvas(canvas, sData, { margin: 0, width: Math.min(window.innerWidth, window.innerHeight) * 0.9 })
			// QRCode.toCanvas(canvas, sData)
			.then(() => {
				console.log('Generated QR!');
			})
			.catch(err => {
				throw Error(err);
			});
	}
}
