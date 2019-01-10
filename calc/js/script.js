// проверка необходимости выбора домена
var domenYes = document.getElementById("domenYes"),
	domenNo = document.getElementById("domenNo"),
	domenChoiceBlock = document.getElementById("domenChoiceBlock");

domenYes.onclick = function() {
    domenChoiceBlock.classList.remove("invisible");
}
domenNo.onclick = function() {
    domenChoiceBlock.classList.add("invisible");
}



var result,
	form = document.getElementById("form-calculator"), 
	input = form.getElementsByTagName("input"), 
	value = 0,
	price = 0,
	duration = 0,
	time = 0;


for (var i=0; i < input.length; i++) { 
    input[i].addEventListener("click", Send);
  }
form.domenChoice.addEventListener("change", Send);

// document.addEventListener( "DOMContentLoaded", function() {
//   var elementsP = document.getElementsByTagName("input");
//   for (var i=0; i < elementsP.length, i++) { 
//     elementsP[i].addEventListener("click", myFunction);
//   }
// }
// //функция myFunction()
// send.onclick = function() {
//   //...
// }





 function Send() {


if(wp.checked) {
	moduleBlogWP.classList.add("opacity1");
} else {
	moduleBlogWP.classList.add("opacity0");
}

debugger
 	value = 0;
 	time = 0;
	for (i=0; i < input.length; i++) {
	if (input[i].name != "speed") { //проверка что поле не speed
		//выбор значений только отмеченных полей
		if (input[i].type == 'checkbox' && input[i].checked||input[i].type == 'radio' && input[i].checked) {
		        

		        price = Number((input[i].value).split('-')[0]); // запись значения поля к общей сумме
		        duration = Number((input[i].value).split('-')[1]);
		        value += price; // запись значения поля к общей сумме
		        time += duration;
		        console.log(value);
		    }
		}
	}


	var domen = Number((form.domenChoice.value).split('-')[0]); 
	value += domen;
	var speed = Number(form.speed.value); //получение числа в поле speed
	value = value+(value*speed)/100; //высчет и добавление процента стоимости от увеличения speed
	time = time-(time*(speed/2))/100;
    document.getElementById('resultPrice').innerHTML = value; //вывод результата
	document.getElementById('resultTime').innerHTML = time; //вывод результата
};







