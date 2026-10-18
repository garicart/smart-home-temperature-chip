var c = 32;
var cStart = 32;
var ThermometerLength = 100;
var Scale = ThermometerLength/10;
var xmlns = "http://www.w3.org/2000/svg",
  xlinkns = "http://www.w3.org/1999/xlink",
  select = function(s) {
    return document.querySelector(s);
  },
  selectAll = function(s) {
    return document.querySelectorAll(s);
  },
    liquid = selectAll('.liquid'),
    tubeShine = select('.tubeShine'),
    label = select('.label'),
    follower = select('.follower'),
    dragger = select('.dragger'),
    dragTip = select('.dragTip'),
    minDragY = -380,
    liquidId = 0,
    step = Math.abs(minDragY/(Scale*10)),
    snap = Math.abs(minDragY/10),
    followerVY = 0
  

TweenMax.set('svg', {
  visibility: 'visible'
})

TweenMax.set(dragTip, {
 transformOrigin:'20% 50%'
})

var tl = new TimelineMax()
tl.staggerTo(liquid, 0.7, {
 x:'-=200',
 ease:Linear.easeNone,
 repeat:-1
},0.9)

tl.time(100);

document.addEventListener("touchmove", function(event){
    event.preventDefault();
});
Draggable.create(dragger, {
 type:'y',
 bounds:{minY:minDragY, maxY:0},
 onDrag:onUpdate,
 throwProps:true,
 throwResistance:2300,
 onThrowUpdate:onUpdate,
 overshootTolerance:0,
 snap:function(value){
  //Use this to snap the values to steps of 10
  //return Math.round(value/snap) * snap
 }
})

function onUpdate(){
 liquidId = Math.abs(Math.round(dragger._gsTransform.y/step));
 label.textContent = liquidId + '°c';
 TweenMax.to(liquid, 1.3, {
  y:dragger._gsTransform.y*1.12,
  ease:Elastic.easeOut.config(1,0.4)
 })
 
}

TweenMax.to(follower, 1, {
 y:'+=0',
 repeat:-1,
 modifiers:{
  y:function(y, count){
  followerVY += (dragger._gsTransform.y - follower._gsTransform.y) * 0.23;
   followerVY *= 0.69;
   return follower._gsTransform.y + followerVY; 
  }
 }
})

TweenMax.to(dragTip, 1, {
 rotation:'+=0',
 repeat:-1,
 modifiers:{
  rotation:function(rotation, count){
   return rotation-followerVY
  }
 }
})

TweenMax.to(label, 1, {
 y:'+=0',
 repeat:-1,
 modifiers:{
  y:function(y, count){
   return y-followerVY * 0.5
  }
 }
})


TweenMax.to(dragger, 1.4, {
 y:minDragY/2,
 onUpdate:onUpdate,
 ease:Expo.easeInOut
});

//ScrubGSAPTimeline(tl);
function updateTemperature() {
  navigator.geolocation.getCurrentPosition(function(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;

    fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m")
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        temp = Math.round(data.current.temperature_2m);

        var now = new Date();
        console.log("最後更新時間：" +
          now.getHours() + ":" +
          String(now.getMinutes()).padStart(2, "0"));

        TweenMax.to(dragger, 1, {
         y: -(temp * step),
         onUpdate: onUpdate,
         ease: Expo.easeOut
        });
      });
  });
}

updateTemperature();
setInterval(updateTemperature, 60000);

var thermometer = document.querySelector(".whole");
var makeChip = document.querySelector("#makeChip");

function moveChipButton() {
  var rect = thermometer.getBoundingClientRect();

  makeChip.style.position = "fixed";
  makeChip.style.left = (rect.left + rect.width / 2) + "px";
  makeChip.style.top = (rect.bottom + 20) + "px";
  makeChip.style.right = "auto";
  makeChip.style.bottom = "auto";
  makeChip.style.transform = "translateX(-50%)";
  makeChip.style.display = "block";
  makeChip.style.visibility = "visible";
}

moveChipButton();
window.addEventListener("resize", moveChipButton);

document.querySelector("#makeChip").addEventListener("click", function() {
  var temperature = liquidId;
  var bitstream = temperature.toString(2).padStart(8, "0");

  document.querySelector("#bitstreamOutput").textContent = bitstream;
});
