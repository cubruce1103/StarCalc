var inputs = ["setAll","v2","achievement","masteryBoost17","target"];
var inpStars = ["inpStar1","inpStar2","inpStar3","inpStar4","inpStar5","inpStar6","inpStar7","inpStar8","inpStar9","inpStar10"]
var inpCheckbox = ["rememberMe","useMagic"]

window.onload = () => {
  applyLanguage();
  checkLocalStorage();
};

function onRememberMeChange(){
  if (document.getElementById("rememberMe").checked) 
  {
    setLocalStorage()
  }
  else
  {
    localStorage.clear();
  }
}

function setLocalStorage() {
  inputs.forEach(input => {
    localStorage.setItem(input,document.getElementById(input).value);
  });
  inpStars.forEach(input => {
    localStorage.setItem(input,document.getElementById(input).value);
  });
  inpCheckbox.forEach(input => {
    localStorage.setItem(input,document.getElementById(input).checked)
  })
  localStorage.setItem("inputNotation", document.getElementById("inputNotation").value)
}

function checkLocalStorage(){
  var cond = JSON.parse(localStorage.getItem("rememberMe"));
  if (!cond){
    localStorage.clear()
    calculate();
    return;
  }
  inpCheckbox.forEach(input => {
    document.getElementById(input).checked = JSON.parse(localStorage.getItem(input));
  });
  document.getElementById("rememberMe").checked = JSON.parse(localStorage.getItem("rememberMe"));
  inpStars.forEach(input => {
    if (Number(localStorage.getItem(input))) 
    {
      document.getElementById(input).value = localStorage.getItem(input);
    }
  });
  inputs.forEach(input => {
    if (Number(localStorage.getItem(input))) 
    {
      document.getElementById(input).value = localStorage.getItem(input);
    }
  });
  document.getElementById("inputNotation").value = localStorage.getItem("inputNotation");
  calculate();
}

function setAll() {
  inpStars.forEach(input => {
    if (input.includes("inpStar")) {
      document.getElementById(input).value = document.getElementById("setAll").value;
    }
    if (document.getElementById("target").value <= document.getElementById("setAll").value){
      
    document.getElementById("target").value = +document.getElementById("setAll").value + 1;
  }
  });
}
  
function calculate() {
  var isValid = true;
  inpStars.every(input => {
    if (document.getElementById(input).value <= 0) { // TODO can be raised to < 10
      document.getElementById(input).select();
      document.getElementById(input).classList.add("red");
      isValid = false;
      return;
    }
    isValid = true;
    return true;
  });
  if (!isValid) { return; }

  var stars = [
      document.getElementById("inpStar1").value,
      document.getElementById("inpStar2").value,
      document.getElementById("inpStar3").value,
      document.getElementById("inpStar4").value,
      document.getElementById("inpStar5").value,
      document.getElementById("inpStar6").value,
      document.getElementById("inpStar7").value,
      document.getElementById("inpStar8").value,
      document.getElementById("inpStar9").value,
      document.getElementById("inpStar10").value,
  ];

  var desired = document.getElementById("target").value;

  var gsAmount = 0;
  var magAmount = 0;
  var fragmentAmount = 0;
  var scrapyardMul = scrapyardModifier();
  var achievementMul = achievementModifier(); // scaled by 1000, to be multiplied
  var masteryBoost17Mul = masteryBoost17Modifier(); // To be multiplied

  stars.forEach((star) => {
      for (let index = Number(star); index < Number(desired); index++) {
          gsAmount += gsCost(index, scrapyardMul, achievementMul, masteryBoost17Mul);
          magAmount += magnetCost(index, scrapyardMul, achievementMul, masteryBoost17Mul);
          fragmentAmount += fragmentCost(index, scrapyardMul, achievementMul, masteryBoost17Mul);
      }
  });

  document.getElementById("gs").innerHTML = convertNumberToNotation(gsAmount);
  document.getElementById("mag").innerHTML = convertNumberToNotation(magAmount);
  document.getElementById("fragment").innerHTML = convertNumberToNotation(fragmentAmount);
  
  if ( document.getElementById("rememberMe").checked ) setLocalStorage();
  
}

function convertNumberToNotation(number) {
  if((Math.abs(number)<1e9) || (Math.abs(number)==1/0)) return number.toLocaleString(language);
  var exponent = Math.floor(Math.log10(number));
  var mantissa = (Math.floor(1e8 * (number / Math.pow(10,exponent)))/1e8);
  switch(document.getElementById("inputNotation").value){
    case "Original":
      return number.toLocaleString(language);
    case "Normal":
      mantissa *= Math.pow(10, exponent%3);
      var index = Math.floor(exponent/3)-1;
      var index1 = Math.floor(index%10)
      var index10 = Math.floor(index%100/10)
      var index100 = Math.floor(index%1000/100)
      var normal1 = ["", "U", "D", "T", "Q", "q", "S", "s", "O", "N"]
      var normal10 = ["", "D", "V", "Tr", "QU", "qu", "Se", "Sp", "Oc", "No"]
      var normal100 = ["", "C", "Overflow"]
      var normalConcat = ""
      switch(index%100){
        case 0:
          normalConcat = "".concat(normal100[index100], "t");
          break;
        case 1:
          normalConcat = "".concat(normal100[index100], "M")
          break;
        case 2:
          normalConcat = "".concat(normal100[index100], "B")
          break;
        default:
          normalConcat = "".concat(normal100[index100], normal1[index1], normal10[index10])
      }
      return "".concat(mantissa.toPrecision(9)," ",normalConcat)
    case "Abstract":
      mantissa *= Math.pow(10, exponent%3);
      var index = Math.floor(exponent/3)-1;
      return "".concat(mantissa.toPrecision(9)," ",convertIndexToAbstract(index))
    case "Scientific":
      return "".concat(mantissa.toPrecision(9),"e",exponent)
  }
}

function convertIndexToAbstract(index){
  if(index<=0) return ""
  var remainder = (Math.floor(index)-1)%26+1;
  return "".concat(convertIndexToAbstract((index-remainder)/26),String.fromCharCode(96+remainder))
}

function scrapyardModifier()
{
    var modifier;
    var level = document.getElementById("v2").value;
    if (level > 200)
      {
        modifier = (level - 200) * 4 + 300;
    }
    else
    {
      modifier = level;
      if (level > 100)
        modifier = (level - 100) * 2 + 100;
    }
    return modifier - 1;
}

function achievementModifier()
{
  var modifier;
  var amount = document.getElementById("achievement").value;
  modifier = Math.max(0, 1000 - Math.max(0,amount * 2));
  return modifier;
}

function masteryBoost17Modifier()
{
  var modifier;
  var amount = document.getElementById("masteryBoost17").value;
  modifier = Math.pow(0.99,Math.floor(amount/10));
  return modifier;
}

function magic(starLevel){ // I like it when *(long)2147483648 becomes *(long)2100000000 due to [REDACTED] - IcyZeroTwo
  if(starLevel < 1760) return 1;
  if(!document.getElementById("useMagic").checked) return 1;

  const BULK_SIZE = 300;
  const BULK_PRECISION = 1e8;
  const BULK_DEVIATION = (Math.floor(Math.pow(1.1,BULK_SIZE)/BULK_PRECISION)*BULK_PRECISION) / Math.pow(1.1,BULK_SIZE);

  var jumpCount = Math.floor((starLevel - 1760)/50);
  var bulkCount = Math.floor(jumpCount/BULK_SIZE);
  jumpCount -= bulkCount * BULK_SIZE;
  var precision = Math.pow(10, Math.floor((Math.log10(1.1) * jumpCount - 6) / 8) * 8 + 5);
  var jumpDeviation = (Math.floor(Math.pow(1.1,jumpCount)/precision)*precision) / Math.pow(1.1,jumpCount);
  return Math.pow(BULK_DEVIATION,bulkCount) * jumpDeviation;
}