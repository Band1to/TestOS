var numbers=['0','1','2','3','4','5','6','7','8','9'];
var operators=['+','-','*','/','^','%','(',')'];

function parse(input){
  var result;
  var formula=input;
  var splitFormula=[];
  for (iterate=0;iterate>=0;iterate++){
    var tmp="",charAt;
    var extFormula="-"+formula+"-";  //make the string a little longer
    for (i=1;i<extFormula.length-1;i++){
      cAt=extFormula.charAt(i);
      if (isOperator(cAt)){
        if (cAt=='-'){
          if (isOperator(extFormula.charAt(i-1))){
            if (isNumber(extFormula.charAt(i+1))){
              tmp+=cAt;
            }else if(isOperator(extFormula.charAt(i+1))){
              splitFormula.push(tmp,""+cAt);   //tmp=number, cAt=operator
              tmp="";
            }
          }else if(isNumber(extFormula.charAt(i-1))){
            splitFormula.push(tmp,""+cAt);   //tmp=number, cAt=operator
            tmp="";
          }
        }else{
          splitFormula.push(tmp,""+cAt);   //tmp=number, cAt=operator
          tmp="";
        }
      }else{
        tmp+=cAt;
      }
    }
    splitFormula.push(tmp);
    for (i=0;i<splitFormula.length;i++){
      console.log(splitFormula[i]);
    }
    break; //improve later
  }
  return result;
}

function isNumber(charIn){
  for (i=0;i<numbers.length;i++){
    if (charIn==numbers[i]){
      return true;
    }
  }
  return false;
}

function isOperator(charIn){
  for (i=0;i<operators.length;i++){
    if (charIn==operators[i]){
      return true;
    }
  }
  return false;
}
