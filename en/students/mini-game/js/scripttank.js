
var flagP;
function start(){// inner variables
  $('#startGame').attr('disabled','disabled');
  $('#area').css('display','none');
  $(".textArea h2:hidden").slideDown('slow');
var canvas, context; // canvas и context объекты
var iCellSize = 24; // ширина ячейки
var iXCnt = 26; // количество ячеек по оси X
var iYCnt = 26; // количество ячеек по оси  Y
var pause;
var clears;
var flag=true;  // флаг для контроля снаряда
var flag2 =false; // разрешает отрисовку снаряда
var flag3 =true; // разрешает запуск функции отрисовки танка противника
var flag4=true; // регулирует движение танка противника
var flag5=true;
var flag6=true; //разрешает отрисовку танка противника
var flag7=true; //pазрешает отрисовку танка
var flag10=true;
var flag20=false; //разрешает отрисовку снаряда противника
function loose(text){
  $(".textArea h2:hidden").html(text).slideDown('slow');   
}
function Bullet(x, y, w, h, z, image) { // функция конструктор обьекта снаряд
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.z = z;
    this.image = image;
}

function Tank(x, y, w, h, image) { // функция конструктор обьекта Танк
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.i = 0;
    this.image = image;
}

function clear(){
	context.clearRect(0, 0, canvas.width, canvas.height); // очишение игрового поля
}

function drawScene() { // Функция прорисовки игрового поля
	clear();
    context.fillStyle = '#111'; // цвет игрового поля
    context.fillRect(0, 0, canvas.width, canvas.height); // размеры игрового поля
    if(flag7){
       context.drawImage(oTank.image, oTank.i*oTank.w, 0, oTank.w, oTank.h, oTank.x, oTank.y, oTank.w, oTank.h); // прорисовка танка
    }
   if(flag6){ // отрисовка танка противника
    context.drawImage(oTankEn.image, oTankEn.i*oTankEn.w, 0, oTankEn.w, oTankEn.h, oTankEn.x, oTankEn.y, oTankEn.w, oTankEn.h);
    }
    /*context.drawImage(oTankEn2.image, oTankEn2.i*oTankEn2.w, 0, oTankEn2.w, oTankEn2.h, oTankEn2.x, oTankEn2.y, oTankEn2.w, oTankEn2.h);*/
    
    for (var y = 0; y < iYCnt; y++) {  // прогоняем через цикл все ячейки игрового поля
        for (var x = 0; x < iXCnt; x++) {
            switch (aMap[y][x]) {      //заполняем ячейки игрового поля изображениями
                case 0: // пустая ячейка
                    break;
                case 1: // прорисовка кирпичного блока
                    context.drawImage(imgBrick, 0, 0, iCellSize, iCellSize, x*iCellSize, y*iCellSize, iCellSize, iCellSize);
                    break;
                case 2: // прорисовка стального блока
                    context.drawImage(imgSteel, 0, 0, iCellSize, iCellSize, x*iCellSize, y*iCellSize, iCellSize, iCellSize);
                    break;
                case 3: // прорисовка леса
                    context.drawImage(imgForest, 0, 0, iCellSize, iCellSize, x*iCellSize, y*iCellSize, iCellSize, iCellSize);
                    break;
                case 4: // прорировка воды
                    context.drawImage(imgWater, 0, 0, iCellSize, iCellSize, x*iCellSize, y*iCellSize, iCellSize, iCellSize);
                    break;
                case 5: // прорировка вз
                    context.drawImage(imgExpl, 0, 0, iCellSize*2, iCellSize*2, x*iCellSize-12, y*iCellSize-12, iCellSize*2, iCellSize*2);
                    break;
            }
        }
    }
     
    if (flag2) { //отрисовка снаряда
        context.drawImage(oBullet.image, 0, 0, oBullet.w, oBullet.h, oBullet.x, oBullet.y, oBullet.w, oBullet.h); //прорисовка снаряда
    }

    if (flag20){ // отрисовка снаряда противника
        context.drawImage(oBullet2.image, 0, 0, oBullet2.w, oBullet2.h, oBullet2.x, oBullet2.y, oBullet2.w, oBullet2.h);
    }

    if (flag3) {
        flag3 = false;
        clears = setTimeout(moveTank, 200, oTankEn);
    }
    function moveTank(Tank) { // функция движения танка противника

        if (flag4) {

            if (Tank.x < oTank.x) {
                Tank.i = 0;
                var iCurCelX = Tank.x / iCellSize; // вычисление верхней левой ячейки (делим растояние от верхней левой точки танка на ширину одной ячейки)
                var iCurCelY = Tank.y / iCellSize; // занимаемой танком(танк всего занимает 4 ячейки)

                var iTest1 = aMap[iCurCelY][iCurCelX + 2]; //смотрим, что находится с права от танка
                var iTest2 = aMap[iCurCelY + 1][iCurCelX + 2];

                if ((iTest1 == 0 || iTest1 == 3) && (iTest2 == 0 || iTest2 == 3)) { //есле мы находимся в игровом поле и справа пустая клетка или лес
                    Tank.x += 24; // смещаемся вправо на ширину ячейки 24 пиксела
                }
                flag4 = false;

            } else {
                Tank.i = 1;
                var iCurCelX = Tank.x / iCellSize; // вычисление верхней левой ячейки (делим растояние от верхней левой точки танка на ширину одной ячейки)
                var iCurCelY = Tank.y / iCellSize; // занимаемой танком(танк всего занимает 4 ячейки) 

                var iTest1 = aMap[iCurCelY][iCurCelX - 1]; //смотрим, что находится слева от танка  
                var iTest2 = aMap[iCurCelY + 1][iCurCelX - 1];

                if ((iTest1 == 0 || iTest1 == 3) && (iTest2 == 0 || iTest2 == 3)) { //есле мы находимся в игровом поле и слева пустая клетка или лес
                    Tank.x -= 24; // смещаемся влево на ширину ячейки 24 пиксела
                }
                flag4 = false;
            }
        } else {

            if (Tank.y < oTank.y) {
                Tank.i = 3;
                var iCurCelX = Tank.x / iCellSize; // вычисление верхней левой ячейки (делим растояние от верхней левой точки танка на ширину одной ячейки)
                var iCurCelY = Tank.y / iCellSize; // занимаемой танком(танк всего занимает 4 ячейки) 

                var iTest1 = aMap[iCurCelY + 2][iCurCelX]; //смотрим, что находится внизу под танком iTest1 нужно сместиться от верхней левой ячейки танка
                var iTest2 = aMap[iCurCelY + 2][iCurCelX + 1]; // на две ячейки вниз, так как танк у нас шириной в 2 ячейки, смотрим и соседнюю ячейку по оси Х - iTest2

                if ((iTest1 == 0 || iTest1 == 3) && (iTest2 == 0 || iTest2 == 3)) { // если мы находимся в игровом поле и внизу находится пустота "0" или лес "3"
                    Tank.y += 24; // сдвигаем танк вниз на высоту одной ячейки "24" пиксела 
                }
                flag4 = true;
            } else {
                Tank.i = 2;
                var iCurCelX = Tank.x / iCellSize; // вычисление верхней левой ячейки (делим растояние от верхней левой точки танка на ширину одной ячейки)
                var iCurCelY = Tank.y / iCellSize; // занимаемой танком(танк занимает 4 ячейки)

                var iTest1 = aMap[iCurCelY - 1][iCurCelX]; //смотрим, что находится в ячейки выше iTest1
                var iTest2 = aMap[iCurCelY - 1][iCurCelX + 1]; // так как танк у нас шириной в 2 ячейки, смотрим и соседнюю ячейку по оси Х - iTest2

                if ((iTest1 == 0 || iTest1 == 3) && (iTest2 == 0 || iTest2 == 3)) { // если в просматриваемых ячейках находится пустота "0" или лес "3"
                    Tank.y -= 24; // сдвигаем танк вверх на высоту одной ячейки "24" пиксела   
                }
                flag4 = true;
            }
        }
        flag3 = true;
    }

    function expDelete(n,p){  //стираем изображение взрыва
          aMap[n][p]=0;
    }

    function deleteTank(a,b){  //стираем изображение взрыва танка противника
          aMap[a][b]=0;
          aMap[a+1][b]=0;
          aMap[a][b+1]=0;
          aMap[a+1][b+1]=0;
          oTankEn=0;
          $(".textArea h2").slideUp('slow');
          setTimeout(loose,1000,'you winner');  
          flag3=false;        
          flag=true;
          flag20=false;
          flag2=false;

    }
     function deleteTankMy(a,b){  //стираем изображение взрыва танка
          aMap[a][b]=0;
          aMap[a+1][b]=0;
          aMap[a][b+1]=0;
          aMap[a+1][b+1]=0;
          $(".textArea h2").slideUp('slow');
          setTimeout(loose,1000,'you loose');   
          oTank=0;       
          flag10=true;
          flag20=false;
          flag2=false;

    }   
    switch (oBullet.z){
      case 2:                                         //если танк смотрит вверх
         oBullet.y-=24;                                        //перемещение снаряда
               
                var iCurCelX = oBullet.x / iCellSize;          // координаты снаряда
                var iCurCelY = oBullet.y / iCellSize;       

if((iCurCelX==oTankEn.x / iCellSize) && (iCurCelY==oTankEn.y / iCellSize)) {flag6=false; flag10=false;  flag4 =false;                       //уничтожение танка
            aMap[oTankEn.y/iCellSize][oTankEn.x/iCellSize]=5; 
            aMap[(oTankEn.y+24)/iCellSize][oTankEn.x/iCellSize]=5; 
            aMap[oTankEn.y/iCellSize][(oTankEn.x+24)/iCellSize]=5; 
            aMap[(oTankEn.y+24)/iCellSize][(oTankEn.x+24)/iCellSize]=5; 
              
            setTimeout(deleteTank,100, (oTankEn.y/iCellSize), (oTankEn.x/iCellSize));
            break;
            }
                 if (oBullet.y < 0){                           //проверка на выход из игрового поля
                       oBullet=0;
                       flag=true;
                       flag2=false;
                       break;
                }                                             
                var iTest1 = aMap[iCurCelY+1][iCurCelX];       //координаты препядствия игрового поля
                var iTest2 = aMap[iCurCelY+1][iCurCelX+1];

                if (iTest1 == 1){
                        soundExp.play();
                        aMap[iCurCelY+1][iCurCelX]=5;           // снаряд попал в кирпичь, удаляем снаряд и кирпичь
                        oBullet=0;
                        flag=true;
                        flag2=false;                             // flag -разрешает производить выстрел
                        setTimeout(expDelete,100, iCurCelY+1, iCurCelX);}    // запускаем функцию удаления изображения взрыва
                if (iTest2 == 1){
                        soundExp.play();
                        aMap[iCurCelY+1][iCurCelX+1]=5;         
                        oBullet=0;
                        flag=true;
                        flag2=false;
                        setTimeout(expDelete,100, iCurCelY+1, iCurCelX+1);}
                if (iTest1 == 2 || iTest2 == 2){               // снаряд попал в сталь, удаляем снаряд                               
                        oBullet=0;
                        flag=true;
                        flag2=false;} 
                if (oBullet.y < 0){                           //обработка ошибки выстрела за пределом игрового поля
                       oBullet=0;
                       flag=true;
                       flag2=false;
                }                                                                     

      break;

      case 3:                                                   //если танк смотрит вниз
         oBullet.y+=24;                                         //перемещение снаряда

                var iCurCelX = oBullet.x / iCellSize;           // координаты снаряда
                var iCurCelY = oBullet.y / iCellSize;          

if((iCurCelX==oTankEn.x / iCellSize) && (iCurCelY==oTankEn.y / iCellSize)) {flag6=false; flag10=false; flag4 =false;                        //уничтожение танка
            aMap[oTankEn.y/iCellSize][oTankEn.x/iCellSize]=5; 
            aMap[(oTankEn.y+24)/iCellSize][oTankEn.x/iCellSize]=5; 
            aMap[oTankEn.y/iCellSize][(oTankEn.x+24)/iCellSize]=5; 
            aMap[(oTankEn.y+24)/iCellSize][(oTankEn.x+24)/iCellSize]=5; 
              
            setTimeout(deleteTank,100, (oTankEn.y/iCellSize), (oTankEn.x/iCellSize));
            break;
            }
                if (oBullet.y>624){                             //проверка на выход из игрового поля
                       oBullet=0;
                       flag=true;
                       flag2=false;
                       break;
                }                                            
                var iTest1 = aMap[iCurCelY-1][iCurCelX];        //координаты препядствия игрового поля
                var iTest2 = aMap[iCurCelY-1][iCurCelX+1];

                if (iTest1 == 1){
                        soundExp.play();
                        aMap[iCurCelY-1][iCurCelX]=5;            // снаряд попал в кирпичь, удаляем снаряд и кирпичь                                                 
                        oBullet=0;
                        flag=true;
                        flag2=false;
                        setTimeout(expDelete,100, iCurCelY-1, iCurCelX);}
                if (iTest2 == 1){
                        soundExp.play();
                        aMap[iCurCelY-1][iCurCelX+1]=5;
                        oBullet=0;
                        flag=true;
                        flag2=false;
                        setTimeout(expDelete,100, iCurCelY-1, iCurCelX+1);}
                if (iTest1 == 2 || iTest2 == 2){                // снаряд попал в сталь, удаляем снаряд                              
                        oBullet=0;
                        flag=true;
                        flag2=false;}   


      break;
      case 1:                                          // смотрит влево                                    
         oBullet.x-=24;                                      //действия аналогичны расписаным выше     

                var iCurCelX = oBullet.x / iCellSize;        
                var iCurCelY = oBullet.y / iCellSize;                                

if((iCurCelX==oTankEn.x / iCellSize) && (iCurCelY==oTankEn.y / iCellSize)) {flag6=false; flag10=false; flag4 =false;                        //уничтожение танка
            aMap[oTankEn.y/iCellSize][oTankEn.x/iCellSize]=5; 
            aMap[(oTankEn.y+24)/iCellSize][oTankEn.x/iCellSize]=5; 
            aMap[oTankEn.y/iCellSize][(oTankEn.x+24)/iCellSize]=5; 
            aMap[(oTankEn.y+24)/iCellSize][(oTankEn.x+24)/iCellSize]=5; 
              
            setTimeout(deleteTank,100, (oTankEn.y/iCellSize), (oTankEn.x/iCellSize));
            break;
            }


                var iTest1 = aMap[iCurCelY][iCurCelX+1];  
                var iTest2 = aMap[iCurCelY+1][iCurCelX+1];

                if (iTest1 == 1){
                        soundExp.play();
                        aMap[iCurCelY][iCurCelX+1]=5;                                           
                        oBullet=0;
                        flag=true;
                        flag2=false;
                        setTimeout(expDelete,100, iCurCelY, iCurCelX+1);}
                if (iTest2 == 1){
                        soundExp.play();
                        aMap[iCurCelY+1][iCurCelX+1]=5;
                        oBullet=0;
                        flag=true;
                        flag2=false;
                        setTimeout(expDelete,100, iCurCelY+1, iCurCelX+1);}
                if (iTest1 == 2 || iTest2 == 2){                // снаряд попал в сталь, удаляем снаряд                              
                        oBullet=0;
                        flag=true;
                        flag2=false;
                      } 
                 if (oBullet.x < 0){
                       oBullet=0;
                       flag=true;
                       flag2=false;
                       break;
                } 

      break;
      case 0:                                        // смотрит вправо
         oBullet.x+=24;                              //действия аналогичны расписаным выше   

                var iCurCelX = oBullet.x / iCellSize;          
                var iCurCelY = oBullet.y / iCellSize;          

if((iCurCelX==oTankEn.x / iCellSize) && (iCurCelY==oTankEn.y / iCellSize)) {flag6=false; flag10=false; flag4 =false;                        //уничтожение танка
            aMap[oTankEn.y/iCellSize][oTankEn.x/iCellSize]=5; 
            aMap[(oTankEn.y+24)/iCellSize][oTankEn.x/iCellSize]=5; 
            aMap[oTankEn.y/iCellSize][(oTankEn.x+24)/iCellSize]=5; 
            aMap[(oTankEn.y+24)/iCellSize][(oTankEn.x+24)/iCellSize]=5; 
              
            setTimeout(deleteTank,100, (oTankEn.y/iCellSize), (oTankEn.x/iCellSize));
            break;
            }
                if (oBullet.x > 624){                //проверка на выход из игрового поля
                       oBullet=0;
                       flag=true;
                       flag2=false;
                       break;
                } 
                                    
                var iTest1 = aMap[iCurCelY][iCurCelX-1];  
                var iTest2 = aMap[iCurCelY+1][iCurCelX-1];

                if (iTest1 == 1){
                        soundExp.play();
                        aMap[iCurCelY][iCurCelX-1]=5;                                            
                        oBullet=0;
                        flag=true;
                        flag2=false;
                        setTimeout(expDelete,100, iCurCelY, iCurCelX-1);}
                if (iTest2 == 1){
                        soundExp.play();
                        aMap[iCurCelY+1][iCurCelX-1]=5;
                        oBullet=0;
                        flag=true;
                        flag2=false;
                        setTimeout(expDelete,100, iCurCelY+1, iCurCelX-1);}
                if (iTest1 == 2 || iTest2 == 2){                // снаряд попал в сталь, удаляем снаряд                              
                        oBullet=0;
                        flag=true;
                        flag2=false;}   

      break;

    } 


    switch (oBullet2.z){
      case 2:                                         //если танк смотрит вверх
         oBullet2.y-=24;                                        //перемещение снаряда
               
                var iCurCelX = oBullet2.x / iCellSize;          // координаты снаряда
                var iCurCelY = oBullet2.y / iCellSize;

if((iCurCelX==oTank.x / iCellSize) && (iCurCelY==oTank.y / iCellSize)) {flag7=false; flag=false;                         //уничтожение танка
            aMap[oTank.y/iCellSize][oTank.x/iCellSize]=5; 
            aMap[(oTank.y+24)/iCellSize][oTank.x/iCellSize]=5; 
            aMap[oTank.y/iCellSize][(oTank.x+24)/iCellSize]=5; 
            aMap[(oTank.y+24)/iCellSize][(oTank.x+24)/iCellSize]=5; 
              
            setTimeout(deleteTankMy,100, (oTank.y/iCellSize), (oTank.x/iCellSize));
            break;
            } 
                 if (oBullet2.y < 0){                           //проверка на выход из игрового поля
                       oBullet2=0;
                       flag10=true;
                       flag20=false;
                       break;
                }                                             
                var iTest1 = aMap[iCurCelY+1][iCurCelX];       //координаты препядствия игрового поля
                var iTest2 = aMap[iCurCelY+1][iCurCelX+1];

                if (iTest1 == 1){
                        soundExp.play();
                        aMap[iCurCelY+1][iCurCelX]=5;           // снаряд попал в кирпичь, удаляем снаряд и кирпичь
                        oBullet2=0;
                        flag10=true;
                        flag20=false;                             // flag10 -разрешает производить выстрел
                        setTimeout(expDelete,100, iCurCelY+1, iCurCelX);}    // запускаем функцию удаления изображения взрыва
                if (iTest2 == 1){
                        soundExp.play();
                        aMap[iCurCelY+1][iCurCelX+1]=5;         
                        oBullet2=0;
                        flag10=true;
                        flag20=false;
                        setTimeout(expDelete,100, iCurCelY+1, iCurCelX+1);}
                if (iTest1 == 2 || iTest2 == 2){               // снаряд попал в сталь, удаляем снаряд                               
                        oBullet2=0;
                        flag10=true;
                        flag20=false;} 
                if (oBullet2.y < 0){                           //обработка ошибки выстрела за пределом игрового поля
                       oBullet2=0;
                       flag10=true;
                       flag20=false;
                }                                                                     

      break;

      case 3:                                                   //если танк смотрит вниз
         oBullet2.y+=24;                                         //перемещение снаряда

                var iCurCelX = oBullet2.x / iCellSize;           // координаты снаряда
                var iCurCelY = oBullet2.y / iCellSize;          

if((iCurCelX==oTank.x / iCellSize) && (iCurCelY==oTank.y / iCellSize)) {flag7=false; flag=false;                         //уничтожение танка
            aMap[oTank.y/iCellSize][oTank.x/iCellSize]=5; 
            aMap[(oTank.y+24)/iCellSize][oTank.x/iCellSize]=5; 
            aMap[oTank.y/iCellSize][(oTank.x+24)/iCellSize]=5; 
            aMap[(oTank.y+24)/iCellSize][(oTank.x+24)/iCellSize]=5; 
              
            setTimeout(deleteTankMy,100, (oTank.y/iCellSize), (oTank.x/iCellSize));
            break;
            } 
                if (oBullet2.y>624){                             //проверка на выход из игрового поля
                       oBullet2=0;
                       flag10=true;
                       flag20=false;
                       break;
                }                                            
                var iTest1 = aMap[iCurCelY-1][iCurCelX];        //координаты препядствия игрового поля
                var iTest2 = aMap[iCurCelY-1][iCurCelX+1];

                if (iTest1 == 1){
                        soundExp.play();
                        aMap[iCurCelY-1][iCurCelX]=5;            // снаряд попал в кирпичь, удаляем снаряд и кирпичь                                                 
                        oBullet2=0;
                        flag10=true;
                        flag20=false;
                        setTimeout(expDelete,100, iCurCelY-1, iCurCelX);}
                if (iTest2 == 1){
                        soundExp.play();
                        aMap[iCurCelY-1][iCurCelX+1]=5;
                        oBullet2=0;
                        flag10=true;
                        flag20=false;
                        setTimeout(expDelete,100, iCurCelY-1, iCurCelX+1);}
                if (iTest1 == 2 || iTest2 == 2){                // снаряд попал в сталь, удаляем снаряд                              
                        oBullet2=0;
                        flag10=true;
                        flag20=false;}   


      break;
      case 1:                                          // смотрит влево                                    
         oBullet2.x-=24;                                      //действия аналогичны расписаным выше     

                var iCurCelX = oBullet2.x / iCellSize;        
                var iCurCelY = oBullet2.y / iCellSize;                                

if((iCurCelX==oTank.x / iCellSize) && (iCurCelY==oTank.y / iCellSize)) {flag7=false; flag=false;                         //уничтожение танка
            aMap[oTank.y/iCellSize][oTank.x/iCellSize]=5; 
            aMap[(oTank.y+24)/iCellSize][oTank.x/iCellSize]=5; 
            aMap[oTank.y/iCellSize][(oTank.x+24)/iCellSize]=5; 
            aMap[(oTank.y+24)/iCellSize][(oTank.x+24)/iCellSize]=5; 
              
            setTimeout(deleteTankMy,100, (oTank.y/iCellSize), (oTank.x/iCellSize));
            break;
            } 
                var iTest1 = aMap[iCurCelY][iCurCelX+1];  
                var iTest2 = aMap[iCurCelY+1][iCurCelX+1];

                if (iTest1 == 1){
                        soundExp.play();
                        aMap[iCurCelY][iCurCelX+1]=5;                                           
                        oBullet2=0;
                        flag10=true;
                        flag20=false;
                        setTimeout(expDelete,100, iCurCelY, iCurCelX+1);}
                if (iTest2 == 1){
                        soundExp.play();
                        aMap[iCurCelY+1][iCurCelX+1]=5;
                        oBullet2=0;
                        flag10=true;
                        flag20=false;
                        setTimeout(expDelete,100, iCurCelY+1, iCurCelX+1);}
                if (iTest1 == 2 || iTest2 == 2){                // снаряд попал в сталь, удаляем снаряд                              
                        oBullet2=0;
                        flag10=true;
                        flag20=false;
                      } 
                 if (oBullet2.x < 0){
                       oBullet2=0;
                       flag10=true;
                       flag20=false;
                       break;
                } 

      break;
      case 0:                                        // смотрит вправо
         oBullet2.x+=24;                              //действия аналогичны расписаным выше   

                var iCurCelX = oBullet2.x / iCellSize;          
                var iCurCelY = oBullet2.y / iCellSize;          
 
if((iCurCelX==oTank.x / iCellSize) && (iCurCelY==oTank.y / iCellSize)) {flag7=false; flag=false;                         //уничтожение танка
            aMap[oTank.y/iCellSize][oTank.x/iCellSize]=5; 
            aMap[(oTank.y+24)/iCellSize][oTank.x/iCellSize]=5; 
            aMap[oTank.y/iCellSize][(oTank.x+24)/iCellSize]=5; 
            aMap[(oTank.y+24)/iCellSize][(oTank.x+24)/iCellSize]=5; 
              
              setTimeout(deleteTankMy,100, (oTank.y/iCellSize), (oTank.x/iCellSize));
              break;
            } 
                if (oBullet2.x > 624){                //проверка на выход из игрового поля
                       oBullet2=0;
                       flag10=true;
                       flag20=false;
                       break;
                } 
                                         
                var iTest1 = aMap[iCurCelY][iCurCelX-1];  
                var iTest2 = aMap[iCurCelY+1][iCurCelX-1];

                if (iTest1 == 1){
                        soundExp.play();
                        aMap[iCurCelY][iCurCelX-1]=5;                                            
                        oBullet2=0;
                        flag10=true;
                        flag20=false;
                        setTimeout(expDelete,100, iCurCelY, iCurCelX-1);}
                if (iTest2 == 1){
                        soundExp.play();
                        aMap[iCurCelY+1][iCurCelX-1]=5;
                        oBullet2=0;
                        flag10=true;
                        flag20=false;
                        setTimeout(expDelete,100, iCurCelY+1, iCurCelX-1);}
                if (iTest1 == 2 || iTest2 == 2){                // снаряд попал в сталь, удаляем снаряд                              
                        oBullet2=0;
                        flag10=true;
                        flag20=false;}   

      break;

    } 
}


$(document).ready(function(){
    canvas = document.getElementById('scene');
    canvas.width  = iXCnt * iCellSize; // устанавливаем ширину и высоту игрового поля
    canvas.height = iYCnt * iCellSize;
    context = canvas.getContext('2d'); // загружаем графические фигуры канваса
    aMap = ([// создаем двумерный масив-карту игрового поля 26х26 ячеек
      [4, 4, 4, 4, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 4, 4, 4, 4],
      [4, 4, 4, 4, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 4, 4, 4, 4],
      [4, 4, 4, 4, 3, 3, 4, 4, 4, 4, 3, 3, 1, 1, 3, 3, 4, 4, 4, 4, 3, 3, 4, 4, 4, 4],
      [4, 4, 4, 4, 3, 3, 4, 4, 4, 4, 3, 3, 1, 1, 3, 3, 4, 4, 4, 4, 3, 3, 4, 4, 4, 4],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0],
      [0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2],
      [2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 4, 4, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 4, 4, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3, 4, 4, 3, 3, 4, 4, 3, 3, 1, 1, 1, 1, 1, 1, 3, 3, 4, 4, 3, 3, 4, 4, 3, 3],
      [3, 3, 4, 4, 3, 3, 4, 4, 3, 3, 1, 2, 2, 2, 2, 1, 3, 3, 4, 4, 3, 3, 4, 4, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 2, 0, 0, 2, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 2, 0, 0, 2, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
    ]);
    // загружаем изображения ,без объявления var делаем их глобальными
    imgBrick = new Image();         
    imgBrick.src = 'images/brick.png';    //кирпичь
    imgSteel = new Image();
    imgSteel.src = 'images/steel.png';    //стальная стены
    imgWater = new Image();
    imgWater.src = 'images/water.png';    //вода
    imgForest = new Image();
    imgForest.src = 'images/forest.png';  //лес
    imgExpl = new Image();
    imgExpl.src = 'images/exp.png';

    var soundTank = new Audio('sounds/tank.wav');   // звук двигателя
        soundTank.volume = 0.1;
    var soundShoot = new Audio('sounds/shoot.ogg');   // звук выстрела
        soundShoot.volume = 0.1;
        soundExp = new Audio('sounds/exp.ogg');   // звук выстрела
        soundExp.volume = 0.3;        

    var imgBulletUp = new Image();                        // создаем обьекты с изображениями снаряда
        imgBulletUp.src = 'images/bullet_up.png';

    var imgBulletDown = new Image();
        imgBulletDown.src = 'images/bullet_down.png';

    var imgBulletLeft = new Image();
        imgBulletLeft.src = 'images/bullet_left.png';

    var imgBulletRight = new Image();
        imgBulletRight.src = 'images/bullet_right.png';


    var imgTankEn = new Image();          
        imgTankEn.src = 'images/tank1.png';      //танк противник

    var imgTank = new Image();          
        imgTank.src = 'images/tank.png';      //танк

    oTankEn = new Tank(iCellSize*1, iCellSize*6, 48, 48, imgTankEn);
    oTank = new Tank(iCellSize*7, iCellSize*16, 48, 48, imgTank); // глобальная переменная создаем новый обьект oTank и загружаем данные его начального положения на игровом поле
    
    oBullet = new Bullet(24, 24*6, 48, 24, 5, imgBulletUp);
    oBullet2 = new Bullet(24, 24*6, 48, 24, 5, imgBulletUp);


function bulletEn(){
    if(flag10){
      flag10=false;
      flag20=true;
      soundShoot.play();
  // в зависимости от направления танка, и его местоположения на карте, создается 
      if(oTankEn.i==2)     
           oBullet2 = new Bullet(oTankEn.x, oTankEn.y-24, 48, 24, 2, imgBulletUp);                  //  объект снаряд со своими параметрами   
      if(oTankEn.i==3)    
           oBullet2 = new Bullet(oTankEn.x, oTankEn.y+48, 48, 24, 3, imgBulletDown); 
      if(oTankEn.i==1)   
           oBullet2 = new Bullet(oTankEn.x-24, oTankEn.y, 24, 48, 1, imgBulletLeft); 
      if(oTankEn.i==0)    
           oBullet2 = new Bullet(oTankEn.x+48, oTankEn.y, 24, 48, 0, imgBulletRight);   
       }  
}

//$(document).mousedown(function(){  // выстрел, на поле допускается одновременно только 1 сняряд
    
$(document).keydown(function(event){ // отработка событий нажатия кнопок клавиатуры

       if(event.keyCode==32){
    if(flag){
      flag=false;
      flag2=true;
      soundShoot.play();
      if(oTank.i==2)
           oBullet = new Bullet(oTank.x, oTank.y-24, 48, 24, 2, imgBulletUp);   // в зависимости от направления танка, и его местоположения на карте, создается 
                      //  объект снаряд со своими параметрами   
      if(oTank.i==3)  
           oBullet = new Bullet(oTank.x, oTank.y+48, 48, 24, 3, imgBulletDown);
     
      if(oTank.i==1)  
           oBullet = new Bullet(oTank.x-24, oTank.y, 24, 48, 1, imgBulletLeft);
      
      if(oTank.i==0)  
           oBullet = new Bullet(oTank.x+48, oTank.y, 24, 48, 0, imgBulletRight);
       }}
     
  });

  setInterval(bulletEn,500);  
$(document).keydown(function(event){ // отработка событий нажатия кнопок клавиатуры

        switch (event.keyCode) { // цикл выбора нажатой кнопки
            case 38: // код 38 -  кнопка стрелка вверх
                oTank.i = 2; //множитель смещения начальной точки отрисовки изображения танка. Находится в context.drawImage(...)
                soundTank.play();
                
  // обработка перемещения танка
                var iCurCelX = oTank.x / iCellSize;          // вычисление верхней левой ячейки (делим растояние от верхней левой точки танка на ширину одной ячейки)
                var iCurCelY = oTank.y / iCellSize;          // занимаемой танком(танк занимает 4 ячейки)
                if((iCurCelY-1)==-1){break;}                           
                
                var iTest1 = aMap[iCurCelY-1][iCurCelX];  //смотрим, что находится в ячейки выше iTest1
                var iTest2 = aMap[iCurCelY-1][iCurCelX+1];// так как танк у нас шириной в 2 ячейки, смотрим и соседнюю ячейку по оси Х - iTest2
                if ((iTest1 == 0 || iTest1 == 3) && (iTest2 == 0 || iTest2 == 3)) {// если в просматриваемых ячейках находится пустота "0" или лес "3"
                    oTank.y-=24;                                                   // сдвигаем танк вверх на высоту одной ячейки "24" пиксела   
                }
                 
                break;
            case 40: // код 40 - кнопка стрелки вниз
                oTank.i = 3; //множитель смещения начальной точки отрисовки изображения танка. Находится в context.drawImage(...)
                soundTank.play();
                
  // обработка перемещения танка
                var iCurCelX = oTank.x / iCellSize;            // вычисление верхней левой ячейки (делим растояние от верхней левой точки танка на ширину одной ячейки)
                var iCurCelY = oTank.y / iCellSize;            // занимаемой танком(танк всего занимает 4 ячейки) 
                if((iCurCelY+2)==26){break;}                    
                
                var iTest1 = aMap[iCurCelY+2][iCurCelX];       //смотрим, что находится внизу под танком iTest1 нужно сместиться от верхней левой ячейки танка
                var iTest2 = aMap[iCurCelY+2][iCurCelX+1];     // на две ячейки вниз, так как танк у нас шириной в 2 ячейки, смотрим и соседнюю ячейку по оси Х - iTest2
                if ((iTest1 == 0 || iTest1 == 3) && (iTest2 == 0 || iTest2 == 3)) {// если мы находимся в игровом поле и внизу находится пустота "0" или лес "3"
                     oTank.y+=24;                                                  // сдвигаем танк вниз на высоту одной ячейки "24" пиксела 
                }
                
                break;
            case 37:   // код 37 - кнопка стрелки влево
                oTank.i = 1; //множитель смещения начальной точки отрисовки изображения танка. Находится в context.drawImage(...)
                soundTank.play();
                
  // обработка перемещения танка
                var iCurCelX = oTank.x / iCellSize;      // вычисление верхней левой ячейки (делим растояние от верхней левой точки танка на ширину одной ячейки)
                var iCurCelY = oTank.y / iCellSize;      // занимаемой танком(танк всего занимает 4 ячейки) 
                                    
                var iTest1 = aMap[iCurCelY][iCurCelX-1];    //смотрим, что находится слева от танка  
                var iTest2 = aMap[iCurCelY+1][iCurCelX-1];

                if ((iTest1 == 0 || iTest1 == 3) && (iTest2 == 0 || iTest2 == 3)) { //есле мы находимся в игровом поле и слева пустая клетка или лес
                     oTank.x-=24;                                                       // смещаемся влево на ширину ячейки 24 пиксела
                }
                
                break;
            case 39: // код 39 - кнопка стрелки вправо
                oTank.i = 0;//множитель смещения начальной точки отрисовки изображения танка. Находится в context.drawImage(...)
                soundTank.play();
                
  // обработка перемещения танка
                var iCurCelX = oTank.x / iCellSize;     // вычисление верхней левой ячейки (делим растояние от верхней левой точки танка на ширину одной ячейки)
                var iCurCelY = oTank.y / iCellSize;     // занимаемой танком(танк всего занимает 4 ячейки)
                
                var iTest1 = aMap[iCurCelY][iCurCelX+2]; //смотрим, что находится с права от танка
                var iTest2 = aMap[iCurCelY+1][iCurCelX+2];

                if ((iTest1 == 0 || iTest1 == 3) && (iTest2 == 0 || iTest2 == 3)) {//есле мы находимся в игровом поле и справа пустая клетка или лес
                    oTank.x+=24;                                                   // смещаемся вправо на ширину ячейки 24 пиксела
                }
                break;
        }
    });
$('#scene').toggle(function(){
              clearInterval(flagP);
              
   },function(){
      flagP = setInterval(drawScene, 40);
    
   });
        
  

    flagP = setInterval(drawScene, 40); // каждые 40 милисекунд перерисовываем всю сцену, получаем частоту 25 кадров в секунду.
});
}
