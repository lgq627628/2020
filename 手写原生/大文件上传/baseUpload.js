document.querySelector('input[type="file"]').addEventListener('change',function(e) {
  var startByte = 0,
      endByte = 0,
      mountByte = 100,
      blob = this.file[0];
  while(startByte < blob.size){
      var xhr = new xmlHttpRequest();
      xhr.open('POST',url,true);
      endByte = startByte + mountByte;
      var newBlob = blob.slice(startByte,endByte);
      xhr.send(newBlob);
      startByte = endByte;
  }
});
