//Documentation: https://developers.google.com/web/updates/2015/07/interact-with-ble-devices-on-the-web
  var deviceName = 'ECGMonitoringSystem'
  var bleService = 'a1f1e20e-219a-4bab-bbef-191f2e4a3a55'
  var bleCharacteristicheartsignal = '2819a2f3-a0dd-44e4-a9e7-93fc5a238b79'
  var bleCharacteristicbpm = '44f6958f-4ecb-4359-836b-867704461d3b'
  var blecharacteristicbatterylevel = '19c11d71-1f8a-4971-b2ac-9e30a00ed4d1'
  var bluetoothDeviceDetected
  var gattCharacteristic
  var bledata = [];
  var bleprev;
  var value;
  var bpmvalue;
  var bpmvalueold;
  var bpmvalueoldavg;
  var heartsignalvalue;
  var batterylevelvalue;
  var rrpeakintervalvalue;
  var bpmaverage;
  var batterycase;
  var bpmonce = true;
  var writingone = Uint8Array.of(1);
  var blob;
  var ecgdata = [];
  var ecgdata2 = [];
  var ecghelp;
  var valueold;
  var counterremove;
  var currentMillisdata;
  var previousMillisdata;
  var counterremove = 0;
  var timestarted = performance.now();

  document.querySelector('#read').addEventListener('click', function() {
    if (isWebBluetoothEnabled()) { read() }
  })

  document.querySelector('#start').addEventListener('click', function(event) {
    if (isWebBluetoothEnabled()) { start() }
  })

  document.querySelector('#stop').addEventListener('click', function(event) {
    if (isWebBluetoothEnabled()) { stop() }
  })

  document.querySelector('#disconnect').addEventListener('click', function(event) {
    if (isWebBluetoothEnabled()) { disconnect() }
  })

  document.querySelector('#savebutton').addEventListener('click', function(event) {
    if (isWebBluetoothEnabled()) { saveDataToFile() }
  })


  function isWebBluetoothEnabled() {
    if (!navigator.bluetooth) {
      console.log('Web Bluetooth API is not available in this browser!')
      return false
    }
    return true
  }

  function getDeviceInfo() {
    let options = {
      optionalServices: [bleService],
      filters: [
        { "name": deviceName }
      ]
    }

    console.log('Requesting any Bluetooth Device...')
    return navigator.bluetooth.requestDevice(options).then(device => {
      bluetoothDeviceDetected = device
    }).catch(error => {
      console.log('Argh! ' + error)
    })
  }

  function read() {
    return (bluetoothDeviceDetected ? Promise.resolve() : getDeviceInfo())
    .then(connectGATT)
    .then(_ => {
      console.log('First BPM is ')
      document.querySelector('#disconnect').disabled = false
      previousMillisdata = 0;
      return gattCharacteristic.readValue()
    })
    .catch(error => {
      console.log('Waiting to start reading: ' + error)
    })
  }

  async function connectGATT() {
    if (bluetoothDeviceDetected.gatt.connected && gattCharacteristic) {
      return Promise.resolve()
    }

    return bluetoothDeviceDetected.gatt.connect()
    .then(server => {
      console.log('Getting GATT Service...')
      return server.getPrimaryService(bleService)
    })
    .then(service => {
      console.log('Getting GATT Characteristic...')
      return service.getCharacteristic(bleCharacteristicheartsignal)
    })
    .then(characteristic => {
      gattCharacteristic = characteristic

      return characteristic.writeValue(writingone);
      console.log(writingone);
    })

    .then(_ => {
      console.log('test ')
      document.querySelector('#start').disabled = false
      document.querySelector('#stop').disabled = true
      gattCharacteristic.addEventListener('characteristicvaluechanged', handleChangedValue)
    })

  }



  async function handleChangedValue(event) {
    value = BigInt(event.target.value.getUint32(0, true));

      ecghelp = value;

      if(value != valueold){

        valueold = value;
      for (var i = 0; i < 4; i++)
      {
        var result = BigInt(ecghelp / 250n);
        result = result *250n;
        var modulo = ecghelp - result;

        ecghelp = (ecghelp - modulo)/250n;

        ecgdata2.push(modulo*10n);
      }
      }

    var now = new Date()

    //Data to chart.js and store data
    for (var i = 0; i < 4; i++) {
      var testdata = BigInt(ecgdata2.pop());
      //console.log(now.getHours() + now.getMinutes() + ':' + now.getSeconds() + " heartsignals = " + testdata);
      //console.log(testdata);
      addData(chart,(Math.round(performance.now() - ((4-i)*20) )), Number(testdata));

      ecgdata.push(Number(testdata) + ";" +(Math.round(performance.now() - ((4-i)*20))) + ";" + ecgdata.length + "\n");

      if (counterremove > 1 ){
      removeData(chart);
      counterremove = 0;
      }
      counterremove++;

    }
  }

  function saveDataToFile()
   {
          blob = new Blob([ecgdata], { type: "text/plain;charset=utf-8" });
          saveAs(blob, "ecgdata.txt");
    }



  function start() {
    gattCharacteristic.startNotifications()
    .then(_ => {
      console.log('Start reading...')
      document.querySelector('#start').disabled = true
      document.querySelector('#stop').disabled = false
    })

    .catch(error => {
      console.log('[ERROR] Start: ' + error)
    })
  }

  function stop() {
    gattCharacteristic.stopNotifications()
    .then(_ => {
      console.log('Stop reading...')
      document.querySelector('#start').disabled = false
      document.querySelector('#stop').disabled = true
    })
    .catch(error => {
      console.log('[ERROR] Stop: ' + error)
    })
  }

  function disconnect() {
    bluetoothDeviceDetected.gatt.disconnect()
    console.log('Device is disconnected')
    document.querySelector('#disconnect').disabled = true
  }

//chartjs.org
  var ctx = document.getElementById('myChart').getContext('2d');
  var chart = new Chart(ctx,
    {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
          labels: [] ,

          datasets: [{
              label: 'Heart signal',
              backgroundColor: 'rgb(236, 13, 13)',
              borderColor: 'rgb(236, 13, 13)',
              borderWidth: '2',
              fill: false,
              pointRadius: 1.3,
              data: []
          }]
      },

      // Configuration options go here
      options: {
          layout: {
            padding: {  //https://www.chartjs.org/docs/latest/configuration/layout.html
                left: 50,
                right: 50,
                top: 170,
                bottom: 0,
            }
          },
      responsive: true,
				title: {
					display: true,
					text: 'Heart signal'
				},
				scales: {
					xAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'Time in milliseconds',
              fontSize: 10
						}
					}],
					yAxes: [{
						display: true,
            ticks: {
              max: 3500,
               min: 0,
               stepSize: 500

           },
						scaleLabel: {
							display: true,
							labelString: 'Value'
						}
					}]
				}
    }
  });



  function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
  }

  function removeData(chart) {
      chart.data.labels.shift();
      chart.data.datasets.forEach((dataset) => {
          dataset.data.shift();
      });
      chart.update();
  }
