cur_frm.add_fetch("cell", "pcf", "pcf");
cur_frm.add_fetch("cell", "church", "church_master");
cur_frm.add_fetch("cell", "church_group", "church_group");
cur_frm.add_fetch("cell", "region", "region");
cur_frm.add_fetch("cell", "zone", "zone");
cur_frm.add_fetch("cell", "senior_cell", "senior_cell");

cur_frm.add_fetch("cell_master", "pcf", "pcf");
// cur_frm.add_fetch("cell_master", "church", "church_master");
cur_frm.add_fetch("cell_master", "church_group", "church_group");
cur_frm.add_fetch("cell_master", "region", "region");
cur_frm.add_fetch("cell_master", "zone", "zone");
cur_frm.add_fetch("cell_master", "senior_cell", "senior_cell");

// cur_frm.add_fetch("church", "pcf", "pcf");
// cur_frm.add_fetch("church", "cell", "cell_master");
cur_frm.add_fetch("church", "church_group", "church_group");
cur_frm.add_fetch("church", "region", "region");
cur_frm.add_fetch("church", "zone", "zone");
// cur_frm.add_fetch("church", "senior_cell", "senior_cell");

cur_frm.cscript.refresh =function(doc, dt, dn){
    get_server_fields('set_higher_values','','',doc, dt, dn, 1, function(r){
      refresh_field('region');
      refresh_field('zone');
      refresh_field('church_group');
      refresh_field('church_master');
      refresh_field('pcf');
      refresh_field('senior_cell');
      refresh_field('cell_master');
    });
}

frappe.ui.form.on("Task", "onload", function(frm) {
  if (in_list(user_roles, "Cell Leader")){
    set_field_permlevel('cell',1);
    set_field_permlevel('senior_cell',2);
    set_field_permlevel('church_master',2);
    set_field_permlevel('church_group',2);
    set_field_permlevel('pcf',2);
    set_field_permlevel('zone',2);
    set_field_permlevel('region',2);
  }
  else if(in_list(user_roles, "Senior Cell Leader")){
    set_field_permlevel('cell',1);
    set_field_permlevel('senior_cell',1);
    set_field_permlevel('church_master',2);
    set_field_permlevel('church_group',2);
    set_field_permlevel('pcf',2);
    set_field_permlevel('zone',2);
    set_field_permlevel('region',2);
  }
  else if(in_list(user_roles, "PCF Leader")){
    set_field_permlevel('cell',1);
    set_field_permlevel('senior_cell',1);
    set_field_permlevel('pcf',1);
    set_field_permlevel('church_master',2);
    set_field_permlevel('church_group',2);
    set_field_permlevel('zone',2);
    set_field_permlevel('region',2);
  }
  else if(in_list(user_roles, "Church Pastor")){
    set_field_permlevel('church',0);
    set_field_permlevel('cell',1);
    set_field_permlevel('senior_cell',1);
    set_field_permlevel('pcf',1);
    set_field_permlevel('church_master',1);
    set_field_permlevel('church_group',2);
    set_field_permlevel('zone',2);
    set_field_permlevel('region',2);
  }
  else if(in_list(user_roles, "Group Church Pastor")){
    set_field_permlevel('cell',1);
    set_field_permlevel('senior_cell',1);
    set_field_permlevel('pcf',1);
    set_field_permlevel('church_master',1);
    set_field_permlevel('church_group',1);
    set_field_permlevel('zone',2);
    set_field_permlevel('region',2);
  }
  else if(in_list(user_roles, "Zonal Pastor")){
    set_field_permlevel('cell',1);
    set_field_permlevel('senior_cell',1);
    set_field_permlevel('pcf',1);
    set_field_permlevel('church_master',1);
    set_field_permlevel('church_group',1);
    set_field_permlevel('zone',1);
    set_field_permlevel('region',2);
  }
  else if(in_list(user_roles, "Regional Pastor")){
    set_field_permlevel('cell',1);
    set_field_permlevel('senior_cell',1);
    set_field_permlevel('pcf',1);
    set_field_permlevel('church_master',1);
    set_field_permlevel('church_group',1);
    set_field_permlevel('zone',1);
    set_field_permlevel('region',1);
  } 

});

cur_frm.fields_dict['cell_master'].get_query = function(doc) {
  return {
    filters: {
      "church": doc.church
    }
  }
}

cur_frm.fields_dict["invitation_member_details"].grid.set_column_disp("present", 0);

frappe.ui.form.on("Cell Meeting Invitation", "validate", function(frm,doc) {
	if(frm.doc.meeting_category=="Cell Meeting"){
		if(!frm.doc.meeting_subject){
			msgprint("Please enter cell and 'Meeting Subject' before save..! ");
        	throw "Please enter cell and Meeting Subject.!"
		}
	}
	else if(frm.doc.meeting_category=="Church Meeting"){
		if(!frm.doc.meeting_sub){
			msgprint("Please select Church and 'Meeting Subject' before save..! ");
        	throw "Please enter Church and Meeting Subject.!"
		}
	}
});

frappe.ui.form.on("Cell Meeting Invitation", "meeting_category", function(frm,doc) {
  if (frm.doc.meeting_category=='Cell Meeting'){
    set_field_permlevel('cell',0);
    set_field_permlevel('church',2);
  }
  else {
    set_field_permlevel('cell',2);
    set_field_permlevel('church',1);
  }

	frappe.model.clear_table(frm.doc, "invitation_member_details");
	refresh_field("invitation_member_details");
});

frappe.ui.form.on("Cell Meeting Invitation", "refresh", function(frm,doc) {
		if(!frm.doc.__islocal ) {
			frm.add_custom_button(__("Update Attendance"), cur_frm.cscript.create_attendance,frappe.boot.doctype_icons["Customer"], "btn-default");
		}
});
frappe.ui.form.on("Cell Meeting Invitation", "onload", function(frm,doc) {
		$( "#map-canvas" ).remove();
		$(cur_frm.get_field("lon").wrapper).append('<div id="map-canvas" style="width: 425px; height: 125px;">Google Map</div>');
		if(!frm.doc.__islocal ) {
			cur_frm.cscript.create_pin_on_map(frm.doc,frm.doc.lat,frm.doc.lon);
			frm.add_custom_button(__("Update Attendance"), cur_frm.cscript.create_attendance,frappe.boot.doctype_icons["Customer"], "btn-default");
		}
		else{
			cur_frm.cscript.create_pin_on_map(frm.doc,'9.072264','7.491302');
    		
    	} 
});

cur_frm.cscript.create_attendance = function() {
		frappe.model.open_mapped_doc({
			method: "church_ministry.church_ministry.doctype.cell_meeting_invitation.cell_meeting_invitation.create_attendance",
			frm: cur_frm
		})
}


var geocoder;
var map;
var markers = [];
gmap = Class.extend({
        init: function(doc) {
                me= this;
                geocoder = new google.maps.Geocoder();
                var latlng = new google.maps.LatLng(9.072264,7.491302);
                var myOptions = {
                        zoom: 6,
                        center: latlng,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                map = new google.maps.Map($('.map-canvas'), myOptions);
                console.log(['map in gmap ',map]);
                //console.log($('#map-canvas'));
                //me.successFunction(doc.address, map)
                me.successFunction('abuja nigeria', map)
        },
        successFunction: function(position, map) {
                  geocoder.geocode( { 'address': cstr(position)}, function(results, status) {
                          console.log(['success fun result ',results]);
                          map.setCenter(results[0].geometry.location);
                          var marker = new google.maps.Marker({
                              map: map,
                              position: results[0].geometry.location
                          });
                          console.log(['last res ',results[0].geometry.location])
                          markers.push(marker);
                          map.setZoom(14);
                  });
        },
        setAllMap: function(map) {
                for (var i = 0; i < markers.length; i++) {
                        markers[i].setMap(map);
                }
        },
        clearOverlays: function (map) {
                this.setAllMap(map);
        },
        showOverlays: function () {
                this.setAllMap(map);
        },
        deleteOverlays: function (map) {
                this.clearOverlays(map);
                markers = [];
        },
        get_map:function(searchBox){
        var markers = [];  searchBox.bindTo('bounds', map);
                  var doc=cur_frm.doc
                  var infowindow = new google.maps.InfoWindow();
                  var marker = new google.maps.Marker({
                    map: map
                  });
                  google.maps.event.addListener(searchBox, 'place_changed', function() {
                    infowindow.close();
                    marker.setVisible(false);
                    searchBox.className = '';
                    var place = searchBox.getPlace();
                    if (!place.geometry) {
                      searchBox.className = 'notfound';
                      return;
                    }
                    if (place.geometry.viewport) {
                      map.fitBounds(place.geometry.viewport);
                    } else {
                      map.setCenter(place.geometry.location);
                      map.setZoom(10);
                    }
                    marker.setIcon(({
                      url: place.icon,
                      size: new google.maps.Size(71, 71),
                      origin: new google.maps.Point(0, 0),
                      anchor: new google.maps.Point(17, 34),
                      scaledSize: new google.maps.Size(35, 35)
                    }));
                    marker.setPosition(place.geometry.location);
                    marker.setVisible(true);
                    var address = '';
                    if (place.address_components) {
                      address = [
                        (place.address_components[0] && place.address_components[0].short_name || ''),
                        (place.address_components[1] && place.address_components[1].short_name || ''),
                        (place.address_components[2] && place.address_components[2].short_name || '')
                      ].join(' ');
                    }
                    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
                    infowindow.open(map, marker);
                  });
        },
        codeAddress: function (addr,str) {
                console.log(['address in codeAddress ',addr])
                me= this;
                var sAddress = addr
                geocoder.geocode( { 'address': sAddress}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                                map.setCenter(results[0].geometry.location);
                                var marker = new google.maps.Marker({
                                    map: map,
                                    position: results[0].geometry.location
                                });
                                markers.push(marker);
                                map.setZoom(6);
                        }
                        else {
                                alert("Geocode was not successful for the following reason: " + status);
                        }
                });
        }
});


cur_frm.cscript.create_pin_on_map=function(doc,lat,lon){
        //console.log(['create pin doc ', doc]);
        var latLng = new google.maps.LatLng(lat, lon);
        //console.log(["create pin latLng ",latLng]);
        var map = new google.maps.Map(document.getElementById('map-canvas'), {
            zoom: 6,
            center: latLng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          });
        //console.log(map);
        var marker = new google.maps.Marker({
            position: latLng,
            title: 'Point',
            map: map,
            draggable: true
          });

        updateMarkerPosition(latLng);
        geocodePosition(latLng);

        google.maps.event.addListener(marker, 'dragstart', function() {
            updateMarkerAddress('Dragging...');
        });

        google.maps.event.addListener(marker, 'drag', function() {
            updateMarkerStatus('Dragging...');
            updateMarkerPosition(marker.getPosition());
        });

        google.maps.event.addListener(marker, 'dragend', function() {
            updateMarkerStatus('Drag ended');
            geocodePosition(marker.getPosition());
          });
}

function geocodePosition(pos) {
      geocoder.geocode({
        latLng: pos
      }, function(responses) {
          //console.log(['responses in geocode position ',responses]);
        if (responses && responses.length > 0) {
          updateMarkerAddress(responses[0].formatted_address);
        } else {
          if(doc.__islocal) {
            //console.log(['responses length in geocode position ',responses.length]);
            alert('Cannot determine address at this location.');
          }
        }
      });
}

function updateMarkerAddress(str) {
  doc=cur_frm.doc
  doc.address= str;
  refresh_field('address')
}

function updateMarkerStatus(str) {
var s=1;
}

function updateMarkerPosition(latLng) {
  doc=cur_frm.doc
  //console.log(['latlon',latLng])
  //console.log(["update mrkr psn",latLng,doc.lat,doc.lon,latLng.lat(),latLng.lng()])
  doc.lat=latLng.lat()
  doc.lon=latLng.lng()
  //console.log([doc.lat,doc.lon,doc.name])
  refresh_field('lat')
  refresh_field('lon')
}

var geocoder = new google.maps.Geocoder();
var getMarkerUniqueId= function(lat, lng) {
    return lat + '_' + lng;
}

var getLatLng = function(lat, lng) {
    return new google.maps.LatLng(lat, lng);
};

cur_frm.cscript.map =function(doc, dt, dn){
        var searchBox;
        console.log(['map doc',doc]);
        //ip = $(this.frm.parent)[0].childNodes[6].childNodes[5].childNodes[1].childNodes[1].childNodes[0].childNodes[4].childNodes[2].childNodes[0].childNodes[1].childNodes[2].childNodes[1].childNodes[3].childNodes[1].childNodes
        geocoder.geocode( { 'address': cstr(cur_frm.doc.state)}, function(results, status) {
                         var latlong = results[0].geometry.location
                        console.log(['results in map',results])
                         cur_frm.cscript.callback(doc, dt, dn, latlong, doc.address)
                });
 }
cur_frm.cscript.callback = function(doc, dt, dn, ltln, ip){
        var latlong = new google.maps.LatLngBounds(new google.maps.LatLng(ltln.lb , ltln.mb));
        var options = {componentRestrictions: {country: 'in'}, bounds: latlong};
        var searchBox = new google.maps.places.Autocomplete(ip[0],options);
        console.log(['searchBox in callback ',searchBox])
        var o=new gmap(this.frm.doc);
        o.get_map(searchBox);
        var plc;
        google.maps.event.addListener(searchBox, 'place_changed', function() {
                var place = searchBox.getPlace();
                var doc=cur_frm.doc
                 cur_frm.cscript.create_pin_on_map(doc,place.geometry.location.k,place.geometry.location.D)
                cur_frm.set_value('lat',place.geometry.location.k)
                cur_frm.set_value('lon',place.geometry.location.D)
                cur_frm.set_value("address", place.formatted_address)
        });
}

cur_frm.cscript.address = function(doc, dt, dn){
        console.log(['in address trigger ',doc.address]);
        var o = new gmap(this.frm.doc);
        console.log(['o gmap after address trigger ',o]);
        o.codeAddress(doc.address)
}


/*cur_frm.get_field("address").$input.on("keypress", function() {
        console.log("hi on key up");
        console.log(['in address trigger ',doc.address]);
        var o = new gmap(this.frm.doc);
        console.log(['o gmap after address trigger ',o]);
        o.codeAddress(doc.address)
});*/


