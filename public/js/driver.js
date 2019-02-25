/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
'use strict';
var socket = io();

/*var vm = new Vue({
  el: '#page',
  data: {
    map: null,
    driverId: 1,
    driverLocation: null,
    maxCapacity: 30,
    usedCapacity: 0,
    orders: {},
    customerMarkers: {},
    baseMarker: null
  },
  created: function () {
    socket.on('initialize', function (data) {
      // add marker for home base in the map
      this.baseMarker = L.marker(data.base, {icon: this.baseIcon}).addTo(this.map);
      this.baseMarker.bindPopup("This is the dispatch and routing center");

      this.orders = data.orders;
    }.bind(this));
    socket.on('currentQueue', function (data) {
      this.orders = data.orders;
      for (let key in this.orders) {
        if (this.orders[key].driverId && this.orders[key].driverId == this.driverId) {
          this.customerMarkers[this.orders[key].orderId] = this.putCustomerMarkers(this.orders[key]);
        }
      }
    }.bind(this));

    // these icons are not reactive
    this.driverIcon = L.icon({
      iconUrl: "img/driver.png",
      iconSize: [36,20],
      iconAnchor: [18,22]
    });
    this.fromIcon = L.icon({
      iconUrl: "img/box.png",
      iconSize: [42,30],
      iconAnchor: [21,34]
    });
    this.baseIcon = L.icon({
      iconUrl: "img/base.png",
      iconSize: [40,40],
      iconAnchor: [20,20]
    });
  },
  mounted: function () {
    // set up the map
    this.map = L.map('my-map').setView([59.8415,17.648], 13);

    // create the tile layer with correct attribution
    var osmUrl='http://{s}.tile.osm.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    L.tileLayer(osmUrl, {
        attribution: osmAttrib,
        maxZoom: 18
    }).addTo(this.map);
    this.map.on('click', this.setDriverLocation);
  },
  beforeDestroy: function () {
    socket.emit('driverQuit', this.driverId);
  },
  methods: {
    getDriverInfo: function () {
      return  { driverId: this.driverId,
        latLong: this.driverLocation.getLatLng(), 
        maxCapacity: this.maxCapacity,
        usedCapacity: this.usedCapacity
      };
    },
    setDriverLocation: function (event) {
      if (this.driverLocation === null) {
        this.driverLocation = L.marker([event.latlng.lat, event.latlng.lng], {icon: this.driverIcon, draggable: true}).addTo(this.map);
        this.driverLocation.on("drag", this.moveDriver);
        socket.emit("addDriver", this.getDriverInfo());
      }
      else {
        this.driverLocation.setLatLng(event.latlng);
        this.moveDriver(event);
      }
    },
    updateDriver: function () {
      socket.emit("updateDriver", this.getDriverInfo());
    },
    moveDriver: function (event) {
      socket.emit("moveDriver", this.getDriverInfo());
    },
    quit: function () {
      // TODO: This should perhaps only be possible when the driver is not assigned to any orders
      this.map.removeLayer(this.driverLocation);
      this.driverLocation = null;
      socket.emit("driverQuit", this.driverId);
    },
    orderPickedUp: function (order) {
      // Update used capacity
      this.usedCapacity += order.orderDetails.spaceRequired;

      // TODO: Update polyline, remove last segment  
      socket.emit("orderPickedUp", order);
    },
    orderDroppedOff: function (order) {
      // Update used capacity
      this.usedCapacity -= order.orderDetails.spaceRequired;

      Vue.delete(this.orders, order.orderId);
      this.map.removeLayer(this.customerMarkers[order.orderId].from);
      this.map.removeLayer(this.customerMarkers[order.orderId].dest);
      this.map.removeLayer(this.customerMarkers[order.orderId].line);
      Vue.delete(this.customerMarkers[order.orderId]);
      socket.emit("orderDroppedOff", order.orderId);
    },
    // TODO: express and processed need to be separated to properly represent a
    // non-express processed order (i.e. a regular order when going from the distribution
    // terminal to final destination)
    getPolylinePoints: function (order) {
      if (order.expressOrAlreadyProcessed) {
        return [order.fromLatLong, order.destLatLong];
      } else {
        return [order.fromLatLong, this.baseMarker.getLatLng()];
      }
    },
    putCustomerMarkers: function (order) {
      var fromMarker = L.marker(order.fromLatLong, {icon: this.fromIcon}).addTo(this.map);
      fromMarker.orderId = order.orderId;
      var destMarker = L.marker(order.expressOrAlreadyProcessed ? order.destLatLong : this.baseMarker.getLatLng()).addTo(this.map);
      destMarker.orderId = order.orderId;
      var connectMarkers = L.polyline(this.getPolylinePoints(order), {color: 'blue'}).addTo(this.map);
      return {from: fromMarker, dest: destMarker, line: connectMarkers};
    },
  }
});*/

var driverPages= new Vue({
  el:'#pages',
  data: {
      index:0,
      orders:{},
      driverId:1,
      driverLocation: null,
      recentOrder: null
  },
  created: function () {
    socket.on('initialize', function (data) {
      // add marker for home base in the map
     // this.baseMarker = L.marker(data.base, {icon: this.baseIcon}).addTo(this.map);
      //this.baseMarker.bindPopup("This is the dispatch and routing center");

      this.orders = data.orders;
    }.bind(this));
    socket.on('currentQueue', function (data) {
      this.orders = data.orders;
      
    }.bind(this));
  },
  methods:{
      nextButton: function() {
          this.index++;
          window.scrollTo(0,0);
          console.log(this.orders);
   }, 
      toShipment:function(){
        this.index=1;
        window.scrollTo(0,0);
      },
      orderDroppedOff: function (order) {
        // Update used capacity
        
        socket.emit("orderDroppedOff", order.orderId);
      }, 
      getIssue: function(){
        const issue= document.querySelector('form');
        const data= new FormData(issue);
        const text= data.get('issue');
        console.log(text);
        issue.reset();
      },
      emitDriver: function(){
        this.driverLocation={ "lat": 59.84091407485801 + this.randomNum() , "lng": 17.64924108548685 + this.randomNum()};
        socket.emit("addDriver", this.getDriverInfo());
        console.log(this.getDriverInfo());
        this.nextButton();
      },
      getDriverInfo: function () {
        return  { driverId: this.driverId,
                  latLong:this.driverLocation};
      },
      showMoreInfo: function(order){
        var name= document.getElementById('nameOfC');
        var address= document.getElementById('AddOfC');
        var number= document.getElementById('NumOfC');
        var orderN= document.getElementById('OrOfC'); 
        name.innerHTML= order.recData[1];
        address.innerHTML=order.recData[3];
        number.innerHTML=order.senData[5];
        orderN.innerHTML=order.orderId;
        this.recentOrder= order;
        this.nextButton();
      },
      randomNum:function() {
        return Math.random() * (0.1) - 0.05;
       },
       orderDroppedOff: function () {
        // Update used capacity
        
  
        Vue.delete(this.orders, this.recentOrder.orderId);
       
       
       
       
        socket.emit("orderDroppedOff", this.recentOrder.orderId);
        this.recentOrder=null;
        this.index=1;
      }

      
      }
});

function menu() {
  document.querySelector('.menu').classList.toggle('active');
}

function openForm() {
  document.getElementById('orderDone').style.display="none";
  document.getElementById("myForm").style.display = "block";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
  document.getElementById('orderDone').style.display=" block";
}

const issue= document.querySelector('form');

issue.addEventListener('submit',(event)=>{
    event.preventDefault();
    const data= new FormData(issue);
    const text= data.get('issue');
    console.log(text);
    issue.reset();
})
