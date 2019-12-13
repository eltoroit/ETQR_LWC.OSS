import { LightningElement, api } from 'lwc';

export default class Button extends LightningElement {
	@api message;
	getData() {
		// eslint-disable-next-line no-alert
		alert(this.message);
	}
}
