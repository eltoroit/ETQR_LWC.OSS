import { LightningElement, track } from 'lwc';

export default class App extends LightningElement {
	_initialized = false;

	@track qrData = null;
	@track pageVisibility = {};

	constructor() {
		super();
		this.pageVisibility = {
			data: false,
			scanner: false,
			generator: false
		};
	}

	renderedCallback() {
		if (!this._initialized) {
			this._initialized = true;

			// http://localhost:3001/?tab=generator
			let urlParams = new URLSearchParams(window.location.search);
			switch (urlParams.get('tab')) {
				// case 'data':
				case 'scanner':
				case 'generator':
					this._switchPage(urlParams.get('tab'));
					break;
				default:
					this._switchPage('scanner');
					break;
			}
		}
	}

	handleDataScanned(event) {
		const sData = event.detail;
		this.qrData = sData;
		this._switchPage('data');
	}

	showScanner() {
		this._switchPage('scanner');
	}

	showData() {
		this._switchPage('data');
	}

	showGenerator() {
		this._switchPage('generator');
	}

	_getDOM() {
		return {
			tabs: {
				scanner: this.template.querySelector('[data-id="tabScanner"]'),
				data: this.template.querySelector('[data-id="tabData"]'),
				generator: this.template.querySelector('[data-id="tabGenerator"]')
			},
			pages: {
				scanner: this.template.querySelector('[data-id="pageScanner"]'),
				data: this.template.querySelector('[data-id="pageData"]'),
				generator: this.template.querySelector('[data-id="pageGenerator"]')
			}
		};
	}

	_switchPage(newTab) {
		let dom = this._getDOM();

		// Object.keys(dom.tabs).forEach((key, value) => { ... });
		Object.keys(this.pageVisibility).forEach(key => {
			this.pageVisibility[key] = key === newTab;
		});

		Object.keys(dom.tabs).forEach(key => {
			if (key === newTab) {
				dom.tabs[key].hidden = false;
				dom.tabs[key].classList.add('slds-is-active');
			} else {
				dom.tabs[key].classList.remove('slds-is-active');
			}
			dom.pages[key].hidden = key !== newTab;
		});

		if (newTab === 'scanner') {
			dom.tabs.data.hidden = true;
			dom.pages.data.hidden = true;
		}
	}
}
