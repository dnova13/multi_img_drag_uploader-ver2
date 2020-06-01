/*---------------- 파일 업로드 동작 ------------------------*/

let imageBlobObj;
let formImgData = new FormData();

class ResizeFile {

    constructor(file, imgUrl) {
        this.file = file;
        this.imgUrl = imgUrl;
    }
};

let resizeFile;
let resizeFilesArray = new Array();
let chkFile = 0; // resizeFilesArray.length 길이가 0일때 0임.

const fileInput = document.getElementById('upload');
const fileDragDiv = document.getElementById("upload-wrapper");

const imageUploadPlate = document.querySelector(".upload-img");
const imageChildren = document.querySelectorAll(".upload-img-child");

const removeImgPlateBtn = document.querySelector("#removeImgBtn");
const removeImgBtnChildren = document.querySelectorAll(".removeImgBtnChild");
const removeAllBtn = document.getElementById("removeAll");

const wrapperChildDivs = document.querySelectorAll("#upload-wrapper-child");

const MAX_IMG = wrapperChildDivs.length;

/* 파일 드래그 기능 */
if (window.File && window.FileList && window.FileReader) {
    init();
}

// initialize
function init() {

    // is XHR2 available?
    let xhr = new XMLHttpRequest();
    if (xhr.upload) {

        // file drag and drop 방식
        fileDragDiv.addEventListener("dragover", fileDragHover, false);
        fileDragDiv.addEventListener("dragleave", fileDragHover, false);
        fileDragDiv.addEventListener("drop", fileSelectHandler, false);
        fileInput.addEventListener('change', fileInputHandler, false);
    }
}

// file drag hover
// 이건 파일 드래그 하는지 안하는지 구별용.
function fileDragHover(e) {

    e.stopPropagation();
    e.preventDefault();

    // 드래그 하는 건지, 마우스를 거기에 걍 갖다대는 건지 구별.
    let isHover = e.target.className = (e.type === "dragover" ? true : false);

    console.log("dragClassName : " + e.target.className);

    if (isHover) {
        fileDragDiv.style.color = "#f00";
        fileDragDiv.style.borderColor = "#f00";
        fileDragDiv.style.borderStyle = "solid";
        fileDragDiv.style.boxShadow = "inset 0 3px 4px #888";
    }
    else {
        fileDragDiv.style.color = "";
        fileDragDiv.style.borderColor = "";
        fileDragDiv.style.borderStyle = "";
        fileDragDiv.style.boxShadow = "";
    }
}

// file selection
function fileSelectHandler(e) {

    e.preventDefault();
    console.log("fileSelectHandeler");

    // cancel event and hover styling
    fileDragHover(e);

    // 리사이징한 이미지 미리보기
    load_image(e);
}

// 파일 input 이벤트 동작
function fileInputHandler(e) {

    e.preventDefault();
    console.log("inputImage")

    // 리사이징한 이미지 미리보기
    load_image(e);
}


removeImgPlateBtn.addEventListener('click', (e) => {

    e.preventDefault();

    console.log("removePlate");

    let index = imageUploadPlate.getAttribute('alt');

    if (index === null) {
        resizeFilesArray.splice(resizeFilesArray.length - 1, 1);
    }
    else {
        resizeFilesArray.splice(index, 1);
    }
    settingImg(resizeFilesArray);

    console.log(resizeFilesArray);
});

removeImgBtnChildren.forEach((removeChild, index) => {

    removeChild.addEventListener('click', e => {

        e.preventDefault();
        console.log("removeImg " + index);

        if (resizeFilesArray.length - 1 >= index) {

            resizeFilesArray.splice(index, 1);
            settingImg(resizeFilesArray);

            console.log(resizeFilesArray);
        }
    })
});

removeAllBtn.addEventListener('click', e => {

    e.preventDefault();

    console.log("removeAll");

    resizeFilesArray = new Array();
    resetImg();

    console.log(resizeFilesArray);
    chkFile = 0;
});

wrapperChildDivs.forEach((wrapperChild, index) => {

    wrapperChild.addEventListener('click', e => {

        e.preventDefault();

        if (resizeFilesArray.length - 1 >= index) {

            for (let i = 0; i < wrapperChildDivs.length; i++) {
                wrapperChildDivs[i].style.borderColor = "black";
            }

            e.target.style.borderColor = "red";

            imageUploadPlate.setAttribute('src', resizeFilesArray[index].imgUrl);
            imageUploadPlate.setAttribute('alt', index);
        }
    })
});


// 이미지 구별
// ps 사실 이거 없어도 됨.
// loadimg에서 이미지 아닌거 걸러내고 img 파일만 리스트에 넣어줌
const isImage = (_files) => {

    let _filesArr = Array.prototype.slice.call(_files);
    let chkExt = true;

    console.log(_filesArr);

    _filesArr.forEach(file => {

        let fileName = file.name;
        let ext = fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase();

        if (ext !== "jpg" && ext !== "png" && ext !== "jpeg") {
            console.log("확장자 아님");
            chkExt = false;
            return;
        }
    });

    return chkExt;
}

// 이미지를 불러옴
const load_image = (e) => {

    // 이미지 파일들 넣음
    let files = e.target.files || e.dataTransfer.files;

    console.log("isImg? " + isImage(files));

    if (!isImage(files)) {

        chkFile = 0;
        alert("이미지 파일 (.jpg, .jpeg, .png)만 업로드 가능합니다.");
    }

    else {
        chkFile = 1;

        console.log("files from load_img " + files);

        // 여러장의 이미지를 불러와 배열화
        const filesArr = Array.prototype.slice.call(files);

        if (filesArr.length > MAX_IMG - resizeFilesArray.length) {
            alert("개수 초과 8개만 올리세요.");
        }

        else {

            filesArr.forEach((file, i) => {

                const reader = new FileReader();

                // 비동기
                reader.onload = e => {

                    const image = new Image();
                    image.className = "img-item"; // 스타일 적용을 위해
                    image.src = e.target.result;

                    // 비동기
                    image.onload = imageEvent => {
                        // 이미지가 로드가 되면! 리사이즈 함수가 실행되도록 합니다.
                        resize_image(image, file.name, i, filesArr.length);
                    }
                }
                reader.readAsDataURL(file);
            });

            // TODO : 콜백처리 이게 젤 문제
            // settingImg(resizeFilesArray);
            console.log(resizeFilesArray);
        }
    }
};

const resetImg = () => {

    imageUploadPlate.setAttribute('src', "upload.svg");
    imageUploadPlate.style.opacity = 0.2;
    imageUploadPlate.style.width = "200px";
    imageUploadPlate.style.height = "150px";

    imageChildren.forEach(imageChild => {

        imageChild.removeAttribute('src');
        imageChild.style.display = "contents";
    });
}

const settingImg = (resizeFilesArray) => {

    console.log("setting");

    resetImg();

    for (let i = 0; i < resizeFilesArray.length; i++) {

        if (i === resizeFilesArray.length - 1) {
            imageUploadPlate.setAttribute('src', resizeFilesArray[resizeFilesArray.length - 1].imgUrl);
            imageUploadPlate.setAttribute('alt', i);
            imageUploadPlate.style.opacity = 1;
            imageUploadPlate.style.width = "270px";
            imageUploadPlate.style.height = "230px";
        }

        imageChildren[i].setAttribute('src', resizeFilesArray[i].imgUrl);
        imageChildren[i].style.display = "block"
    }
}

const resize_image = (image, fileName, index, fileLength) => {

    console.log("resize");

    let canvas = document.createElement("canvas")

    let width = 500,
        height = 400;

    /* let imgRatio = imageRatioControl(image);
    console.log(imgRatio); */

    // 그림 그리는 그림을 보여주는 캔버스 크기를 조정. 이미지 크기는 조절 x
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);

    // 이미지 포맷 설정.
    // const dataUrl = canvas.toDataURL("image/jpeg");
    const dataUrl = canvas.toDataURL(); // 공백시 원래 이미지 포맷 따라감.
    imageBlobObj = dataURLToBlob(dataUrl);

    // 이미지 bolb 객체화
    // console.log(imageBlobObj);
    resizeFile = new ResizeFile(new File([imageBlobObj], fileName, {
        type: imageBlobObj.type
    }), dataUrl);

    // 다시 파일로 옮김.
    resizeFilesArray.push(resizeFile);

    if (fileLength - 1 === index) settingImg(resizeFilesArray);
};

// 이미지 비율 조정
let imageRatioControl = (_image) => {

    // 최대 사이즈
    const _max_size = 1280

    let _width = _image.width,
        _height = _image.height;


    if (_width > _height) {
        if (_width > _max_size) {
            _height *= _max_size / _width;
            _width = _max_size;
        }
    } else {
        if (_height > _max_size) {
            _width *= _max_size / _height;
            _height = _max_size;
        }
    }

    return {
        width: _width,
        height: _height
    }
}

const dataURLToBlob = dataURL => {

    const BASE64_MARKER = ";base64,";

    // base64로 인코딩 되어있지 않을 경우
    if (dataURL.indexOf(BASE64_MARKER) === -1) {

        const parts = dataURL.split(",");
        const contentType = parts[0].split(":")[1];
        const raw = parts[1];

        return new Blob([raw], {
            type: contentType
        });
    }

    // base64로 인코딩 된 이진데이터일 경우
    const parts = dataURL.split(BASE64_MARKER);
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);

    // atob()는 Base64를 디코딩하는 메서드
    const rawLength = raw.length;

    // 부호 없는 1byte 정수 배열을 생성
    const uInt8Array = new Uint8Array(rawLength); // 길이만 지정된 배열
    let i = 0;
    while (i < rawLength) {
        uInt8Array[i] = raw.charCodeAt(i);
        i++;
    }

    return new Blob([uInt8Array], {
        type: contentType
    });
}