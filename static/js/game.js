var canvas = document.getElementById("gameCanvas");
var canvasContext;
var canvasBackgroundImage = new Image();
canvasBackgroundImage.src = "{% static 'img/background.png' %}" ;

var canvasBackgroundImageSetting = new Image();
canvasBackgroundImageSetting.src = "{% static 'img/background3.jpg' %}";

var player1Score;
var player2Score;
var firstPlayerTurn;
const WINNING_SCORE = 30;
var showingWinScreen;
var showingMenuScreen;
var winningText;
var paddle1;
var paddle2;
var ball;
var rightPressed;
var leftPressed;
var key_A_Pressed;
var key_D_Pressed;
var coin = new Array();
var coinLength;
var step;
var drawWidth;
var drawHeight;
var coinPrice;
var mousePos = new Object();
var singlePlayer;
var setingsFrame;
var playerChooser;
var snd = new Audio("{% static 'file.mp3' %}"); // buffers automatically when created
var winAudio = new Audio("{% static 'cheer1.mp3' %}"); // buffers automatically when created
var isPlaing = true;

/////  Key events  /////
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
/////  Mouse events  /////
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener('mousedown', handleMouseClick);


function initGlobals(){
    player1Score = 0;
    player2Score = 0;
    firstPlayerTurn = true;
    showingWinScreen = false;
    showingMenuScreen = true;
    singlePlayer = false;
	playerChooser = false;
	setingsFrame = false;
    winningText = "";
	
	 // play music
	 if(isPlaing == true){	 
	  snd.play();
	 }
	 
  paddle1 = new Paddle(140, 30, 445, 15, "{% static 'img/paddle2.png' %}");
    // Creating paddles
	if(paddle1 == null) {
		paddle1 = new Paddle(140, 30, 445, 15, "{% static 'img/paddle.png' %}");
		
	}
	paddle2 = new Paddle(140, 30, 5, 15, "{% static 'img/paddle.png' %}");
    // Creating ball
    ball = {
        X: canvas.width / 2,
        radius: 10,
        speedX: 3,
        speedY: -3,
    }
    ball.Y = paddle1.Y - ball.radius;
    ball.image = new Image();
    ball.image.src = "{% static 'img/ball.png' %}";

    // Creating coins
    coinLength = 6;
    step = 120;
    drawWidth = 35;
    drawHeight = 35;
    coinPrice = 5;
    for(var i = 0; i < coinLength; ++i)
        coin[i] = new Coin(5, drawWidth, drawHeight);

    // Keys first state
    rightPressed = false;
    leftPressed = false;
    key_A_Pressed = false;
    key_D_Pressed = false;
}
// Initialising global variables and objects
initGlobals();

/////  Paddle constructor  /////
function Paddle(width, height, Y, speedX, imgSrc){
    this.width = width;
    this.height = height;
    this.X = (canvas.width - width) / 2;
    this.Y = Y;
    this.speedX = speedX;
    this.image = new Image();
    this.image.src = imgSrc;
}

/////  Coin constructor  /////
function Coin(frameTick, width, height){
    this.startx = 0;
    this.starty = 0;
    this.frameWidth = 100;
    this.frameHeight = 100;
    this.numberOfFrames = 10;
    this.image = new Image();
    this.image.src = "{% static 'img/coin.png' %}";
    this.frameTick = frameTick;
    this.tick = 0;
    this.width = width;
    this.height = height;
}

/////  Button constructor  /////
function button(X, Y, text){
    this.X = X;
    this.Y = Y; //canvas.height / 2 - 40;
    this.width = 220;
    this.height = 60;
    this.text = text;
	
}  

/////  Creating buttons  /////
buttonSinglePlayer = new button(canvas.width / 2 - 280, canvas.height / 2 - 140, "Един играч");
//buttonSinglePlayer.style.background = "none";
//buttonSinglePlayer.style.border = "none";

buttonTwoPlayers = new button(canvas.width / 2 + 60,canvas.height / 2 - 140 ,"Двама играчи");
buttonSelectPlayer = new button(canvas.width / 2 - 120, canvas.height / 2 + 70,"Избери играч");
buttonSettings = new button(canvas.width / 2 - 120, canvas.height / 2 + 160 ,"Настройки");
buttonTryAgain = new button(canvas.width / 2 - 120, canvas.height / 2 - 50 ,"Играй отново");
buttonMenu = new button(canvas.width / 2 - 120 , canvas.height / 2 - 180, "Начало");

buttonPlayer1Skin = new button(canvas.width / 2 - 120, canvas.height / 2 - 110 ,"син играч");

buttonPlayer2Skin = new button(canvas.width / 2 - 120, canvas.height / 2 - 40 ,"червен играч");

buttonStopMusic = new button(canvas.width / 2 - 120, canvas.height / 2 - 110 ,"Спри звука");



/////  Drawing button function  /////
function drawButton(button){
    // Checking if mouse over a button
    if(collision(button, mousePos)) {
        canvasContext.fillStyle = "gray";
        textColor = "white";
    }
    else {
        canvasContext.fillStyle = "lightGray";
        textColor = "green";
    }
    // Drawing a button
    canvasContext.fillRect(button.X, button.Y, button.width, button.height);
    canvasContext.strokeRect(button.X, button.Y, button.width, button.height);
    canvasContext.fillStyle = textColor;
	canvasContext.globalAlpha = 0.8;
    canvasContext.font = "35px Arial";
    // Fill button text
    textWidth = canvasContext.measureText(button.text).width;
    canvasContext.fillText(button.text, button.X + button.width / 2 - textWidth / 2, button.Y + 40); 
}

//////////////////////  Main functions  //////////////////////
window.onload = function(){    
    canvasContext = canvas.getContext("2d");    
    
    var framesPerSecond = 60;
    setInterval(function(){
        updateFrame();
        drawFrame();
    }, 1000 / framesPerSecond);
}
    
function updateFrame(){
    checkWinning();    
    if(showingMenuScreen) return;
    if(showingWinScreen) return;
    
    // Checking ball at left and right sides
    if(ball.X + ball.speedX > canvas.width - ball.radius || ball.X + ball.speedX < ball.radius) {
        ball.speedX = -ball.speedX;
    }
    // If ball crossing bottom side, second player's score increases
    if(ball.Y + ball.speedY > canvas.height - ball.radius) {
        player2Score++;
        ballResetAt(1);
        firstPlayerTurn = true;
    }
    // If ball crossing top side, first player's score increases
    if(ball.Y + ball.speedY < ball.radius){
        player1Score++;
        ballResetAt(2);
        firstPlayerTurn = false;
    }

    // This ensures ball's movement
    ball.X += ball.speedX;
    ball.Y += ball.speedY;

    // If ball touched the paddle1, ball's movement direction changes
    if(collision(paddle1, ball)) {
        ball.speedY = -ball.speedY;
        var deltaX = ball.X - (paddle1.X + paddle1.width / 2);
        ball.speedX = deltaX * 0.18;
        firstPlayerTurn = true;
    }

    // If ball touched the paddle2, ball's movement direction changes
    if(collision(paddle2, ball)) {
        ball.Y + ball.speedY;
        ball.speedY = -ball.speedY;
        var deltaX = ball.X - (paddle2.X + paddle2.width / 2);
        ball.speedX = deltaX * 0.18;
        firstPlayerTurn = false;
    }

    // Checking wich player hit coins with ball, and adding coinPrice to him
     for(var i = 0; i < coinLength; ++i){
         if(coin[i] != null){
             if(collision(coin[i], ball)){
                  coin[i] = null;
                  if(firstPlayerTurn) player1Score += coinPrice;
                  else player2Score += coinPrice;
            }
         }
     }

    // paddle1 movement by keys
    if(rightPressed && paddle1.X < canvas.width - paddle1.width) {
        paddle1.X += paddle1.speedX;
    }
    else if(leftPressed && paddle1.X > 0) {
        paddle1.X -= paddle1.speedX;
    }

    // paddle2 movement by computer - if single player choosen, or by keys` two player mode
    if(singlePlayer){
        computerMovement();
    }
    else {
        if(key_D_Pressed && paddle2.X < canvas.width - paddle2.width) {
            paddle2.X += paddle2.speedX;
        }
        else if(key_A_Pressed && paddle2.X > 0) {
            paddle2.X -= paddle2.speedX;
        }
    }  
}

function drawFrame(){
    // Drawing background image
    
    
    // Showing menu screen
    if(showingMenuScreen){
		canvasContext.drawImage(canvasBackgroundImageSetting, 0, 0);
         canvasContext.strokeRect(0, 0, canvasBackgroundImageSetting.width, canvasBackgroundImage.height);
		winningText = "";
        canvasContext.fillStyle = "pink";
        canvasContext.font = "30px Arial";
        canvasContext.fillText("Menu", (canvas.width  - canvasContext.measureText("Menu").width) / 2 - 20, 50);
        drawButton(buttonSinglePlayer);
        drawButton(buttonTwoPlayers);
		drawButton(buttonSelectPlayer);
		drawButton(buttonSettings);
		
		 
	
        return;
    }

    // Showing winning screen
    if(showingWinScreen){
        canvasContext.fillStyle = "pink";
        canvasContext.font = "30px Arial";
        canvasContext.fillText(winningText, (canvas.width  - canvasContext.measureText(winningText).width) / 2, 50);     
        drawButton(buttonTryAgain);
        drawButton(buttonMenu);
		winAudio.play();
		 winAudio.Sound.stop();
        return;
    }
	
	 if(setingsFrame){
		canvasContext.drawImage(canvasBackgroundImage, 0, 0);
        canvasContext.strokeRect(0, 0, canvasBackgroundImage.width, canvasBackgroundImage.height);

	      drawButton(buttonMenu);
        canvasContext.fillStyle = "pink";
        canvasContext.font = "40px Arial";
        canvasContext.fillText(winningText, (canvas.width  - canvasContext.measureText(winningText).width) / 2, 50);     
        drawButton(buttonStopMusic);
		
        return;
    }
	
	if(playerChooser){
		canvasContext.drawImage(canvasBackgroundImage, 0, 0);
        canvasContext.strokeRect(0, 0, canvasBackgroundImage.width, canvasBackgroundImage.height);

	     drawButton(buttonMenu);
        canvasContext.fillStyle = "pink";
        canvasContext.font = "40px Arial";
        canvasContext.fillText(winningText, (canvas.width  - canvasContext.measureText(winningText).width) / 2, 80);   
		  
     	drawButton(buttonPlayer1Skin);
	    drawButton(buttonPlayer2Skin);
		
        return;
    }
	
	canvasContext.drawImage(canvasBackgroundImage, 0, 0);
    canvasContext.strokeRect(0, 0, canvasBackgroundImage.width, canvasBackgroundImage.height);

    // Drawing paddles
    canvasContext.drawImage(paddle1.image, paddle1.X, paddle1.Y, paddle1.width, paddle1.height); 
    canvasContext.drawImage(paddle2.image, paddle2.X, paddle2.Y, paddle2.width, paddle2.height);
    
    // Drawing coins
    for(var i = 0; i < coinLength; ++i)
        drawSprite(coin[i], (canvas.width - step + drawWidth) / 2 - drawWidth - 2 * step + i * step, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
    
    // Drawing ball
    drawCircle(ball.X, ball.Y, ball.radius, ball.image);
    
    // Drawing scores
    canvasContext.globalAlpha = 0.2; // seting text opacity
    canvasContext.fillStyle = "pink";
    canvasContext.font = "20px Arial";
    canvasContext.fillText("Score1: " + player1Score, 10, canvas.height - 60);
    canvasContext.fillText("Score2: " + player2Score, 10, 70);
    canvasContext.globalAlpha = 1;  // setting default opacity
}
//////////////////  End of main functions  //////////////////


function computerMovement() {
	var paddle2XCenter = paddle2.X + paddle2.width / 2;
	paddle2.speedX = 8;
    
    if((paddle2XCenter < ball.X - 25) && paddle2.X < canvas.width - paddle2.width - paddle2.speedX) {
		paddle2.X += paddle2.speedX;
	} 
    else if((paddle2XCenter > ball.X + 25) && paddle2.X > 0 ) {
		paddle2.X -= paddle2.speedX;
	}
}

function drawSprite(coinObj, x, y, width, height){ 
    if(coinObj != null){
        if(coinObj.tick == 0){
            if(coinObj.startx < coinObj.frameWidth * (coinObj.numberOfFrames - 1)) coinObj.startx += coinObj.frameWidth;
            else coinObj.startx = 0;
        }
        
        coinObj.tick++;
        canvasContext.drawImage(coinObj.image, coinObj.startx, coinObj.starty, coinObj.frameWidth, coinObj.frameHeight, x, y, width, height);
        coinObj.X = x;
        coinObj.Y = y;
        if(coinObj.tick == coinObj.frameTick) coinObj.tick = 0;
    }  
}

function drawCircle(centerX, centerY, radius, image){
    canvasContext.fillStyle = "black";
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    canvasContext.fill();
    canvasContext.drawImage(image, centerX - radius, centerY - radius, 2 * radius, 2 * radius); 
}

function collision(rect, circle){
    if(circle.radius == null) circle.radius = 0;
    if((circle.X + circle.radius > rect.X && circle.X - circle.radius < rect.X + rect.width) &&
       (circle.Y + circle.radius > rect.Y && circle.Y - circle.radius < rect.Y + rect.height)){ 
            return true;
       }
       else return false;
}

function ballResetAt(player){
    switch(player){
        case 1:
            ball.X = paddle1.X + paddle1.width / 2;
            ball.Y = paddle1.Y - ball.radius;
            ball.speedX = 3;
            ball.speedY = -3;
            break;
        case 2:
            ball.X = paddle2.X + paddle2.width / 2;
            ball.Y = paddle2.Y + paddle2.height +  ball.radius;
            ball.speedX = -3;
            ball.speedY = 3;
            break;
        default:
            ball.X = canvas.width / 2;
            ball.Y = canvas.height / 2;
    }  
}

function checkWinning(){
    if(player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE){
        if(player1Score == player2Score) winningText = "Равен";
        else if(player1Score > player2Score)
            winningText = "Побетител е играч 1";
        else winningText = "Побетител е играч 2";
        showingWinScreen = true;
        player1Score = 0;
        player2Score = 0;
    }
}


///// Mouse events functions  /////
function handleMouseClick(evt) {
    if(showingMenuScreen && collision(buttonTwoPlayers, mousePos)) showingMenuScreen = false;
    if(showingMenuScreen && collision(buttonSinglePlayer, mousePos)){ 
        showingMenuScreen = false;
        singlePlayer = true;
    }
	
	  if(showingMenuScreen && collision(buttonSettings, mousePos)){ 
        showingMenuScreen = false;
        setingsFrame = true;
    }
	
	
     if(showingWinScreen && collision(buttonMenu, mousePos)) initGlobals();
	
	 if(setingsFrame && collision(buttonMenu, mousePos)) initGlobals();
	 
	 if(playerChooser && collision(buttonMenu, mousePos)) initGlobals();
	 
	 if(playerChooser && collision(buttonPlayer1Skin, mousePos)){
	
	  paddle1 = new Paddle(140, 30, 445, 15, "{% static 'img/paddle2.png' %}");
	  initGlobals()
	 }
	 
	 if(playerChooser && collision(buttonPlayer2Skin, mousePos)){
	
	  paddle1 = new Paddle(140, 30, 445, 15, "{% static 'img/paddle3.png' %}");
	  initGlobals();
	 }
	 
	 if(showingMenuScreen && collision(buttonSelectPlayer, mousePos)){ 
        showingMenuScreen = false;
        playerChooser = true;
    }
    
	 
	if(showingWinScreen && collision(buttonTryAgain, mousePos)) {
        singlePlayer ? temp = true : temp = false;
        initGlobals();
        showingMenuScreen = false;
        singlePlayer = temp;
    }
	
	 if(setingsFrame && collision(buttonStopMusic, mousePos)) {
		 snd.pause();
		 isPlaing = false;
	 }
	 
}

function mouseMoveHandler(evt) {
    mousePos.X = evt.clientX - canvas.offsetLeft;
    mousePos.Y = evt.clientY - canvas.offsetTop;
}


///// Key events functions  /////
function keyDownHandler(e) {
    if(e.keyCode == 39) {       
        rightPressed = true;
    }
    else if(e.keyCode == 37) {
        leftPressed = true;
    }
    else if(e.keyCode == 65) {
        key_A_Pressed = true;
    }
    else if(e.keyCode == 68) {
        key_D_Pressed = true;
    }
}

function keyUpHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = false;
    }
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
    else if(e.keyCode == 65) {
        key_A_Pressed = false;
    }
    else if(e.keyCode == 68) {
        key_D_Pressed = false;
    }
}