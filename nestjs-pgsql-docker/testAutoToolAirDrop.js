/* airDrop xKuCoin */
// // Tìm phần tử bằng class
// copy(Telegram.WebApp.initData) lấy id đăng nhập của telegram
let frogElement = document.querySelector('.frogAnim--kxM3C');

// Biến để lưu interval của click liên tục
let clickInterval;

// Hàm click liên tục
function clickFrog() {
    if (frogElement) {
        let event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        frogElement.dispatchEvent(event);
    } else {
        console.log("Không tìm thấy phần tử với class frogAnim--kxM3C.");
    }
}

// Hàm bắt đầu click trong 1 phút, sau đó nghỉ 14 phút
function startClickingCycle() {
    // Bắt đầu click liên tục mỗi 300ms
    clickInterval = setInterval(clickFrog, 100);

    // Dừng click sau 1 phút (60,000ms)
    setTimeout(function() {
        clearInterval(clickInterval);
        console.log("Đã dừng click. Nghỉ ngơi trong 14 phút...");

        // Sau 14 phút (840,000ms), bắt đầu click lại
        setTimeout(function() {
            console.log("Bắt đầu click lại...");
            startClickingCycle(); // Gọi lại hàm để lặp lại chu kỳ
        }, 1620000); // 27 phút chờ đầy

    }, 300000); // 5 phút
}

// Bắt đầu chu kỳ click và nghỉ
startClickingCycle();


///////////////////////////////////////
///////////////////////////////////////

/* airDrop Gumart */
// Tìm thẻ <p> có nội dung là "Collect"
// let pElement = [...document.querySelectorAll('p')].find(el => el.textContent.trim() === 'Collect');


// // Tìm phần tử button chứa thẻ <p> đó
// let buttonElement;
// if (pElement) {
//     buttonElement = pElement.closest('button');
// }

// // Biến để lưu interval của click liên tục
// let clickInterval;

// // Hàm click liên tục
// function clickButton() {
//     if (buttonElement) {
//         let event = new MouseEvent('click', {
//             view: window,
//             bubbles: true,
//             cancelable: true
//         });
//         buttonElement.dispatchEvent(event);
//     } else {
//         console.log("Không tìm thấy phần tử button chứa thẻ <p> có nội dung 'Collect'.");
//     }
// }

// // Hàm bắt đầu click trong 3 giây
// function startClickingCycle() {
//     // Bắt đầu click liên tục mỗi 100ms
//     clickInterval = setInterval(clickButton, 100);

//     // Dừng click sau 3 giây (3,000ms)
//     setTimeout(function() {
//         clearInterval(clickInterval);
//         console.log("Đã dừng click sau 3 giây.");
        
//         // Thêm logic khác nếu cần

//     }, 3000); // 3 giây
// }

// // Bắt đầu chu kỳ click
// startClickingCycle();

////////////////////////////////////
////////////////////////////////////
/* airDrop yescoin */
let canvasElement = document.querySelector('canvas.sketch');
let coinPoolElement = document.querySelector('.coin-pool');

// Hàm mô phỏng di chuyển chuột
function simulateMouseMove(x, y) {
    if (canvasElement) {
        let event = new MouseEvent('mousemove', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y
        });
        canvasElement.dispatchEvent(event);
    } else {
        console.log("Không tìm thấy phần tử canvas.");
    }
}

// Hàm di chuyển chuột ngang qua canvas
function simulateHorizontalMouseMove(cursorIndex, totalCursors) {
    if (!canvasElement) return;

    const canvasWidth = canvasElement.width;
    const canvasHeight = canvasElement.height;

    // Tính toán khoảng cách giữa các con trỏ
    const sectionHeight = Math.floor(canvasHeight / totalCursors);
    const startY = Math.floor(sectionHeight * cursorIndex); // Tọa độ Y của mỗi con trỏ khác nhau

    const stepSize = 5; // Di chuyển cách mỗi 5 pixel
    const interval = 10; // Tính khoảng thời gian giữa mỗi lần di chuột

    let x = 0; // Bắt đầu tại vị trí X

    // Hàm để di chuyển chuột theo từng bước
    function moveMouse() {
        simulateMouseMove(x, startY);

        // Di chuyển theo trục X, reset lại khi đạt giới hạn
        x += stepSize;
        if (x >= canvasWidth) {
            x = 0; // Reset về điểm bắt đầu
        }

        // Tiếp tục di chuột
        setTimeout(moveMouse, interval);
    }

    // Bắt đầu di chuột
    moveMouse();
}

// Hàm kiểm tra giá trị của phần tử coin-pool
function checkCoinPoolAndMoveCursors() {
    if (!coinPoolElement) {
        console.log("Không tìm thấy phần tử 'coin-pool'.");
        return;
    }

    // Lấy giá trị hiện tại của coin-pool
    let coinValue = parseInt(coinPoolElement.innerText, 10);

    if (coinValue === 3000) {
        console.log("Coin pool đầy, bắt đầu chạy con trỏ...");

        // Khởi tạo 7 con trỏ chuột lướt ngang đồng thời
        const totalCursors = 20;
        for (let i = 0; i < totalCursors; i++) {
            simulateHorizontalMouseMove(i, totalCursors);
        }
    } else {
        console.log("Coin pool chưa đầy, chờ đến khi đầy 3000...");
        // Kiểm tra lại sau 5 phút (300000 ms)
        setTimeout(checkCoinPoolAndMoveCursors, 300000);
    }
}

// Khởi động việc kiểm tra coin-pool và chạy con trỏ
checkCoinPoolAndMoveCursors();


