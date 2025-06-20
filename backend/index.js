const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app); // Tạo HTTP server
const wss = new WebSocket.Server({ server }); // Gắn WebSocket vào server

const letterChars = ['a', 'b', 'c', 'd'];
const numChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const mathChars = ['+', '-', '*', '(', ')', ' '];
const numOfFreeNumbers = 4;

let secretCode;
let secretCodeNumber;
let availableNumbers = [];

wss.on('connection', (ws) => {
    // Nhận dữ liệu từ client
    ws.on('message', (message) => {
        const { type, ...data } = JSON.parse(message);

        try {
            switch(type) {
                case "Hello Server!":
                    console.log('🟢 Server đã kết nối thành công');
                    ws.send(JSON.stringify({ type: "Hello Client!" }));
                    break;
                case "generate":
                    generate();
                    break;
                case "freeNumbers": 
                    freeNumbers();
                    break;
                case "addAvailableNumbers": 
                    addAvailableNumbers(true, true);
                    break;
                case "compareExpressions":
                    compareExpressions(data.latex1, data.latex2);
                    break;
                case "checkProperties":
                    checkProperties(data.input);
                    break;
                case "matchCode":
                    matchCode(data.inputCode);
                    break;
                case "checkGuess":
                    checkGuess(data.guess);
                    break;
                case "compareSecretCodeWithMid":
                    compareSecretCodeWithMid(data.lower, data.upper);
                    break;
                default:
                    window.alert("Không thể nhận diện message gửi từ client: " + type);
                    break;
            }
        } catch(err) {
            console.log("Yêu cầu được gửi từ client không đúng định dạng.");
        }
    });

    function generate() {
        secretCode = [Math.round(Math.random() * 9), Math.round(Math.random() * 9), Math.round(Math.random() * 9), Math.round(Math.random() * 9)];
        secretCodeNumber = secretCode[0] * 1000 + secretCode[1] * 100 + secretCode[2] * 10 + secretCode[3];
    }
    
    // Làm sạch tập số hiện tại và cấp phát các chữ số miễn phí mới vào tập số được dùng
    async function freeNumbers() {
        while (availableNumbers.length != 0) {
            availableNumbers.pop();
        }
    
        for (let i = 0; i < Math.min(numOfFreeNumbers, 3); i++) {
            addAvailableNumbers(false, false);
        }
    
        for (let i = 3; i < numOfFreeNumbers; i++) {
            addAvailableNumbers(true, false);
        }
    
        ws.send(JSON.stringify({ type: "availableNumbers", message: availableNumbers.join(" ") }));
    }
    
    // Thêm chữ số mới vào tập số được dùng
    async function addAvailableNumbers(isZeroAvailable, isAddOnly) {
        let newNumber;
    
        if (isZeroAvailable) {
            newNumber = Math.round(Math.random() * 9);
        } else {
            newNumber = Math.round(Math.random() * 8) + 1;
        }
    
        availableNumbers.push(newNumber);
    
        if (isAddOnly) {
            ws.send(JSON.stringify({ type: "availableNumbers", message: availableNumbers.join(" ") }));
        }
    }
    
    //So sánh
    
    function compareExpressions(latex1, latex2) {
        let isEvalError = false;
    
        try {
            checkExpression(latex1,latex2);
    
            isEvalError = true;
            let result1 = eval(exchangeLetterToNumber(latex1));
            let result2 = eval(latex2);
            isEvalError = false;
    
            if (result1 > result2) {
                ws.send(JSON.stringify({ type: "compareExpressions", message: 'expression 1 value bigger' }));
            } else if (result1 < result2) {
                ws.send(JSON.stringify({ type: "compareExpressions", message: 'expression 2 value bigger' }));
            } else {
                ws.send(JSON.stringify({ type: "compareExpressions", message: '2 expressions value are equal' }));
            }
        } catch(err) {
            if (isEvalError) {
                err = "Không thể thực hiện tính toán các biểu thức vừa nhập.";
            }
    
            ws.send(JSON.stringify({ type: "compareExpressions", message: err.toString() }));
        }
    }
    
    function checkExpression(latex1, latex2) {
        let markLetterChars = [true, true, true, true];
        let markAvailableNums = [];
        let counter = 0;
    
        for (i in availableNumbers) {
            markAvailableNums.push(true);
        }
    
        for (let i = 0; i < latex1.length; i++) {
            let mark = true;
            for (let j = 0; j < 4; j++) {
                if (latex1.charAt(i) == letterChars[j]) {
                    if (i != 0 && letterChars.includes(latex1.charAt(i - 1))) {
                        throw "Không được ghép bất kỳ hai chữ số trở nên nào ở biểu thức 1 để tạo thành số mới.";
                    }
    
                    if (markLetterChars[j]) {
                        counter++;
                        markLetterChars[j] = false;
                        mark = false;
                        break;
                    } else {
                        throw "Các chữ số ở mật mã chỉ được sử dụng duy nhất một lần ở biểu thức 1.";
                    }
                }
            }
    
            if (mark && !mathChars.includes(latex1.charAt(i))) {
                throw "Chỉ được sử dụng các dấu +, -, *, () và các chữ số a, b, c, d ở mật mã để nhập biểu thức 1.";
            }
        }
    
        if (counter < 2 || counter > 3) {
            throw "Mọi biểu thức đều phải dùng 2 hoặc 3 chữ số.";
        }
    
        for (let i = 0; i < latex2.length; i++) {
            if (numChars.includes(latex2.charAt(i))) {
                if (i != 0 && numChars.includes(latex2.charAt(i - 1))) {
                    throw "Không được ghép bất kỳ hai chữ số trở nên nào ở biểu thức 2 để tạo thành số mới.";
                }
    
                let markErr = true;
    
                for (let j = 0; j < availableNumbers.length; j++) {
                    if (((latex2.charAt(i) - '0') == availableNumbers[j]) && markAvailableNums[j]) {
                        counter--;
                        markAvailableNums[j] = false;
                        markErr = false;
                        break;    
                    }
                }
    
                if (markErr) {
                    throw "Chỉ được sử dụng các chữ số từ tập số được dùng và mỗi vị trí trong tập chỉ được sử dụng một lần ở biểu thức 2.";
                }
            } else if (!mathChars.includes(latex2.charAt(i))) {
                throw "Chỉ được sử dụng các dấu +, -, *, () và các chữ số ở tập số được dùng để nhập biểu thức 2.";
            }
        }
    
        if (counter != 0) {
            throw "Số lượng chữ số sử dụng ở hai biểu thức phải bằng nhau.";
        } 
    }
    
    function checkProperties(input) {
        try {
            checkNumberForProperties(input);
    
            let numberExchanged = parseInt(exchangeLetterToNumber(input));
            let sqrt = Math.sqrt(numberExchanged);
    
            if (sqrt == Math.round(sqrt)) {
                ws.send(JSON.stringify({ type: "checkProperties", message: 'số chính phương' }));
            } else {
                let sumOfDivisior = 1;
    
                for (let i = 2; i < sqrt; i++) {
                    if (numberExchanged % i == 0) {
                        sumOfDivisior += (i + numberExchanged / i); 
                    }
                }
    
                if (sumOfDivisior == numberExchanged) {
                    ws.send(JSON.stringify({ type: "checkProperties", message: 'số hoàn hảo' }));
                } else if (sumOfDivisior == 1) {
                    ws.send(JSON.stringify({ type: "checkProperties", message: 'số nguyên tố' }));
                } else {
                    ws.send(JSON.stringify({ type: "checkProperties", message: 'không là gì cả' }));
                }
            }
        } catch(err) {
            ws.send(JSON.stringify({ type: "checkProperties", message: err.toString() }));
        }
    }
    
    function checkNumberForProperties(input) {
        if(input.length < 2 || input.length > 4) {
            throw "Số được nhập phải có từ 2 đến 4 chữ số.";
        }
    
        let markLetterChars = [true, true, true, true];
        let markAvailableNums = [];
        let letterCounter = 0;
    
        for (i in availableNumbers) {
            markAvailableNums.push(true);
        }
    
        for (let i = 0; i < input.length; i++) {
            let mark = true;
            for (let j = 0; j < 4; j++) {
                if (input.charAt(i) == letterChars[j]) {
                    if (markLetterChars[j]) {
                        letterCounter++;
                        markLetterChars[j] = false;
                        mark = false;
                        break;
                    } else {
                        throw "Các chữ số ở mật mã chỉ được sử dụng duy nhất một lần.";
                    }
                }
            }
    
            if (mark) {
                for (let j = 0; j < availableNumbers.length; j++) {
                    if (((input.charAt(i) - '0') == availableNumbers[j]) && markAvailableNums[j]) {
                        markAvailableNums[j] = false;
                        mark = false;
                        break;    
                    }
                }
    
                if (mark) {
                    throw "Chỉ được sử dụng các chữ số từ mật mã hoặc tập số được dùng và mỗi vị trí chỉ được sử dụng một lần.";
                }
            }
        }
    
        if (letterCounter < 2) {
            throw "Phải sử dụng ít nhất hai chữ số từ mật mã.";
        }
    }
    
    // Đối chiếu
    
    function matchCode(inputCode) {
        try {
            checkNumberForMatchCode(inputCode);
    
            let numberAtRightPosition = 0;
            let rightNumberButWrongPosition = 0;
            let unmatchedPlaceAtAnswer = [true, true, true, true];
            let unmatchedPlaceAtInput = [true, true, true, true];
    
            for (let i = 0; i < 4; i++) {
                if ((inputCode.charAt(i) - '0') == secretCode[i]) {
                    numberAtRightPosition++;
                    unmatchedPlaceAtAnswer[i] = false;
                    unmatchedPlaceAtInput[i] = false;
                }
            }
    
            for (let i = 0; i < 4; i++) {
                if (unmatchedPlaceAtInput[i]) {
                    for (let j = 0; j < 4; j++) {
                        if (i != j && unmatchedPlaceAtAnswer[j] && (inputCode.charAt(i) - '0') == secretCode[j]) {
                            rightNumberButWrongPosition++;
                            unmatchedPlaceAtAnswer[j] = false;
                            break;
                        }
                    }
                }
            }
    
            let output = inputCode + ": " + numberAtRightPosition + " chữ số đúng và ở đúng vị trí, " 
                        + rightNumberButWrongPosition + " chữ số đúng nhưng ở sai vị trí";
            ws.send(JSON.stringify({ type: "matchCode", message: output })); // Bỏ dấu chấm ở cuối câu để phân biện với error
        } catch(err) {
            ws.send(JSON.stringify({ type: "matchCode", message: err.toString() }));
        }
    }
    
    function checkNumberForMatchCode(input) {
        if (input.length != 4) {
            throw "Số nhập vào phải có đúng 4 chữ số.";
        }
    
        let markAvailableNums = [];
    
        for (i in availableNumbers) {
            markAvailableNums.push(true);
        }
    
        for (let i = 0; i < input.length; i++) {
            let mark = true;
    
            if (!numChars.includes(input.charAt(i))) {
                throw "Không được sử dụng các ký tự không phải là các chữ số.";
            }
    
            for (let j = 0; j < availableNumbers.length; j++) {
                if (((input.charAt(i) - '0') == availableNumbers[j]) && markAvailableNums[j]) {
                    markAvailableNums[j] = false;
                    mark = false;
                    break;    
                }
            }
    
            if (mark) {
                throw "Chỉ được sử dụng các chữ số từ tập số được dùng và mỗi vị trí chỉ được sử dụng một lần.";
            }
        }
    }
    
    // Quy đổi các chữ a,b,c,d về các số trong mật mã
    function exchangeLetterToNumber(latex) {
        try {
            let exchangedExpression = "";
            
            for (let i = 0; i < latex.length; i++) {
                let mark = true;
    
                for (let j = 0; j < 4; j++) {
                    if (latex.charAt(i) == letterChars[j]) {
                        exchangedExpression += "" + secretCode[j];
                        mark = false;
                        break;
                    }
                }
    
                if (mark) {
                    exchangedExpression += latex.charAt(i);
                }
            }
    
            return exchangedExpression;
        } catch(err) {
            throw err;
        }
    }
    
    function checkGuess(guess) {
        if (parseInt(guess) == secretCodeNumber) {
            ws.send(JSON.stringify({ type: "submitResult", message: 'correct', answer: guess }));
        } else {
            ws.send(JSON.stringify({ type: "submitResult", message: 'incorrect', answer: guess }));
        }
    }
    
    function compareSecretCodeWithMid(lower, upper) {
        let mid = parseInt((lower + upper) / 2);
    
        if (secretCodeNumber == mid) {
            ws.send(JSON.stringify({ type: "compareSecretCodeWithMidResult", message: 'equal', lower: lower, upper: upper }));
        } else if (secretCodeNumber < mid) {
            ws.send(JSON.stringify({ type: "compareSecretCodeWithMidResult", message: 'lower', lower: lower, upper: (mid - 1) }));
        } else {
            ws.send(JSON.stringify({ type: "compareSecretCodeWithMidResult", message: 'upper', lower: (mid + 1), upper: upper }));
        }
    }
  
    ws.on('close', () => {
        console.log('❌ Client đã ngắt kết nối');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`🚀 WebSocket server running at ws://slove-the-password-backend.onrender.com`);
});