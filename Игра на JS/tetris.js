const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const VACANT = "WHITE"; // Цвет пустого квадрата

// Рисуем квадрат
function drawSquare(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*SQ,y*SQ,SQ,SQ);

    ctx.strokeStyle = "BLACK";
    ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

// Создаём доску

let board = [];
for( r = 0; r <ROW; r++){
    board[r] = [];
    for(c = 0; c < COL; c++){
        board[r][c] = VACANT;
    }
}

// Рисуем доску
function drawBoard(){
    for( r = 0; r <ROW; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c,r,board[r][c]);
        }
    }
}

drawBoard();

// Фигуры и их цвета

const PIECES = [
    [Z,"red"],
    [S,"green"],
    [T,"yellow"],
    [O,"blue"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];

// Генерируем случайные фигуры

function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length) // 0 -> 6
    return new Piece( PIECES[r][0],PIECES[r][1]);
}

let p = randomPiece();

// Объект - фигура

function Piece(tetromino,color){
    this.tetromino = tetromino;
    this.color = color;
    
    this.tetrominoN = 0; // Мы начинаем с первой модели
    this.activeTetromino = this.tetromino[this.tetrominoN];
    
    // Нам нужно контролировать фигуры
    this.x = 3;
    this.y = -2;
}

// Функция заполнения

Piece.prototype.fill = function(color){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // Рисуем только занятые квадраты
            if( this.activeTetromino[r][c]){
                drawSquare(this.x + c,this.y + r, color);
            }
        }
    }
}

// Рисуем фигуру на доске

Piece.prototype.draw = function(){
    this.fill(this.color);
}

// Поворот фигуры


Piece.prototype.unDraw = function(){
    this.fill(VACANT);
}

// Двигаем фигуру вниз

Piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        // Мы замыкаем фигуру и генерируем новую
        this.lock();
        p = randomPiece();
    }
    
}

// Двигаем фигуру вправо
Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// Двигаем фигуру влево
Piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// Поворачиваем фигуру
Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let kick = 0;
    
    if(this.collision(0,0,nextPattern)){
        if(this.x > COL/2){
            // Это правая стена
            kick = -1; // Нам нужно сдвинуть фигуру влево
        }else{
            // Это левая стена
            kick = 1; // Нам нужно сдвинуть фигуру вправо
        }
    }
    
    if(!this.collision(kick,0,nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;

Piece.prototype.lock = function(){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // Мы пропускаем пустые квадраты
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // Фигура "дотронулась" до верха = game over
            if(this.y + r < 0){
                alert("Game Over");
                // Остановить игру
                gameOver = true;
                break;
            }
            // Мы замыкаем фигуру
            board[this.y+r][this.x+c] = this.color;
        }
    }
    // Удаляем полные строки
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for( c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c] != VACANT);
        }
        if(isRowFull){
            // Если строка полная
            // Мы опускаем все строки над ним
            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            // Верхняя строка доски не имеет строки над ним
            for( c = 0; c < COL; c++){
                board[0][c] = VACANT;
            }
            // Увеличить счёт
            score += 10;
        }
    }
    // Обновить доску
    drawBoard();
    
    // Обновить счёт
    scoreElement.innerHTML = score;
}

// Функция столкновения

Piece.prototype.collision = function(x,y,piece){
    for( r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // Если квадрат пуст, мы пропускаем
            if(!piece[r][c]){
                continue;
            }
            // Координаты детали после перемещения
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            
            // Пропишем условия
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            // Пропускаем newY < 0; board[-1] крашнет нашу игру
            if(newY < 0){
                continue;
            }
            // Проверка, есть ли замкнутный элемент на месте
            if( board[newY][newX] != VACANT){
                return true;
            }
        }
    }
    return false;
}

// Контролирование фигуры

document.addEventListener("keydown",CONTROL);

function CONTROL(event){
    if(event.keyCode == 37){
        p.moveLeft();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
        p.rotate();
        dropStart = Date.now();
    }else if(event.keyCode == 39){
        p.moveRight();
        dropStart = Date.now();
    }else if(event.keyCode == 40){
        p.moveDown();
    }
}

// Дропать фигуру каждую секунду

let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 1000){
        p.moveDown();
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
}

drop();



















