context = $("#arena-player")[0].getContext('2d');
context.beginPath();
context.rect(0, 0, 100, 100);
context.fillStyle = 'yellow';
context.fill();
context.fillWidth = 1;
context.strokeStyle = 'black'
context.stroke();
