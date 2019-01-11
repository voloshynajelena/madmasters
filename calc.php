<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="shortcut icon" href="/content/img/favicon.ico" type="image/x-icon">
<title>Document</title>
</head>
<body>


<?php
if(!empty($_POST['telephone'] ))
{
$to      = 'madmweb@gmail.com';
$subject = 'Заказ';

$design = '';
if (!empty($_POST["design"]) && is_array($_POST["design"]))
{
    $design = implode(", ", $_POST["design"]);
}

$blog = '';
if (!empty($_POST["blog"]) && is_array($_POST["blog"]))
{
    $blog = implode(", ", $_POST["blog"]);
}

$forms = '';
if (!empty($_POST["forms"]) && is_array($_POST["forms"]))
{
    $forms = implode(", ", $_POST["forms"]);
}

$access = '';
if (!empty($_POST["access"]) && is_array($_POST["access"]))
{
    $access = implode(", ", $_POST["access"]);
}

$oconsultant = '';
if (!empty($_POST["oconsultant"]) && is_array($_POST["oconsultant"]))
{
    $oconsultant = implode(", ", $_POST["oconsultant"]);
}

$effects = '';
if (!empty($_POST["effects"]) && is_array($_POST["effects"]))
{
    $effects = implode(", ", $_POST["effects"]);
}

$social = '';
if (!empty($_POST["social"]) && is_array($_POST["social"]))
{
    $social = implode(", ", $_POST["social"]);
}

$seo = '';
if (!empty($_POST["seo"]) && is_array($_POST["seo"]))
{
    $seo = implode(", ", $_POST["seo"]);
}

$versions = '';
if (!empty($_POST["versions"]) && is_array($_POST["versions"]))
{
    $versions = implode(", ", $_POST["versions"]);
}

$corrections = '';
if (!empty($_POST["corrections"]) && is_array($_POST["corrections"]))
{
    $corrections = implode(", ", $_POST["corrections"]);
}

$message = 'Имя: '.$_POST['name'].'; Телефон: '.$_POST['telephone'].';
 1.hosting:     '.$_POST['hosting'].';
 2.domen:       '.$_POST['domen'].';
 3.domenChoice: '.$_POST['domenChoice'].';
 4.type:        '.$_POST['type'].';
 5.CMS:         '.$_POST['cms'].';
 6.template:    '.$_POST['template'].';
 7.design:      '.$design.';
 8.gallery:     '.$_POST['gallery'].';
 9.slider:      '.$_POST['slider'].';
 10.carousel:    '.$_POST['carousel'].';
 11.blog:        '.$blog.';
 12.forms:       '.$forms.';
 13.access:      '.$access.';
 14.oСonsultant: '.$oconsultant.';
 15.effects:     '.$effects.';
 16.social:      '.$social.';
 17.seo:         '.$seo.';
 18.content:     '.$_POST['content'].';
 19.speedSite:   '.$_POST['speedSite'].';
 20.versions:    '.$versions.';
 21.lang:        '.$_POST['lang'].';
 22.corrections: '.$corrections.';
 23.speed:       '.$_POST['speed'].';';
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
echo "<p>Обязательные поля не заполнены. Введите номер телефона</p>";
}
?>

</body>
</html>