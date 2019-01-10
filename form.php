<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Document</title>
</head>
<body>


<?php
if(!empty($_POST['telephone'] ))
{
$to      = 'madmweb@gmail.com';
$subject = 'Проверка почты';
$message = 'Имя: '.$_POST['name'].'; Телефон: '.$_POST['telephone'].'; Тема: '.$_POST['theme'].'; Сообщение: '.$_POST['textarea'].';';
$headers = "Content-type: text/html; charset=UTF-8 \r\n";
$headers = 'From: madmweb@gmail.com' . "\r\n" .
    'Reply-To: madmweb@gmail.com' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

$result = mail($to, $subject, $message, $headers);


    if ($result){ 
        echo "<h3>Cообщение успешно отправлено!</h3>";
    }
    else{
        echo "<h3>Cообщение не отправленно. Пожалуйста, попрбуйте еще раз</h3>";
    }
}
else {
echo "<h3>Обязательные поля не заполнены. Введите номер телефона</h3>";
}
?>

</body>
</html>