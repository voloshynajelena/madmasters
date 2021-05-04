<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="shortcut icon" href="/content/img/favicon.ico" type="image/x-icon">
<title>Document</title>
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-FE9J5WS225"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-FE9J5WS225');
</script></head>
<body>


<?php
if(!empty($_POST['telephone'] ))
{
$to      = 'madmweb@gmail.com';
$subject = 'Бриф';

$generalDiscover = '';
if (!empty($_POST["generalDiscover"]) && is_array($_POST["generalDiscover"]))
{
    $generalDiscover = implode(", ", $_POST["generalDiscover"]);
}

$functionalScope = '';
if (!empty($_POST["functionalScope"]) && is_array($_POST["functionalScope"]))
{
    $functionalScope = implode(", ", $_POST["functionalScope"]);
}

$interaction = '';
if (!empty($_POST["interaction"]) && is_array($_POST["interaction"]))
{
    $interaction = implode(", ", $_POST["interaction"]);
}

$fonts = '';
if (!empty($_POST["fonts"]) && is_array($_POST["fonts"]))
{
    $fonts = implode(", ", $_POST["fonts"]);
}

$adaptive = '';
if (!empty($_POST["adaptive"]) && is_array($_POST["adaptive"]))
{
    $adaptive = implode(", ", $_POST["adaptive"]);
}

$photo = '';
if (!empty($_POST["photo"]) && is_array($_POST["photo"]))
{
    $photo = implode(", ", $_POST["photo"]);
}

$message = 'Имя: '.$_POST['name'].'; Телефон: '.$_POST['telephone'].';
 1.Название компании:               '.$_POST['generalInfo'].';
 2.Область деятельности:            '.$_POST['generalActivity'].';
 3.Сайты конкурентов:               '.$_POST['generalAdress'].';
 4.География компании:              '.$_POST['generalGegrafy'].';
 5.Сроки:                           '.$_POST['generalTerms'].';
 6.Бюджет:                          '.$_POST['generalBudzhet'].';
 7.Ответственное лицо:              '.$_POST['generalFace'].';
 8.Откуда узнали о нас:             '.$generalDiscover.';
 9.Цели сайта:                      '.$_POST['strategyTargets'].';
 10.Потребности пользователей:      '.$_POST['strategyNeeds'].';
 11.Пользовательская аудитория:     '.$_POST['strategyAuditori'].';
 12.Тип сайта:                      '.$_POST['functional'].';
 12.1.Тип сайта:                    '.$_POST['interactionFunctional'].';
 13.Функциональные возможности:     '.$functionalScope.';
 14.CMS:                            '.$_POST['cms'].';
 14.1.cmsOther:                     '.$_POST['cmsOther'].';
 15.Интеграция:                     '.$interaction.';
 16.Языки:                          '.$_POST['languages'].';
 17.Требования:                     '.$_POST['requirements'].';
 18.Разделы:                        '.$_POST['structureForums'].';
 19.Навигация:                      '.$_POST['structureNavigation'].';
 20.Информационные блоки:           '.$_POST['structureInfoBlocks'].';
 21.Периодичность информации:       '.$_POST['structurePeriodicity'].';
 22.Сайты нравятся:                 '.$_POST['designExamplesLike'].';
 23.Сайты не нравятся:              '.$_POST['designExamplesBad'].';
 24.Общая композиция:               '.$_POST['composition'].';
 24.1.Общая композиция:             '.$_POST['compositionText'].';
 25.Настроение и ассоциации:        '.$_POST['association'].';
 25.1.Настроение и ассоциации:      '.$_POST['associationText'].';
 26.Цвета:                          '.$_POST['colors'].';
 26.1.Цвета:                        '.$_POST['colorsText'].';
 27.Шрифты:                         '.$fonts.';
 28.Адаптивность:                   '.$adaptive.';
 28.1.Адаптивность:                 '.$_POST['adaptiveText'].';
 29.Фотоматериалы:                  '.$photo.';
 30.Концепция дизайна:              '.$_POST['informationDesign'].';
 31.Хостинг, домен:                 '.$_POST['hostDom'].';
 32.Наполнение сайта:               '.$_POST['contentCount'].';
 33.Ключевые слова:                 '.$_POST['seoKeywords'].';
 34.Поддержка сайта:                '.$_POST['support'].';
 35.Брендинг:                       '.$_POST['branding'].';
 36.Рекламные баннера:              '.$_POST['adBanner'].';
 37.Иллюстрации:                    '.$_POST['photoShop'].';
 38.Иконки:                         '.$_POST['iconsPictogram'].';
 39.Фотосъемка:                     '.$_POST['photoset'].';';

$headers = "Content-type: text/html; charset=UTF-8 \r\n";
$headers = 'From: madmweb@gmail.com' . "\r\n" .
    'Reply-To: madmweb@gmail.com' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

$result = mail($to, $subject, $message, $headers);


    if ($result){ 
        echo "<p>Cообщение успешно отправленно. Пожалуйста, оставайтесь на связи</p>";
    }
    else{
        echo "<p>Cообщение не отправленно. Пожалуйста, попрбуйте еще раз</p>";
    }
}
else {
echo "<p class='red'>Обязательные поля не заполнены. Введите номер телефона</p>";
}
?>

</body>
</html>