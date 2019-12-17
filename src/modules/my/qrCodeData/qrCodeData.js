/* eslint-disable no-alert */
/* eslint-disable no-debugger */
/* eslint-disable @lwc/lwc/no-async-operation */

import { LightningElement, api, track } from 'lwc';

export default class QrCodeData extends LightningElement {
	@track _qrDataIn = null;
	@track _qrDataOut = null;
	@api isVisible = false;

	@api
	get qrData() {
		return this._qrDataIn;
	}
	set qrData(sData) {
		console.log(sData);
		this._qrDataIn = sData;
		this._reportQRCode(sData);
	}

	_reportQRCode(sData) {
		return new Promise((resolve, reject) => {
			try {
				const jData = JSON.parse(sData);
				this._qrDataIn = JSON.stringify(jData, null, 2);
				if (jData.copy1 === jData.copy2) {
					const fetchUrl = `/reportQRCode`;
					const fetchOptions = {
						method: 'post',
						headers: { 'Content-Type': 'application/json' },
						body: sData
					};
					fetch(fetchUrl, fetchOptions)
						.then(response => {
							return response.text();
						})
						.then(sData2 => {
							let jData2 = JSON.parse(sData2);
							this._qrDataOut = JSON.stringify(jData2, null, 2);
							resolve(jData2);
						})
						.catch(e => reject(e));
				}
			} catch (e) {
				console.error(e);
			}
		});
	}
}
