// Find the full example of all available configuration options at
// https://github.com/muenzpraeger/create-lwc-app/blob/master/packages/lwc-services/example/lwc-services.config.js

const outputDir = '../WEBSERVER/LWC4WEBSERVER';
// eslint-disable-next-line no-undef
module.exports = {
	buildDir: `${outputDir}`,
	resources: [
		{ from: 'src/resources', to: `${outputDir}/resources` },
		{
			from: 'node_modules/@salesforce-ux/design-system/assets',
			to: 'src/SLDS'
		}
	]
};
