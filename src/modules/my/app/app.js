import { LightningElement } from 'lwc';

export default class App extends LightningElement {
	showScan() {
		this._switchPage('scan');
	}

	showGenerate() {
		this._switchPage('generate');
	}

	_getDOM() {
		return {
			tabs: {
				scan: this.template.querySelector('[data-id="tabScan"]'),
				generate: this.template.querySelector('[data-id="tabGenerate"]')
			},
			pages: {
				scan: this.template.querySelector('[data-id="pageScan"]'),
				generate: this.template.querySelector('[data-id="pageGenerate"]')
			}
		};
	}

	_switchPage(newTab) {
		let dom = this._getDOM();

		// Object.keys(dom.tabs).forEach((key, value) => { ... });
		Object.keys(dom.tabs).forEach(key => {
			if (key === newTab) {
				dom.tabs[key].classList.add('slds-is-active');
			} else {
				dom.tabs[key].classList.remove('slds-is-active');
			}
		});
		Object.keys(dom.pages).forEach(key => {
			if (key === newTab) {
				dom.pages[key].classList.add('slds-show');
				dom.pages[key].classList.remove('slds-hide');
			} else {
				dom.pages[key].classList.remove('slds-show');
				dom.pages[key].classList.add('slds-hide');
			}
		});
	}
}
