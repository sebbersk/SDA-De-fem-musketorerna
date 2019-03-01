/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
'use strict';
var socket = io();

var vm = new Vue({
  el: '#page',
  data: {
    express: null,
    orderId: null,
    map: null,
    fromMarker: null,
    destMarker: null,
    baseMarker: null,
    driverMarkers: {}
  },
  created: function () {
   /* socket.on('initialize', function (data) {
      // add marker for home base in the map
      this.baseMarker = L.marker(data.base, {icon: this.baseIcon}).addTo(this.map);
      this.baseMarker.bindPopup("This is the dispatch and routing center");
    }.bind(this));*/
    socket.on('orderId', function (orderId) {
      this.orderId = orderId;
    }.bind(this));

    // These icons are not reactive
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
    this.map.on('click', this.handleClick);

    var searchDestControl = L.esri.Geocoding.geosearch({allowMultipleResults: false, zoomToResult: false, placeholder: "Destination"}).addTo(this.map);
    var searchFromControl = L.esri.Geocoding.geosearch({allowMultipleResults: false, zoomToResult: false, placeholder: "From"});
    // listen for the results event and add the result to the map
    searchDestControl.on("results", function(data) {
        this.destMarker = L.marker(data.latlng, {draggable: true}).addTo(this.map);
        this.destMarker.on("drag", this.moveMarker);
        searchFromControl.addTo(this.map);
    }.bind(this));

    // listen for the results event and add the result to the map
    searchFromControl.on("results", function(data) {
        this.fromMarker = L.marker(data.latlng, {icon: this.fromIcon, draggable: true}).addTo(this.map);
        this.fromMarker.on("drag", this.moveMarker);
        this.connectMarkers = L.polyline([this.fromMarker.getLatLng(), this.destMarker.getLatLng()], {color: 'blue'}).addTo(this.map);
    }.bind(this));
  },
  methods: {
    placeOrder: function() {
      socket.emit("placeOrder", { fromLatLong: [this.fromMarker.getLatLng().lat, this.fromMarker.getLatLng().lng],
        destLatLong: [this.destMarker.getLatLng().lat, this.destMarker.getLatLng().lng],
        expressOrAlreadyProcessed: this.express ? true : false,
        orderDetails: { pieces: 1, spaceRequired: 3, totalGrams: 5600,  driverInstructions: "Beware of the dog" }
      });
    },
    getPolylinePoints: function() {
      if (this.express) {
        return [this.fromMarker.getLatLng(), this.destMarker.getLatLng()];
      } else {
        return [this.fromMarker.getLatLng(), this.baseMarker.getLatLng(), this.destMarker.getLatLng()];
      }
    },
    handleClick: function (event) {
      // first click sets pickup location
      if (this.fromMarker === null) {
        this.fromMarker = L.marker(event.latlng, {icon: this.fromIcon, draggable: true}).addTo(this.map);
        this.fromMarker.on("drag", this.moveMarker);
      }
      // second click sets destination
      else if (this.destMarker === null) {
        this.destMarker = L.marker([event.latlng.lat, event.latlng.lng], {draggable: true}).addTo(this.map);
        this.destMarker.on("drag", this.moveMarker);
        this.connectMarkers = L.polyline(this.getPolylinePoints(), {color: 'blue'}).addTo(this.map);
      } 
      // subsequent clicks assume moved markers
      else {
        this.moveMarker();
      }
    },
    moveMarker: function (event) {
      this.connectMarkers.setLatLngs(this.getPolylinePoints(), {color: 'blue'});
      /*socket.emit("moveMarker", { orderId: event.target.orderId,
                                latLong: [event.target.getLatLng().lat, event.target.getLatLng().lng]
                                });
                                */
    },
    
  }
});

function menu() {
  document.querySelector('.menu').classList.toggle('active');
}

var pages = new Vue({
  el: '#pages',
  data: {
      index: 0,
      express: null,
      orderId: null,
      order: {}
  },
  created: function () {
    //socket.on('initialize', function (data) {
      // add marker for home base in the map
      //this.baseMarker = L.marker(data.base, {icon: this.baseIcon}).addTo(this.map);
      //this.baseMarker.bindPopup("This is the dispatch and routing center");
    //}.bind(this));
     socket.on('orderId', function (orderId) {
       this.orderId = orderId;
     }.bind(this));
   },
  methods: {
      nextButton: function() {
          this.index++;
          window.scrollTo(0,0);
          history.pushState(null,"index",null);
      },
      popUp: async function(){
        var popup=document.getElementById('popup');
        popup.style.display= "block";
        await sleep(2000);
        popup.style.display="none";

        
      },
      saveReceiverData: function(){
       event.preventDefault();
        var packageOpt= document.getElementById('pack').value;
        var fstName= document.getElementById('fstNameR').value;
        var lastName= document.getElementById('lastNameR').value;
        var street= document.getElementById('strNameR').value;
        var zip= document.getElementById('zipR').value;
        if(fstName.toString().trim() == '' || lastName.toString().trim()==''||street.toString().trim()=='' || zip.toString().trim()==''){
          this.popUp()
          return;

        }
       
        var receiverData=[];
        receiverData[0]= packageOpt;
        receiverData[1]= fstName;
        receiverData[2]= lastName;
        receiverData[3]=street;
        receiverData[4]= zip;
        
        this.order.recData=receiverData;
        console.log(this.order);
        this.nextButton();
       
        
      },
      checkExpress: function(){
        var express= this.express ? true: false;
        this.order.express= express;
        console.log(this.order);
        this.nextButton();
      },
      saveSenderData: function () {
        event.preventDefault();
        var fstName= document.getElementById('fstNameS').value;
        var lastName= document.getElementById('lastNameS').value;
        var street= document.getElementById('strNameS').value;
        var zip= document.getElementById('zipS').value;
        var email= document.getElementById('emailS').value;
        var phone= document.getElementById('phoneS').value;
        var senderData=[];
        senderData[0]= fstName;
        senderData[1]= lastName;
        senderData[2]= street;
        senderData[3]=zip;
        senderData[4]= email;
        senderData[5]=phone;
        this.order.senData= senderData;
        this.order.fromLatLong = [(Math.random() * (59.8670 - 59.8320) + 59.8320).toFixed(4), (Math.random() * (17.7440 - 17.5600) + 17.5600).toFixed(4)];
	      this.order.destLatLong = [(Math.random() * (59.8670 - 59.8320) + 59.8320).toFixed(4), (Math.random() * (17.7440 - 17.5600) + 17.5600).toFixed(4)];

        console.log(this.order);
        this.nextButton();
        
      },
      placeOrder: function() {
        socket.emit("placeOrder", this.order);
        this.nextButton();
        },
        returnMain:function(){
          this.index=0;
          window.scroll(0,0);
        }
    
  }
});


window.addEventListener('popstate', function(event) {
  pagesCustomer.index--;
}); 

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
