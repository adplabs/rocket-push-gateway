const pkg = require('../package.json');

const config = {
	name: pkg.name,
	version: pkg.version,
	port: 11000,
	// proxyHostname: "proxy.local", // node-apn does not seem to support proxy yet :-/
	// proxyPort: 3128,
	pushProviders: {
		apple: {
			p8KeyFilePath: "certs/set_AuthKey_here.p8",
			keyId: "keyIdNotSet",
			teamId: "teamIdNotSet",
			apnProduction: false,
			rejectUnauthorized: true,
			forwardGatewayEnable: false, // Should we forward messages to devices using apps we don't own - secops says info leakage
			forwardGatewayURL: "https://gateway.rocket.chat",
			ourAppBundleId: "com.example.app" // must match your Apple App BundleId, others will be discarded or forwarded
		},
		google: {
			serverKey: "YOUR-FCM-SERVER-KEY",
			forwardGatewayEnable: false, // Should we forward messages to devices using apps we don't own - secops says info leakage
			forwardGatewayURL: "https://gateway.rocket.chat"
		}
	}
};

module.exports = config;
