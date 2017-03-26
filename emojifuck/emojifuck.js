var data=[0],runData=[];
var pointer=0,runPointer=0,inpPointer=0;
var input,iters=0,runs=0;
var outElem,msgElem,bar,time,thread=null;
var showEmoji=true,live=true,scroll=true,comp=false,tour=false;
var openName=null;

var ops=["incp","decp","inc","dec","putchar","getchar","cond","break"];
var origKeys=['>','<','+','-','.',',','[',']'];
var keys=[56393,56392,56834,56881,56396,56495,56908,56911];
var emoji=['👉','👈','😂','😱','👌','💯','🙌','🙏'];

var buttons=document.getElementsByClassName("emojibutton");
var numinputs=document.querySelectorAll("input[type=number]");
var opsquares,memsquares,memlen=16*6;
var infield=document.getElementById("datain");
var bf=new Brainfuck();

var uservars={
  maxiter:10000,
  throttle:10,
  maxmem:1000
};
var projects=JSON.parse(localStorage.getItem("projects")) || {};
loadDefault();

for (var i=0;i<buttons.length;i++){
  buttons[i].addEventListener("click",function(event){
    clickButton(event);
  });
  buttons[i].setAttribute("data-emoji",emoji[i]);
  buttons[i].setAttribute("data-index",i);
}
for (var i=0;i<numinputs.length;i++){
  numinputs[i].addEventListener("change",function(event){updateUserVars(event);});
  numinputs[i].addEventListener("keyup",function(event){updateUserVars(event);});
}
infield.addEventListener("keydown",function(event){
  if (event.keyCode==9){
    if (event.shiftKey){
      addChar("",true);
      infield.selectionStart--;
      infield.selectionEnd--;
    }else{
      addChar("\t");
    }
    event.preventDefault();
  }else{
    setTimeout(function(){
      if (event.ctrlKey&&event.keyCode==86){
        infield.value=showEmoji?asciiToEmoji():emojiToAscii();
        return;
      }
      if (!showEmoji){return;}
      var char=infield.value[infield.selectionStart-1];
      for (var i in origKeys){
        if (char==origKeys[i]){
          addChar(emoji[i],true);
        }
      }
    },10);
  }
});
var huhs=document.getElementsByClassName("huh");
for (var i=0;i<huhs.length;i++){
  huhs[i].addEventListener("click",function(event){
    alert(event.target.title);
  });
}
document.getElementById("files").addEventListener("click",function(event){
  if (event.target.className=="file"){
    document.getElementById("fileinput").value=event.target.getAttribute("true_name");
    searchFiles();
  }
});
window.addEventListener("load",loadData);
window.addEventListener("unload",saveData);
document.body.addEventListener("mousemove",function(){addTourInfo(event)});
document.getElementById("fileinput").addEventListener("keyup",searchFiles);

function run(){
  inpPointer=0;
  runPointer=0;
  pointer=0;
  iters=0;
  data=[0];
  
  addLine();
  
  fillMem();
  memsquares[0].classList.remove("inactive");
  runData=toDataArr(document.getElementById("datain").value);
  input=document.getElementById("input").value;
  document.body.setAttribute("running",true);
  document.body.setAttribute("playing",true);
  for (var i=0;i<numinputs.length;i++){
    numinputs[i].value=uservars[numinputs[i].getAttribute("data-name")];
  }
  
  main:
  for (var i=runData.length-1;i>=0;i--){
    if (runData[i].op=="cond"){
      for (var n=i+1;n<runData.length;n++){
        if (runData[n].jump==undefined&&runData[n].op=="break"){
          runData[i].jump=n;
          runData[n].jump=i;
          continue main;
        }
      }
      showError("Failed to compile: unmatched bracket at character "+runData[i].pos);
      infield.focus();
      var start=normalizePos(runData[i].pos+i*(showEmoji?1:0));
      infield.selectionStart=start-(showEmoji?2:1);
      infield.selectionEnd=start;
      time=new Date().getTime();
      completeRun();
      return;
    }
  }
  
  for (var i in runData){
    if ((runData[i].op=="cond"||runData[i].op=="break")&&runData[i].jump==undefined){
      showError("Failed to compile: unmatched bracket at character "+runData[i].pos);
      infield.focus();
      var start=normalizePos(runData[i].pos+i*(showEmoji?1:0));
      infield.selectionStart=start-(showEmoji?2:1);
      infield.selectionEnd=start;
      time=new Date().getTime();
      completeRun();
      return;
    }
  }
  
  time=new Date().getTime();
  
  if (runData.length==0){
    completeRun();
    return;
  }
  
  document.title=(openName || "untitled")+" (running)";
  
  if (live){
    genLive();
    opsquares=document.getElementsByClassName("opsquare");
    cycle();
    thread=setInterval(cycle,uservars.throttle);
  }else{
    /*while (runPointer<runData.length){
      bf[runData[runPointer].op](runData[runPointer].jump);
      runPointer++;
      iters++;
      if (iters>=uservars.maxiter){
        showError("Max runtime exceeded");
        break;
      }
    }
    completeRun();*/
    thread=setInterval(shortCycle,0);
  }
}

function pause(){
  clearInterval(thread);
  document.body.setAttribute("playing",false);
}

function play(){
  document.body.setAttribute("playing",true);
  if (live){
    thread=setInterval(cycle,uservars.throttle);
  }else{
    thread=setInterval(shortCycle,0);
  }
}

function step(){
  cycle();
}

function addLine(){
  outElem=document.createElement("div");
  outElem.className="consolemsg";
  var left=document.createElement("div");
  left.className="left";
  bar=document.createElement("div");
  bar.className="bar";
  outElem.appendChild(left);
  outElem.appendChild(bar);
  var cns=document.getElementById("console");
  cns.appendChild(outElem);
  addMsg();
}

function addMsg(){
  msgElem=document.createElement("pre");
  bar.appendChild(msgElem);
  document.getElementById("console").scrollTop=1e8;
}

function shortCycle(){
  for (var i=0;i<1000;i++){
    if (runPointer<runData.length){
      bf[runData[runPointer].op](runData[runPointer].jump);
      runPointer++;
      iters++;
      if (iters>=uservars.maxiter){
        showError("Max instruction count exceeded");
        completeRun();
        return
      }else if(pointer>=1000000){
        showError("Memory warning - cell count extremely high");
        completeRun();
        return
      }
    }else{
      completeRun();
      return;
    }
  }
  completeRun(true);
}

function cycle(){
  if (runPointer<runData.length){
    opsquares[runPointer>0?runPointer-1:0].classList.remove("active");
    if (pointer<uservars.maxmem){
      memsquares[pointer].classList.remove("active");
    }
    bf[runData[runPointer].op](runData[runPointer].jump);
    completeRun(true);
    opsquares[runPointer].classList.add("active");
    if (pointer<uservars.maxmem){
      if (pointer>=memlen){
        hexCellsHigher();
      }
      memsquares[pointer].classList.add("active");
      memsquares[pointer].classList.remove("inactive");
      memsquares[pointer].innerHTML=data[pointer];
      if (scroll){
        var memory=document.getElementById("memory");
        var rect=memsquares[pointer].getBoundingClientRect();
        memory.scrollTop=memsquares[pointer].offsetTop+rect.height/2-memory.offsetHeight/2;
        
        var opline=document.getElementById("opline");
        var rect=opsquares[runPointer].getBoundingClientRect();
        opline.scrollTop=opsquares[runPointer].offsetTop+rect.height/2-opline.offsetHeight/2;
      }
    }
    runPointer++;
    iters++;
    if (iters>=uservars.maxiter){
      showError("Max instruction count exceeded");
      completeRun();
    }
  }else{
    opsquares[runPointer>0?runPointer-1:0].classList.remove("active");
    completeRun();
  }
}

function completeRun(noPrint){
  var newTime=new Date().getTime()-time;
  if (newTime<1000){
    newTime+=" ms";
  }else{
    var zeroes=(""+newTime).length-((""+newTime/1000).length-1);
    newTime=""+(newTime/1000);
    if (zeroes==4){newTime+="."; zeroes--;}
    for (var i=0;i<zeroes;i++){
      newTime+="0";
    }
    newTime+=" s";
  }
  
  document.getElementById("runtime_data").innerHTML=newTime;
  document.getElementById("instr_data").innerHTML=iters;
  document.getElementById("mem_data").innerHTML=data.length;
  document.getElementById("op_data").innerHTML=runData.length;
  
  document.getElementById("console").scrollTop=1e8;
  
  if (!noPrint){
    addMsg();
    msgElem.innerHTML="run "+(++runs)+" ("+newTime+")";
    msgElem.className="gray";
    document.body.setAttribute("running",false);
    document.body.setAttribute("playing",false);
    document.title=(openName || "untitled")+" - emojifuck";
    clearInterval(thread);
  }
}

function stop(){
  showError("Interrupted script");
  completeRun();
}

function Brainfuck(){
  this.inc=function(){
    data[pointer]=(data[pointer]+1)%256;
  }
  
  this.dec=function(){
    data[pointer]=(255+data[pointer])%256;
  }
  
  this.incp=function(){
    pointer++;
    if (data.length<=pointer){data.push(0);}
  }
  
  this.decp=function(){
    var dl=data.length;
    pointer=(dl-1+pointer)%dl;
  }
  
  this.putchar=function(){
    var char=String.fromCharCode(data[pointer]);
    if (char=="\n"){addMsg();}
    else if(data[pointer]!=13){msgElem.innerHTML+=char;}
  }
  
  this.getchar=function(){
    data[pointer]=(input.charCodeAt(inpPointer) || 0);
    inpPointer++;
  }
  
  this.cond=function(jump){
    if (!data[pointer]){
      runPointer=jump;
    }
  }
  
  this.break=function(jump){
    if (data[pointer]){
      runPointer=jump;
    }
  }
}

function loadDefault(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var prjs=JSON.parse(this.responseText);
      for (var i in prjs){
        if (!projects[i]){
          projects[i]=prjs[i];
        }
      }
    }
  };
  
  xhttp.open("GET","https://picturelements.github.io/textfiles/defaultBF.json",true);
  xhttp.send();
}

function toDataArr(str,showNL){
  var opOut=[],count=0;
  for (var i in str){
    count++;
    if (showNL&&str[i]=="\n"){
      opOut.push({op:"newline"});
    }
    for (var n=0;n<8;n++){
      if (keys[n]==str[i].charCodeAt(0)||!showEmoji&&origKeys[n]==str[i]){
        if (showEmoji){count--;}
        opOut.push({
          op:ops[n],
          pos:count,
          opindex:n
        });
        break;
      }
    }
  }
  return opOut;
}

function clickButton(evt){
  var index=evt.target.getAttribute("data-index");
  addChar(showEmoji?emoji[index]:origKeys[index]);
}

function addChar(emoji,omitLast){
  omitLast=omitLast?1:0;
  var sIndex=infield.selectionStart;
  var start=infield.value.substring(0,normalizePos(sIndex-omitLast));
  var end=infield.value.substring(normalizePos(infield.selectionEnd),infield.value.length);
  infield.value=start+emoji+end;
  infield.focus();
  infield.selectionStart=normalizePos(sIndex-omitLast)+1;
  infield.selectionEnd=normalizePos(sIndex-omitLast)+1;
}

function normalizePos(pos){
  if (infield.value.charCodeAt(pos)!=null&&infield.value.charCodeAt(pos-1)==55357){
    return pos+1;
  }
  return pos;
}

function showError(str){
  addMsg();
  msgElem.innerHTML=str;
  outElem.classList.add("error");
  msgElem.classList.add("error");
}

function asciiToEmoji(){
  var out="";
  main:
  for (var i in infield.value){
    for (var n=0;n<8;n++){
      if (infield.value[i]==origKeys[n]){
        out+=emoji[n];
        continue main;
      }
    }
    out+=infield.value[i];
  }
  return out;
}

function emojiToAscii(onlyKeys){
  var str=infield.value;
  var out="";
  main:
  for (var i in str){
    var cc=str.charCodeAt(i);
    if (cc!=55357){
      for (var n=0;n<8;n++){
        if (cc==keys[n]||cc==origKeys[n].charCodeAt(0)){
          out+=origKeys[n];
          continue main;
        }
      }
      if (!onlyKeys)out+=str[i];
    }
  }
  return out;
}

function toggleMode(){
  showEmoji=!showEmoji;
  infield.value=showEmoji?asciiToEmoji():emojiToAscii();
  document.getElementById("toggleEmoji").innerHTML=(showEmoji?"emoji":"ascii")+" mode";
  document.body.setAttribute("emoji",showEmoji);
}

function toggleLive(){
  live=!live;
  document.body.setAttribute("live",live);
  document.getElementById("toggleLive").innerHTML="simulation mode: "+(live?"on":"off");
  if (live){
    document.getElementById("opline").innerHTML="";
    fillMem();
  }
}

function toggleComp(){
  comp=!comp;
  document.body.setAttribute("wrap",comp);
  document.getElementById("toggleComp").innerHTML="compressed: "+(comp?"on":"off");
}

function toggleScroll(){
  scroll=!scroll;
  document.getElementById("toggleScroll").innerHTML="auto scroll: "+(scroll?"on":"off");
}

function updateUserVars(evt){
  var val=evt.target.value
  if (val!=""&&val>=0){
    uservars[evt.target.getAttribute("data-name")]=parseInt(val);
  }
}

function genLive(){
  var opline=document.getElementById("opline");
  opline.innerHTML="";
  var rd=toDataArr(infield.value,true);
  for (var i in rd){
    if (rd[i].op=="newline"){
      var spacer=document.createElement("div");
      spacer.className="spacer";
      opline.appendChild(spacer);
      continue;
    }
    var opsquare=document.createElement("div");
    opsquare.className="opsquare "+(i==0?"active":"");
    opsquare.setAttribute("data-emoji",emoji[rd[i].opindex]);
    opsquare.setAttribute("data-key",origKeys[rd[i].opindex]);
    opline.appendChild(opsquare);
  }
}

function closeWin(elem){
  elem=getParent(elem,"popup");
  elem.style.display="none";
  elem.parentElement.style.display="none";
}

function getRaw(){
  document.getElementById("shadow").style.display="flex";
  var pt=document.getElementById("plaintext");
  pt.style.display="flex";
  var ta=pt.getElementsByTagName("textarea")[0];
  ta.value=emojiToAscii(true);
  setTimeout(function(){ta.select();},1);
}

function saveData(returnObj){
  var data={
    name:openName,
    vars:uservars,
    code:infield.value,
    input:document.getElementById("input").value,
    showEmoji:showEmoji,
    live:live,
    comp:comp,
    scroll:scroll
  };
  localStorage.setItem("userdata",JSON.stringify(data));
  return JSON.parse(JSON.stringify(data));
}

function loadData(obj){
  var data=!obj||obj.constructor.name=="Event"?JSON.parse(localStorage.getItem("userdata")):obj;
  console.log(data);
  if (data!=null){
    infield.value=data.code;
    document.getElementById("input").value=data.input;
    for (var i in data.vars){
      document.querySelector("input[data-name="+i+"]").value=data.vars[i];
    }
    uservars=data.vars;
    if (data.showEmoji^showEmoji){toggleMode();}
    if (data.live^live){toggleLive();}
    if (data.comp^comp){toggleComp();}
    if (data.scroll^scroll){toggleScroll();}
    
    openName=data.name || null;
    document.title=(openName || "untitled")+" - emojifuck";
  }
}

function saveProject(elem){
  var name=document.getElementById("fileinput").value;
  if (name==""){return;}
  if (projects[name]&&elem.innerHTML=="save"){
    elem.innerHTML="save over?";
    return;
  }
  openName=name;
  document.title=name+" - emojifuck";
  projects[name]={
    data:saveData(true),
    created:new Date().getTime(),
    size:emojiToAscii().length
  };
  elem.innerHTML="save";
  localStorage.setItem("projects",JSON.stringify(projects));
  closeWin(elem);
}

function openProject(elem){
  var name=document.getElementById("fileinput").value;
  if (!projects[name]){
    elem=document.querySelector(".file[name*='"+name.toLowerCase()+"']");
    if (!elem){return}
    name=elem.getAttribute("true_name");
  }
  loadData(projects[name].data);
  closeWin(elem);
  document.getElementById("opline").innerHTML="";
  fillMem();
}

function newProject(elem){
  if (thread){completeRun();}
  runs=0;
  openName=null;
  document.title="untitled - emojifuck";
  infield.value="";
  document.getElementById("input").value="";
  document.getElementById("console").innerHTML="";
  document.getElementById("opline").innerHTML="";
  document.getElementById("runtime_data").innerHTML="N/A";
  document.getElementById("instr_data").innerHTML="N/A";
  document.getElementById("mem_data").innerHTML="N/A";
  document.getElementById("op_data").innerHTML="N/A";
  fillMem();
  closeWin(elem);
}

function genFileList(){
  var container=document.getElementById("files");
  container.innerHTML="";
  var elems=[];
  for (var name in projects){
    var file=document.createElement("div");
    file.className="file";
    file.setAttribute("name",name.toLowerCase());
    file.setAttribute("true_name",name);
    file.innerHTML="<span>"+name+"</span><span>"+projects[name].size+" characters</span><span>"+new Date(projects[name].created).toLocaleString()+"</span>";
    elems.push({
      dom:file,
      name:name
    });
  }
  
  for (var i=0;i<elems.length;i++){
    for (var n=i+1;n<elems.length;n++){
      if (elems[i].name.localeCompare(elems[n].name)>0){
        var tmpElem=elems[i];
        elems[i]=elems[n];
        elems[n]=tmpElem;
      }
    }
  }
  
  for (var i in elems){
    container.appendChild(elems[i].dom);
  }
}

function openSaveOpen(type){
  document.getElementById("shadow").style.display="flex";
  var so=document.getElementById("saveopen");
  so.style.display="flex";
  so.setAttribute("type",type);
  document.getElementById("fileinput").value=type=="save"&&openName?openName:"";
  genFileList();
  searchFiles();
  document.getElementById("fileinput").focus();
}

function getParent(elem,cls){
  while(true){
    if (elem.classList.contains(cls)){return elem;}
    if (elem.tagName=="BODY"){return null;}
    elem=elem.parentElement;
  }
}

function searchFiles(){
  var term=document.getElementById("fileinput").value;
  document.getElementById("search").innerHTML=term?".file[name*='"+term.toLowerCase()+"']{display:flex;}":".file{display:flex;}";
  document.getElementsByClassName("sobutton")[0].innerHTML="save";
}

function fillMem(){
  var container=document.getElementById("innermem");
  container.innerHTML="";
  memlen=Math.min(16*7,uservars.maxmem);
  for (var i=0;i<memlen;i++){
    if (i%16==0){
      addCountSq(Math.floor(i/16),container);
    }
    var square=document.createElement("div");
    square.className="memsquare inactive";
    square.innerHTML="0";
    container.appendChild(square);
  }
  memsquares=container.getElementsByClassName("memsquare");
}

function hexCellsHigher(){
  var container=document.getElementById("innermem");
  addCountSq(Math.floor((memlen+1)/16),container);
  for (var i=0;i<16&&memlen+i<uservars.maxmem;i++){
    var square=document.createElement("div");
    square.className="memsquare inactive";
    square.innerHTML="0";
    container.appendChild(square);
  }
  memlen+=16;
  memsquares=container.getElementsByClassName("memsquare");
}

function addCountSq(val,container){
  var square=document.createElement("div");
  square.className="countsquare";
  square.innerHTML=val;
  container.appendChild(square);
}

function addCountBar(){
  var container=document.getElementById("countbar");
  addCountSq("",container);
  for (var i=0;i<16;i++){
    addCountSq(i,container);
  }
}
addCountBar();
fillMem();

function closeTip(elem){
  elem.parentElement.style.display="none";
  setTour(false);
}

function startTour(){
  saveData();
  setTour(true);
  document.getElementById("tourbubble").style.display="none";
  document.getElementById("shadowbox").style.display="none";
  infield.value="";
  document.getElementById("input").value="";
  if (!showEmoji){toggleMode();}
  if (!live){toggleLive();}
}

function revert(){
  loadData();
  setTour(false);
}

function setTour(bool){
  document.body.setAttribute("tour",bool);
  tour=bool;
}

function addTourInfo(evt){
  if (tour){
    var td=getTourData(evt.target);
    var tb=document.getElementById("tourbubble");
    var sb=document.getElementById("shadowbox");
    tb.style.display=td?"block":"none";
    sb.style.display=td?"block":"none";
    if (td){
      var arr=td.split("|");
      tb.innerHTML="<p><b>"+arr[0]+"</b><br>"+arr[1]+"</p>";
      var rect=getAnchorElem(evt.target).getBoundingClientRect();
      var top=window.scrollY+rect.top;
      tb.style.top=((rect.top+rect.height+tb.offsetHeight+10<window.innerHeight)?(top+rect.height+5):(top-tb.offsetHeight-5))+"px";
      tb.style.left=rect.left+"px";
      sb.style.top=top+"px";
      sb.style.left=rect.left+"px";
      sb.style.width=rect.width+"px";
      sb.style.height=rect.height+"px";
    }
  }
}

function getTourData(elem){
  while(true){
    var dt=elem.getAttribute("data-tour");
    if (dt){return dt;}
    else if (elem.tagName=="BODY"){return false;}
    elem=elem.parentElement;
  }
}

function getAnchorElem(elem){
  while(true){
    if (elem.tagName=="DIV"||elem.getAttribute("data-tour")!=null||elem.tagName=="BODY"){return elem;}
    elem=elem.parentElement;
  }
}
