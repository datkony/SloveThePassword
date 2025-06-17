const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const letterChars = ['a', 'b', 'c', 'd'];
const numChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const mathChars = ['+', '-', '*', '(', ')', ' '];

let secretCode = [Math.round(Math.random() * 9), Math.round(Math.random() * 9), Math.round(Math.random() * 9), Math.round(Math.random() * 9)];
let secretCodeNumber = secretCode[0] * 1000 + secretCode[1] * 100 + secretCode[2] * 10 + secretCode[3];
let availableNumbers = [];

// API to check guess
app.post('/check', (req, res) => {
    const { guess } = req.body;

    if (!guess) {
        return res.status(400).json({ error: 'Missing guess' });
    }
    

    if (parseInt(guess) === secretCodeNumber) {
        return res.json({ result: 'correct' });
    } else {
        return res.json({ result: 'incorrect' });
    }
});

// GET /secret — returns the current secret code (for dev only)
app.get('/secret', (req, res) => {
    res.json({ secret: secretCodeNumber });
});

// Regenerate the secret code
app.post('/generate', (req, res) => {
    secretCode = [Math.round(Math.random() * 9), Math.round(Math.random() * 9), Math.round(Math.random() * 9), Math.round(Math.random() * 9)];
    secretCodeNumber = secretCode[0] * 1000 + secretCode[1] * 100 + secretCode[2] * 10 + secretCode[3];
    res.json({ message: 'New secret code generated.' });
});

// Push Number to Available numbers
app.post('/pushAvailableNumbers', (req, res) => {
    const { newNumber } = req.body;
    availableNumbers.push(newNumber);
    res.json({ message: 'Push complete'});
});

// Remove all Available numbers
app.post('/removeAllAvailableNumbers', (req, res) => {
    while (availableNumbers.length != 0) {
        availableNumbers.pop();
    }
    res.json({ message: 'Remove complete'});
})

//So sánh

app.post('/compareExpressions', (req, res) => {
    const { latex1, latex2 } = req.body;

    let isEvalError = false;

    try {
        checkExpression(latex1,latex2);

        isEvalError = true;
        let result1 = eval(exchangeLetterToNumber(latex1));
        let result2 = eval(latex2);
        isEvalError = false;

        if (result1 > result2) {
            res.json({ message: 'expression 1 value bigger' });
        } else if (result1 < result2) {
            res.json({ message: 'expression 2 value bigger' });
        } else {
            res.json({ message: '2 expressions value are equal' });
        }
    } catch(err) {
        if (isEvalError) {
            err = "Không thể thực hiện tính toán các biểu thức vừa nhập.";
        }

        res.json({ message: err.toString() });
    }
});

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
        throw "Mỗi biểu thức đều phải dùng 2 hoặc 3 chữ số.";
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
                throw "Chỉ được sủ dụng các chữ số từ tập số được dùng và mỗi vị trí trong tập chỉ được sử dụng một lần ở biểu thức 2.";
            }
        } else if (!mathChars.includes(latex2.charAt(i))) {
            throw "Chỉ được sử dụng các dấu +, -, *, () và các chữ số ở tập số được dùng để nhập biểu thức 2.";
        }
    }

    if (counter != 0) {
        throw "Số lượng chữ số sử dụng ở hai biểu thức phải bằng nhau.";
    } 
}

// Ghép số

app.post('/checkProperties', (req, res) => {
    const { input } = req.body;

    try {
        checkNumberForProperties(input);

        let numberExchanged = parseInt(exchangeLetterToNumber(input));
        let sqrt = Math.sqrt(numberExchanged);

        if (sqrt == Math.round(sqrt)) {
            res.json({ message : 'số chính phương'});
        } else {
            let sumOfDivisior = 1;

            for (let i = 2; i < sqrt; i++) {
                if (numberExchanged % i == 0) {
                    sumOfDivisior += (i + numberExchanged / i); 
                }
            }

            if (sumOfDivisior == numberExchanged) {
                res.json({ message: 'số hoàn hảo' });
            } else if (sumOfDivisior == 1) {
                res.json({ message: 'số nguyên tố' });
            } else {
                res.json({ message: 'không là gì cả' });
            }
        }
    } catch(err) {
        res.json({ message : err.toString() });
    }
});

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
                throw "Chỉ được sủ dụng các chữ số từ mật mã hoặc tập số được dùng và mỗi vị trí chỉ được sử dụng một lần.";
            }
        }
    }

    if (letterCounter < 2) {
        throw "Phải sử dụng ít nhất hai chữ số từ mật mã.";
    }
}

// Đối chiếu

app.post('/matchCode', (req, res) => {
    const{ inputCode } = req.body;

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
        res.json({ message: output });  //Bỏ dấu chấm ở cuối câu để phân biện với error
    } catch(err) {
        res.json({ message: err.message || err.toString() });
    }
})

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://slove-the-password-backend.onrender.com`);
});

