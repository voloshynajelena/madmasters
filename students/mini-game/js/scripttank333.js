   if (flag3) {
        flag3 = false;
        setTimeout(moveTank, 500, oTankEn);
        /*setTimeout(moveTank, 500, oTankEn2, flag5);*/
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
    setInterval(drawScene, 40); // каждые 40 милисекунд перерисовываем всю сцену, получаем частоту 25 кадров в секунду.
});