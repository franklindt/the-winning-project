const path = require('path');
const solclientjs = path.resolve(__dirname, 'path/to/solclientjs-10.0.0/lib/solclient.js');
module.exports = {
  resolve: {
    alias: {
      solclientjs$: solclientjs
    }
  },
  module: {
    rules: [
      {
        test: require.resolve(solclientjs),
        use: 'exports-loader?window.solace'
      }
    ]
  }
}

var session = solace.SolclientFactory.createSession({
    url: "wss://mr-connection-x8jhb0byyjh.messaging.solace.cloud:443",
    vpnName: "routing",
    userName: "solace-cloud-client",
    password: "osh053lne4illteoc602krgohg",
  });
  try {
    session.connect();
  } catch (error) {
    console.log(error);
  }