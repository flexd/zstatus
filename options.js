var w = 1280,
    h = 1280;

var options = {
    url: 'http://zabbix.test.sparebank1.no/api_jsonrpc.php',  // URL of Zabbix API
    basicauth: false,     // If you use basic authentication, set true for this option
    busername: '',        // User name for basic authentication
    bpassword: '',        // Password for basic authentication
    timeout: 5000,        // Request timeout (milli second)
    limit: 1000,          // Max data number for one request
    username: 'e3130',    // Zabbix login user name
    password: 'zabbix',// Zabbix login password
};