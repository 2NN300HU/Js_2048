const scoreBox = document.getElementById("score");
const highScoreBox = document.getElementById("highScore");

const gameSize = 4;

class GameBoard {
    constructor(size) {
        this.highScore = 0;
        this.loadHighScore();
        this.score = 0;
        this.setScore();
        this.board = [];
        this.domBoard = [];
        this.size = size;
        this.max = 2;
        this.createBoard();
        this.initBoard();
        this.isFinished = false;
    }

    setScore() {
        if (this.highScore < this.score) {
            this.highScore = this.score;
        }
        scoreBox.innerText = this.score;
        highScoreBox.innerText = this.highScore;
    }

    loadHighScore() {
        const old = this.getCookie();
        if (old !== null) {
            this.highScore = old;
        }
    }

    saveHighScore() {
        const old = this.getCookie();
        if (old === null) {
            this.setCookie(this.score);
        } else if (old < this.score) {
            this.deleteCookie();
            this.setCookie(this.score);
        }
    }

    setCookie(value) {
        let date = new Date();
        date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
        document.cookie = "highscore" + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
    }

    deleteCookie() {
        document.cookie = "highscore" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    getCookie() {
        let value = document.cookie.match('(^|;) ?' + "highscore" + '=([^;]*)(;|$)');
        return value ? value[2] : null;
    }


    initBoard() {
        this.board = [];
        for (var i = 0; i < this.size; i++) {
            var arr = [];
            for (var j = 0; j < this.size; j++) {
                arr.push(0);
            }
            this.board.push(arr);
        }
        this.createNewBlock();
        this.printBoard();
    }

    createBoard() {
        for (var y = 0; y < this.size; y++) {
            var line = document.createElement('div');
            document.body.append(line);
            this.domBoard.push([])
            for (var x = 0; x < this.size; x++) {
                var temp = document.createElement('div');
                line.append(temp);
                this.domBoard[y].push(temp);
            }
        }

    }

    printBoard() {
        for (var y = 0; y < this.size; y++) {
            var dom;
            var num;
            for (var x = 0; x < this.size; x++) {
                dom = this.domBoard[y][x];
                num = this.board[y][x];
                dom.innerText = num;
                if (num <= 64) {
                    dom.className = 'block n' + num;
                } else if (num > 64) {
                    dom.className = "block nmax"
                }
            }
            this.domBoard[y][0].className += " first";
        }
    }

    createNewBlock() {
        var isNotEmpty = true;
        while (isNotEmpty) {
            var newBlock = this.getNewBlock();
            var x = Math.floor(newBlock / this.size);
            var y = newBlock % this.size;
            if (this.board[y][x] === 0) {
                isNotEmpty = false;
                this.board[y][x] = this.createNewNum();
            }
        }
    }

    createNewNum() {
        return Math.floor((Math.floor(Math.random() * 10) + 11) / 10) * 2;
    }

    getNewBlock() {
        return Math.floor(Math.random() * this.size * this.size);
    }

    move(direction) {
        var isMoved = false;
        const moveSet = [[0, 1], [1, 1], [0, 0], [1, 0]]
        for (var i = 0; i < this.size; i++) {
            var curArr = new Array(this.size);
            for (var j = 0; j < this.size; j++) {
                if (moveSet[direction][0]) {
                    curArr[j] = this.board[j][i];
                } else {
                    curArr[j] = this.board[i][j];
                }
            }
            var chgArr = this.moveArr(curArr, moveSet[direction][1]);
            if (JSON.stringify(curArr) !== JSON.stringify(chgArr)) {
                isMoved = true;
            }
            for (var j = 0; j < this.size; j++) {
                if (moveSet[direction][0]) {
                    this.board[j][i] = chgArr[j];
                } else {
                    this.board[i][j] = chgArr[j];
                }
            }
        }
        if (isMoved) {
            if (this.chkMax()) {
                if (this.max >= 2048 && !this.isFinished) {
                    this.printBoard();
                    setTimeout(function () { window.alert("2048!"); }, 20);
                    this.isFinished = true;
                }
            }
            this.createNewBlock();
            this.printBoard();
            if (this.isDead()) {
                this.max = 2;
                this.isFinished = false;
                this.setScore();
                this.saveHighScore();
                this.score = 0;
                var temp = this
                setTimeout(function () { window.alert("Game Over!"); temp.initBoard(); temp.setScore(); }, 20);
            } else {
                this.setScore();
            }
        }
    }

    moveArr(arr, align) {
        if (!align) {
            arr.reverse();
        }
        var chgArr = new Array(this.size);
        var pointer = 0;
        var newPointer = 0;
        while (pointer < this.size) {
            var curNum = arr[pointer];
            if (curNum === 0) {
                //pass
            } else {
                var curPointer = pointer;
                while (pointer + 1 < this.size && arr[pointer + 1] === 0) {
                    pointer++;
                }
                if (pointer + 1 < this.size) {
                    if (arr[curPointer] === arr[pointer + 1]) {
                        chgArr[newPointer] = 2 * arr[curPointer];
                        this.score += chgArr[newPointer];
                        pointer++;
                        newPointer++;
                    } else {
                        chgArr[newPointer] = arr[curPointer];
                        newPointer++;
                    }
                } else {
                    chgArr[newPointer] = arr[curPointer];
                    newPointer++;
                }
            }
            pointer++;
        }
        while (newPointer < this.size) {
            chgArr[newPointer] = 0;
            newPointer++;
        }
        if (!align) {
            arr.reverse();
            chgArr.reverse();
        }
        return chgArr;
    }

    chkMax() {
        for (var i = 0; i < this.size; i++) {
            for (var j = 0; j < this.size; j++) {
                if (this.max < this.board[i][j]) {
                    this.max = this.board[i][j];
                    return true;
                }
            }
        }
        return false;
    }

    isDead() {
        const preSet = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        for (var i = 0; i < this.size; i++) {
            for (var j = 0; j < this.size; j++) {
                var curNum = this.board[i][j];
                if (curNum === 0) {
                    return false;
                }
                for (var k = 0; k < 4; k++) {
                    if (0 <= (i + preSet[k][0]) && this.size > (i + preSet[k][0]) && 0 <= (j + preSet[k][1]) && this.size > (j + preSet[k][1])) {
                        if (curNum === this.board[i + preSet[k][0]][j + preSet[k][1]]) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
}

const mainBoard = new GameBoard(gameSize);

window.addEventListener("keydown", (e) => {
    var dir = 0;
    switch (e.code) {
        case "ArrowLeft":
            dir = 0;
            break;
        case "ArrowUp":
            dir = 1;
            break;
        case "ArrowRight":
            dir = 2;
            break;
        case "ArrowDown":
            dir = 3;
            break;
        default:
            return;
    }
    mainBoard.move(dir);
});