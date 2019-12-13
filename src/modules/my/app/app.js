import { LightningElement, track } from 'lwc';

export default class App extends LightningElement {
	_initialized = false;
	@track pageVisibility = {};

	constructor() {
		super();
		this.pageVisibility = {
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

	get isScannerVisible() {
		return this.pageVisibility.scanner;
	}
	get isGeneratorVisible() {
		return this.pageVisibility.generator;
	}

	showScanner() {
		this._switchPage('scanner');
	}

	showGenerator() {
		this._switchPage('generator');
	}

	_getDOM() {
		return {
			tabs: {
				scanner: this.template.querySelector('[data-id="tabScanner"]'),
				generator: this.template.querySelector('[data-id="tabGenerator"]')
			},
			pages: {
				scanner: this.template.querySelector('[data-id="pageScanner"]'),
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
