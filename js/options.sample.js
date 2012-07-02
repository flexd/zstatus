var w = 1600,
    h = 1000;

var options = {
    url: 'https://zabbixserver/api_jsonrpc.php',  // URL of Zabbix API
    basicauth: false,     // If you use basic authentication, set true for this option
    busername: '',        // User name for basic authentication
    bpassword: '',        // Password for basic authentication
    timeout: 5000,        // Request timeout (milli second)
    limit: 1000,          // Max data number for one request
    username: 'username',    // Zabbix login user name
    password: 'password',// Zabbix login password
};

