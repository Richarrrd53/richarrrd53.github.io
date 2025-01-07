const marqueeContent = this.document.getElementById('marquee-content');
let messages = [];
let currentIndex = 0;
let tableNumber = 0;
let iframeId = '';
let urlParams = '';
let isLooking = false;
let DefaultImg = "../data/Default.jpg";
let images = [];
let imgLen;

document.addEventListener('DOMContentLoaded', () => {
    
    urlParams = new URLSearchParams(window.location.search);
    iframeId = urlParams.get('iframeId');
    if(iframeId == '1'){
        isLooking = true;
    }
});


async function updateMarquee() {
    // 嘗試讀取文字檔
    try {
        const response = await fetch('../data/marquee_table_number.txt');
        const text = await response.text();
        const newMessages = text.split('\n').filter(line => line.trim() !== '');
        tableNumber = parseInt(iframeId);
        imgLen = 6;
        for (let k = 0; k < 3; k++){
            if (newMessages[0].startsWith("歡迎光臨")) {
                newMessages[0] = newMessages[0].substring(0,4)+"\n"+newMessages[0].substring(5,newMessages[0].length);
            }
            messages = messages.concat(newMessages[0]);
            newMessages[tableNumber] = newMessages[tableNumber].substring(0,newMessages[tableNumber].search("桌")+1)+"\n"+newMessages[tableNumber].substring(newMessages[tableNumber].search("桌")+2,newMessages[tableNumber].length);
            messages = messages.concat(newMessages[tableNumber]);
            for (let n = 0; n < imgLen/3; n++) {
                messages = messages.concat("img");
            }

        }
        // 清空跑馬燈內容
        marqueeContent.innerHTML = '';
        messages.forEach((message,n) => {
            const item = document.createElement('div');
                item.className = 'marquee-item';
                marqueeContent.appendChild(item);
            if (message == "img") {
                const img = document.createElement('img');
                img.classList.add('marquee-img');
                img.id = `${tableNumber}-${(Math.floor((n)/4))*2+(n)%4-2}`;
                updateImg(img);
                img.ontouchstart = () => {imgTouchStart(img)};
                img.ontouchmove = () => {imgTouchMove(img)};
                img.ontouchend = () => {imgTouchEnd(img)};
                img.oncontextmenu = () => {return false};
                item.appendChild(img);
            }
            else {
                const content = document.createElement('textarea');
                content.classList.add('textarea');
                content.value = message;
                item.appendChild(content);
                content.onfocus = () => {marqueeEditing()};
                content.onblur = () => {marqueeNotEditing(content)};
                const span1 = document.createElement('span');
                const span2 = document.createElement('span');
                span1.textContent = message.split('\n')[0];
                span2.textContent = message.split('\n')[1];
                span1.classList.add("span1");
                span2.classList.add("span2");
                item.appendChild(span1);
                item.appendChild(span2);
                content.id = `${tableNumber}-${(Math.floor((n+1)/4))*2+(n+1)%4-1}`;
                span1.id = `span1-${tableNumber}-${(Math.floor((n+1)/4))*2+(n+1)%4-1}`;
                span2.id = `span2-${tableNumber}-${(Math.floor((n+1)/4))*2+(n+1)%4-1}`;
                if(n == 0 || (n+1) % 4 == 1) {
                    content.style.color = "#e9c46a";
                    span1.style.color = "#e9c46a";
                    span2.style.color = "#e9c46a";
                    content.style.display = 'none';
                    span1.style.display = 'flex';
                    span2.style.display = 'flex';
                    setTimeout(function(){content.style.display = 'flex'; span1.style.display = 'none'; span2.style.display = 'none';},1100);
                }
            }
            
        });
    }
    catch (error) {
        console.error('無法讀取文字檔:', error);
        // 可以在此處顯示錯誤訊息或預設內容
    }
}

const textareas = document.getElementsByClassName('textarea');


var marquee_editing = false;

function marqueeEditing() {
    marquee_editing = true;
}
async function marqueeNotEditing(x) {
    if (!x || !x.id) {
        console.error("Invalid element:", x);
        return;
    }

    const idParts = x.id.split('-');
    if (idParts.length !== 2) {
        console.error("Invalid id format:", x.id);
        return;
    }

    const index = parseInt(idParts[0]);
    const index2 = parseInt(idParts[1]%2);
    const newValue = replaceNewlinesWithSpaces(x.value);
    const span1 = document.getElementById("span1-"+index+"-"+index2);
    const span2 = document.getElementById("span2-"+index+"-"+index2);

    try {
        // 1. 取得現有資料
        const responseGet = await fetch('/get-marquee-data');
        if (!responseGet.ok) {
            throw new Error(`HTTP error! status: ${responseGet.status}`);
        }
        const text = await responseGet.text();
        const lines = text.split('\n');

        // 2. 修改指定行
        if (index >= 0 && index < lines.length) {
            if (index2 == 0) {
                lines[0] = newValue;
                span1.textContent = x.value.split('\n')[0];
                span2.textContent = x.value.split('\n')[1];
            }
            else {
                lines[index] = newValue;
                span1.textContent = x.value.split('\n')[0];
                span2.textContent = x.value.split('\n')[1];
            }
        } else {
            console.error("Invalid index:", index);
            return;
        }
        const updatedText = lines.join('\n');

        // 3. 將修改後的資料傳送到伺服器
        const responsePost = await fetch('/save-marquee-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: updatedText }),
        });

        if (!responsePost.ok) {
            throw new Error(`HTTP error! status: ${responsePost.status}`);
        }

        const result = await responsePost.text();
        console.log(result); // 顯示伺服器回覆
    } catch (error) {
        console.error("Error updating file:", error);
    }
    marquee_editing = false;
}

function replaceNewlinesWithSpaces(text) {
    return text.replace(/\r\n|\r|\n/g, ' ');
}

function animateSpans(index, animation1, animation2, animation3, animation4) {
    const span1 = document.getElementsByClassName('span1');
    const span2 = document.getElementsByClassName('span2');
    const content = document.getElementsByClassName('textarea');
    if (index < 0 || index >= content.length) {
        return; // 直接結束函式，不執行任何動畫
    }
    else {
        content[index].style.display = 'none';
        span1[index].style.display = 'flex';
        span2[index].style.display = 'flex';
        span1[index].style.animation = animation1;
        span2[index].style.animation = animation2;
        setTimeout(function () {
            content[index].style.display = 'flex';
            span1[index].style.animation = animation3;
            span2[index].style.animation = animation4;
            span1[index].style.display = 'none';
            span2[index].style.display = 'none';
        }, 1100);
    }
}


function slideToNext() {
    if (messages.length > 0) {
        const span1 = document.getElementsByClassName('span1');
        const span2 = document.getElementsByClassName('span2');
        const content = document.getElementsByClassName('textarea');
        let N = (Math.floor((currentIndex+1)/4))*2+(currentIndex+1)%4-1;
        const slideInLeft = "slideInLeft 1s cubic-bezier(.6,0,.4,1)";
        const slideInRight = "slideInRight 1s cubic-bezier(.6,0,.4,1)";
        const slideOutLeft = "slideOutLeft 1s cubic-bezier(.6,0,.4,1)";
        const slideOutRight = "slideOutRight 1s cubic-bezier(.6,0,.4,1)";
        let inAnimations = ["scaleIn2","scaleIn","bounceInLeft","flipInX"];
        let outAnimations = ["scaleOut2","scaleOut","bounceOutRight","flipOutX"];
        let r = Math.random();
        const randomIndex = Math.floor(r * inAnimations.length);
        const inAnimation = inAnimations[randomIndex]+" 1s cubic-bezier(.6,0,.4,1)";
        const outAnimation = outAnimations[randomIndex]+" 1s cubic-bezier(.6,0,.4,1)";
        if (N == 0){
            animateSpans(N, slideOutRight, slideOutLeft);
        }
        else if (N < 0 || N >= content.length){
            
        }
        else{
            content[N].style.display = 'none';
            span1[N].style.display = 'flex';
            span2[N].style.display = 'flex';
            setTimeout(function () {
                content[N].style.display = 'flex';
                span1[N].style.display = 'none';
                span2[N].style.display = 'none';
            }, 1100);
        }

        currentIndex = (currentIndex + 1) % messages.length;
        N = (Math.floor((currentIndex+1)/4))*2+(currentIndex+1)%4-1;
        const translateY = -currentIndex * 1024;
        marqueeContent.style.transform = `translateY(${translateY}px)`;
        if (N < 0 || N >= content.length) {
            return; // 直接結束函式，不執行任何動畫
        }
        else {
            animateSpans(N, inAnimation, inAnimation, outAnimation, outAnimation);
        }
    }
}
// 初始化跑馬燈內容
updateMarquee();

// 每 5 秒切換一次消息
setInterval(function(){
    
    if(marquee_editing == false && marquee_img_editing == false && isLooking == true){
        slideToNext();
    }
}, 3000);


// 處理檔案讀取
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // 將檔案內容按行分割，排除空行並附加到 messages 中
            const newMessages = e.target.result.split('\n').filter(line => line.trim() !== '');
            messages = messages.concat(newMessages); // 保留原本訊息，附加新內容
            updateMarquee(); // 更新跑馬燈內容
        };
        reader.readAsText(file);
    }
});

let timer;
let touchStartTime;
var marquee_img_editing = false;


function imgTouchStart(x) {
    x.style.scale = '0.95';
    x.style.borderRadius = '20px';
    touchStartTime = Date.now();
    marquee_img_editing = true;
    timer = setTimeout(() => {
        // 長按超過 1 秒後顯示選單
        showMenu(x);
        marquee_img_editing = true;

    }, 1000); 
}

function imgTouchMove(x) {
    clearTimeout(timer);
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    if (touchDuration < 1000) {
        x.style.scale = '0.95';
        x.style.borderRadius = '20px';
        marquee_img_editing = false;
    }
}

function imgTouchEnd(x) {
    
    clearTimeout(timer);
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    if (touchDuration < 1000) {
        x.style.scale = '1';
        x.style.borderRadius = '0px';
        marquee_img_editing = false;
    }
}

const marqueeContainer = this.document.getElementsByClassName('marquee-container');


function showMenu(x) {
    marquee_img_editing = true;
    x.style.scale = '0.57';
    x.style.transform = "translateY(-200px)";
    const BG = document.createElement('div');
    BG.classList.add('imgEditorBG');
    marqueeContainer[0].appendChild(BG);
    BG.oncontextmenu = () => {return false};
    const section1 = document.createElement('div');
    section1.classList.add('section1');
    BG.appendChild(section1);
    section1.oncontextmenu = () => {return false};
    const imgA = document.createElement('img');
    imgA.classList.add('imgA');
    imgA.src = x.src;
    section1.appendChild(imgA);
    imgA.oncontextmenu = () => {return false};
    const section2 = document.createElement('div');
    section2.classList.add('section2');
    BG.appendChild(section2);
    section2.oncontextmenu = () => {return false};
    const btn1 = document.createElement('label');
    btn1.classList.add('btn');
    btn1.id = 'btn1';
    section2.appendChild(btn1);
    btn1.oncontextmenu = () => {return false};
    btn1.textContent = "從裝置中上傳";
    btn1.onclick = () => {changeImgFromDevice(x,btn1)};
    const icon1 = document.createElement('img');
    icon1.src = '../data/icon/dark/upload.svg';
    icon1.classList.add('icon');
    btn1.appendChild(icon1);
    const btn2 = document.createElement('button');
    btn2.classList.add('btn');
    section2.appendChild(btn2);
    btn2.oncontextmenu = () => {return false};
    btn2.id = 'btn2';
    btn2.textContent = "從已匯入清單中選擇";
    btn2.onclick = () => {showImageList(x)};
    const icon2 = document.createElement('img');
    icon2.src = '../data/icon/dark/list.svg';
    icon2.classList.add('icon');
    btn2.appendChild(icon2);
    const btn3 = document.createElement('button');
    btn3.classList.add('btn');
    section2.appendChild(btn3);
    btn3.id = 'btn3';
    btn3.oncontextmenu = () => {return false};
    btn3.textContent = "重設為預設照片";
    btn3.onclick = () => {previewImg("Default", x, null);};
    const icon3 = document.createElement('img');
    icon3.src = '../data/icon/dark/back.svg';
    icon3.classList.add('icon');
    btn3.appendChild(icon3);
    const btn4 = document.createElement('button');
    btn4.classList.add('btn');
    btn4.id = 'btn4';
    section2.appendChild(btn4);
    btn4.textContent = "關閉";
    btn4.oncontextmenu = () => {return false};
    btn4.onclick = () => {closeMenu(BG,x,section1,section2)};
    const icon4 = document.createElement('img');
    icon4.src = '../data/icon/close.svg';
    icon4.classList.add('icon');
    btn4.appendChild(icon4);
}

function changeImgFromDevice(x,y) {
    const imgInput = document.createElement('input');
    imgInput.type = "file";
    imgInput.accept = "image/*";
    imgInput.id = "imgInput";
    imgInput.style.display = 'none';
    y.appendChild(imgInput);
    imgInput.onchange = () => {uploadImgFromDevice(imgInput, x)};
}
async function uploadImgFromDevice (imgInput, x) {
    const file = imgInput.files[0];
    if(!file){
        alert('請選擇圖片');
        return;
    }
    const formData = new FormData();
    formData.append('image', file);
    fetch('/uploadFromDevice', { // 後端上傳路徑
            method: 'POST',
            body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('圖片上傳成功');
            const imgName = data.filename;
            previewImg(imgName, x, imgName);

        } else {
            alert('圖片上傳失敗：' + data.message);
        }
        })
    .catch(error => {
        console.error('上傳錯誤:', error);
        alert('上傳過程中發生錯誤');
    });
}
async function saveImgIndex(imgName, x) {
    try {
        // 1. 取得現有資料
        const responseGet = await fetch('/get-image-data');
        if (!responseGet.ok) {
            throw new Error(`HTTP error! status: ${responseGet.status}`);
        }
        const text = await responseGet.text();
        const lines = text.split('\n');
        const index = (parseInt(iframeId)-1)*imgLen + parseInt(x.id.split('-')[1]);
        let updatedText;

        // 2. 判斷是否需要新增行
        if (index >= lines.length) {
            //新增多行以補齊index的差距，並在最後一行新增預設值
            const diff = index - lines.length + 1;
            for (let i = 0; i < diff - 1; i++){
              lines.push(""); // 補空行
            } // 更新 text 變數
          } else {
              lines[index] = `${parseInt(iframeId)}/${imgName}`;
              updatedText = lines.join('\n'); // 更新 text 變數
          }
          
  

        // 3. 將修改後的資料傳送到伺服器
        const responsePost = await fetch('/save-image-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: updatedText }),
        });

        if (!responsePost.ok) {
            throw new Error(`HTTP error! status: ${responsePost.status}`);
        }
        updateImg(x);
        const result = await responsePost.text();
        console.log(result); // 顯示伺服器回覆
    } catch (error) {
        console.error("Error updating file:", error);
    }
}

async function updateImg(x) {
    try {
        const response = await fetch('../data/marquee_img_index.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const index = (parseInt(iframeId)-1)*imgLen + parseInt(x.id.split('-')[1]);
        images = images.concat(lines);
        if (index < lines.length){
            let img = images[index];
            if (img.startsWith(iframeId)){
                img = img.split('/')[1];
                if (img.startsWith("Default")) {
                    x.src = DefaultImg;
                }
                else {
                    x.src = '../data/marquee_img_input/'+img;
                }
            }
            else {
                x.src = DefaultImg;
            }
        }
        else {
            x.src = DefaultImg;
        }
    } catch (error) {
        console.error("Error updating file:", error);
    }
}

async function showImageList(x) {
    try {
        const response = await fetch('/get-image-list');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const imageList = data.images;

        const BG = document.createElement('div');
        BG.classList.add('imgListBG');
        marqueeContainer[0].appendChild(BG);
        const section1 = document.createElement('section');
        section1.classList.add('section1');
        BG.appendChild(section1);
        const section1Title = document.createElement('div');
        section1Title.classList.add('title');
        section1Title.textContent = "請選擇以下照片來更換";
        section1.appendChild(section1Title);
        const section1Content = document.createElement('div');
        section1Content.classList.add('content');
        section1.appendChild(section1Content);
        const subtitle1 = document.createElement('div');
        subtitle1.classList.add('subtitle');
        subtitle1.textContent = "　已匯入圖檔";
        section1Content.appendChild(subtitle1);
        const listContainer = document.createElement('section');
        listContainer.classList.add('imageListContainer');
        listContainer.style.overflow = "hidden"; 
        section1Content.appendChild(listContainer);
        if (!imageList || imageList.length === 0) {
            const subtitle2 = document.createElement('div');
            subtitle2.classList.add('subtitle');
            subtitle2.id = 'subtitle2';
            subtitle2.textContent = "沒有已匯入的照片";
            section1Content.appendChild(subtitle2);
        }
        else
        {
            imageList.forEach(async (imageName, n ) => {
                const imageItem = document.createElement('button');
                listContainer.appendChild(imageItem);
                imageItem.textContent = imageName;
                imageItem.classList.add('imgItem');
                if (n == 0){
                    imageItem.style.borderTopLeftRadius = '30px';
                    imageItem.style.borderTopRightRadius = '30px';
                }
                if( n == imageList.length-1){
                    imageItem.style.borderBottomRightRadius = '30px';
                    imageItem.style.borderBottomLeftRadius = '30px';
                }
                const imgIcon = document.createElement('img');
                imgIcon.src = '../data/marquee_img_input/'+imageName;
                imgIcon.classList.add('imgIcon');
                const imgInfo = document.createElement('span');
                imgInfo.classList.add('imgInfo');
                const options = {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  };

                fetchImageInfo(imageName)
                    .then(data => {
                        imgInfo.textContent = `${Math.floor(data.size / 1024)} KB | ${new Date(data.createdDate).toLocaleDateString('zh-TW', options)}`;
                    })
                    .catch(error => {
                        console.error('Error fetching image info:', error);
                        imgInfo.textContent = '無法取得檔案資訊';
                });
                imageItem.appendChild(imgIcon);
                imageItem.appendChild(imgInfo);
                imageItem.onclick = () => {
                    const imgName = imageName;
                    previewImg(imgName, x, null);
                };
            });
        }
        const subtitle3 = document.createElement('div');
        subtitle3.classList.add('subtitle');
        subtitle3.textContent = "　更多選項";
        section1Content.appendChild(subtitle3);
        const listContainer2 = document.createElement('section');
        listContainer2.classList.add('imageListContainer');
        listContainer2.style.overflow = "hidden"; 
        listContainer2.id = 'imageListContainer2';
        section1Content.appendChild(listContainer2);
        const btn1 = document.createElement('label');
        listContainer2.appendChild(btn1);
        btn1.textContent = "從裝置中上傳";
        btn1.classList.add('imgItem');
        btn1.id = 'preViewBtn1';
        btn1.style.borderTopLeftRadius = '30px';
        btn1.style.borderTopRightRadius = '30px';
        btn1.style.width = '590px';
        btn1.onclick = () => {changeImgFromDevice(x,btn1); };
        const icon1 = document.createElement('img');
        icon1.src = '../data/icon/dark/upload.svg';
        icon1.classList.add('imgIcon2');
        btn1.appendChild(icon1);
        const btn2 = document.createElement('button');
        listContainer2.appendChild(btn2);
        btn2.textContent = "重設為預設圖片";
        btn2.classList.add('imgItem');
        btn2.onclick = () => {previewImg("Default", x, null);};
        const icon2 = document.createElement('img');
        icon2.src = '../data/icon/dark/back.svg';
        icon2.classList.add('imgIcon2');
        btn2.appendChild(icon2);
        const btn3 = document.createElement('button');
        listContainer2.appendChild(btn3);
        btn3.textContent = "關閉選單";
        btn3.style.color = '#f4442e';
        btn3.classList.add('imgItem');
        btn3.style.borderBottomLeftRadius = '30px';
        btn3.style.borderBottomRightRadius = '30px';
        btn3.onclick = () => {closeImageList(BG, section1);};
        const icon3 = document.createElement('img');
        icon3.src = '../data/icon/close.svg';
        icon3.classList.add('imgIcon2');
        btn3.appendChild(icon3);
    } catch (error) {
        console.error('Error fetching image list:', error);
        alert('無法取得圖片列表。');
    }
}

async function fetchImageInfo(imageName) {
    const response = await fetch(`/getImageInfo?imageName=${imageName}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  }

function previewImg(imgName, x, y){
    const preViewBG = document.createElement('div');
    preViewBG.classList.add('imgListBG');
    marqueeContainer[0].appendChild(preViewBG);
    const preViewSection1 = document.createElement('section');
    preViewSection1.classList.add('preViewSection1', 'section1');
    preViewBG.appendChild(preViewSection1);
    const section1Title = document.createElement('div');
    section1Title.classList.add('title');
    section1Title.textContent = "更換照片？";
    preViewSection1.appendChild(section1Title);
    const preViewImg = document.createElement('img');
    preViewImg.classList.add('preViewImg');
    if (imgName == "Default"){
        preViewImg.src = '../data/Default.jpg';
    }
    else{
        preViewImg.src = '../data/marquee_img_input/' + imgName;
    }
    preViewSection1.appendChild(preViewImg);
    const subtitle1 = document.createElement('div');
    subtitle1.classList.add('subtitle');
    if (imgName == "Default"){
        subtitle1.textContent = "是否更換為預設照片？一旦更換完畢，\n在你刷新瀏覽器時，跑馬燈中的照片將會重設回預設照片喔！";
    }
    else{
        subtitle1.textContent = "是否更換為當前照片？一旦更換完畢，\n在你刷新瀏覽器時，跑馬燈中的照片也會隨之更換喔！";
    }
    preViewSection1.appendChild(subtitle1);
    const preViewBtns = document.createElement('div');
    preViewBtns.classList.add('preViewBtns');
    preViewSection1.appendChild(preViewBtns);
    const btn1 = document.createElement('button');
    btn1.classList.add('preViewBtn1');
    btn1.textContent = "取消";
    btn1.style.color = '#f4442e';
    preViewBtns.appendChild(btn1);
    if (y != null){
        btn1.onclick = () => {closeImageList(preViewBG, preViewSection1); deleteUploadedImage(y)};
    }
    else{
        btn1.onclick = () => {closeImageList(preViewBG, preViewSection1);};
    }
    const btn2 = document.createElement('button');
    btn2.classList.add('preViewBtn2');
    btn2.textContent = "更換";
    preViewBtns.appendChild(btn2);
    btn2.onclick = () => {alert('已成功更換照片！請重新刷新瀏覽器！'); closeImageList(preViewBG, preViewSection1); saveImgIndex(imgName, x); };
}

async function deleteUploadedImage(imgName) {
    try {
        const encodedFilename = encodeURIComponent(imgName); // URL 編碼
        const response = await fetch(`/deleteImage/${encodedFilename}`, {
            method: 'DELETE',
        });
      if (!response.ok) {
        throw new Error('刪除圖片失敗');
      }
  
      // 檢查伺服器端回傳的資訊 (例如 response.json())
      const data = await response.json();
      if (data.success) {
        console.log('圖片已成功刪除');
      } else {
        console.error('上傳失敗，無法刪除圖片:', data.message);
      }
    } catch (error) {
      console.error('刪除圖片失敗:', error);
    }
  }


function closeImageList(BG , section1) {
    BG.style.animation = 'opticityOut 0.3s cubic-bezier(.6,0,.4,1)';
    section1.style.animation = 'scaleOut 0.3s cubic-bezier(.6,0,.4,1)';
    setTimeout(function(){BG.remove();},300);
}

function closeMenu(x,y,a,b){
    x.style.animation = 'opticityOut 0.3s cubic-bezier(.6,0,.4,1)';
    setTimeout(function(){x.parentNode.removeChild(x)},300);
    y.style.scale = '1';
    y.style.borderRadius = '0px';
    y.style.transform = "translateY(0px)";
    marquee_img_editing = false;
    a.style.animation = 'zoomOut 0.3s cubic-bezier(.6,0,.4,1)';
    b.style.animation = 'slideOut 0.3s cubic-bezier(.6,0,.4,1)';
}

window.addEventListener('message', (event) => {
    if (event.data.isLooking !== undefined) {
      isLooking = event.data.isLooking;
      // 更新頁面，根據 isLooking 的值進行相應操作
    }
});