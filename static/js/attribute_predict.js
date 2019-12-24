import {Spinner} from '/static/js/spin.js';

$(function () {
    $(document).ready(function () {
        // var spinner = new Spinner().spin();
        // $('body').append(spinner.el);
        $('body').append("<div style='display:none;width:100%; margin:0 auto;position:fixed;left:0;top:0;bottom: 0;z-index: 111;opacity: 0.5;'id='loading'><a class='mui-active' style='left: 50%;position: absolute;top:50%'><span class='mui-spinner'></span><p style='margin-left: -10px;'></p></a></div>")
        var opts = {
            lines: 13, // The number of lines to draw
            length: 38, // The length of each line
            width: 17, // The line thickness
            radius: 45, // The radius of the inner circle
            scale: 1, // Scales overall size of the spinner
            corners: 1, // Corner roundness (0..1)
            color: '#0090ff', // CSS color or array of colors
            fadeColor: 'transparent', // CSS color or array of colors
            speed: 1, // Rounds per second
            rotate: 0, // The rotation offset
            animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
            direction: 1, // 1: clockwise, -1: counterclockwise
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            className: 'spinner', // The CSS class to assign to the spinner
            top: '50%', // Top position relative to parent
            left: '50%', // Left position relative to parent
            shadow: '0 0 1px transparent', // Box-shadow for the lines
            position: 'absolute' // Element positioning
        };
        var target = document.getElementById('loading');
        var spinner = new Spinner(opts).spin(target);
    });
    $(document).ajaxStart(function () {
        $("#loading").show();
    });
    $(document).ajaxComplete(function () {
        $("#loading").hide();
    });
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    var globalurl = window.location.href;

    function getBase64Image(img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
        var dataURL = canvas.toDataURL("image/" + ext);
        return dataURL;
    }

    /************************图片切换************************/
    $(".swiper-container ul li").click(function () {
        var imgUrl = $(this).children("img").attr("src");

        $(".cover").css("background", "rgba(0,0,0,0.8)");
        $(".cover").css("border", "none");
        $(this).children(".cover").css("background", "rgba(0,0,0,0)");
        $(this).children(".cover").css("border", "2px solid #00b2e0");
        $(".face-top").empty();
        $(".face-top").append("<img src='' alt='点击一张示例图片'>");
        $(".face-top").children("img").attr("src", imgUrl);
        var zhixing = true;
        $(".face-top").children("img")[0].onload = function () {
            var img = $(".face-top").children("img")[0];
            var base64img = getBase64Image(img);
            if (zhixing) {
                $.ajax({
                    url: globalurl,
                    method: "POST",
                    data: {
                        base64: base64img,
                    },
                    success: function (data) {
                        zhixing = false;
                        var face_number = data.faces.length;
                        $(".infor").css("display", "none");
                        $(".infor_message").css("display", "block");
                        $(".infor_message").empty();
                        var message = "<p>已检测到图中 " + face_number + " 张人脸，点击人脸图片查看结果信息。您可将以上信息传给其他API进行后续处理和分析。推荐使用人脸属性和人脸关键点API。</p>";
                        $(".infor_message").append(message);
                        sessionStorage.setItem("faceapi", JSON.stringify(data));
                        $(".face-top").empty();
                        $(".face-top").append("<img src='' alt='点击一张示例图片'>");
                        $(".face-top").children("img").attr("src", imgUrl);
                        $(".demo-container").children("ul").empty();
                        $(".faceapi").html(JSON.stringify(data));
                        data.faces.forEach(function (value, index, array) {
                            var bbox = value.bounding_boxes;
                            $(".demo-container").children("ul").append("<li><canvas id=" + "canvas" + index + " width=100px height=100px></canvas></li>");
                            var canvas2 = document.getElementById("canvas" + index);
                            var context2 = canvas2.getContext('2d');
                            context2.drawImage(img, bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1, 0, 0, 100, 100)
                        })
                    }
                });
            }
        }

        /*******************图片滑动***************************/

        $(".next").attr('disabled', true);
        $(".pre").click(function () {
            $(".next").attr('disabled', false);
            var ulLeft = $(".swiper-container ul").position().left;
            if (ulLeft > -110) {
                $(this).attr('disabled', true);
            }
            $(".swiper-container ul").animate({
                left: "-110px",
                during: "1s"
            })
        });
        $(".next").click(function () {
            $(".pre").attr('disabled', false);
            var ulLeft = $(".swiper-container ul").position().left;
            if (ulLeft < 110) {
                $(this).attr('disabled', true);
            }
            $(".swiper-container ul").animate({
                left: "0px",
                during: "1s"
            })
        });

        /***************************选项卡切换****************************/

        $(".result").click(function () {
            $(".response").css({"color": "#000", "background": "#f6f7fb"});
            $(this).css({"color": "#00b2e0", "background": "none"});
            $(".response-content").css("display", "none");
            $(".result-content").css("display", "block");
        });
        $(".response").click(function () {
            $(".result").css({"color": "#000", "background": "#f6f7fb"});
            $(this).css({"color": "#00b2e0", "background": "none"})
            $(".result-content").css("display", "none");
            $(".response-content").css("display", "block");
        })
    });

    $(document).on('click', '.demo-container ul li canvas', function () {
        $(".infor").css("display", "block");
        $(".infor_message").css("display", "none");
        var img = $(this)[0];
        var canvasidd = $(this).attr("id")
        if (canvasidd == "topcanvas") {
            $(".face-top").empty();
            var faceapi = JSON.parse(sessionStorage.getItem("faceapi"));
            var b64img = faceapi.b64_img;
            $(".face-top").append("<li><img id=face_top src=" + b64img + " width=484px height=484px></img></li>")

        } else {
            var id_canvas = Number($(this).attr("id").replace("canvas", ""));
            var faceapi = JSON.parse(sessionStorage.getItem("faceapi"));
            var confidence = faceapi.faces[id_canvas].confidence;
            var bbox = faceapi.faces[id_canvas].bounding_boxes;
            var kpoint = faceapi.faces[id_canvas].kpoint;
            $(".confidencevalue").html(confidence);
            $(".bboxvalue").text("left:" + bbox.x1 + "\n" + "top:" + bbox.y1 + "\n" + "width:" + (bbox.x2 - bbox.x1) + "\n" + "height:" + (bbox.y2 - bbox.y1) + "\n");
            $(".agevalue").text(Math.round(faceapi.faces[id_canvas].ap_value.age));
            $(".beautyvalue").text(Math.round(faceapi.faces[id_canvas].ap_value.beauty));
            $(".blurnessvalue").text(Math.round(faceapi.faces[id_canvas].ap_value.blurness));
            $(".angervalue").text(Math.round(faceapi.faces[id_canvas].ap_value.anger));
            $(".disgustvalue").text(Math.round(faceapi.faces[id_canvas].ap_value.disgust));
            $(".fearvalue").text(Math.round(faceapi.faces[id_canvas].ap_value.fear));
            $(".happinessvalue").text(Math.round(faceapi.faces[id_canvas].ap_value.happiness));
            $(".neutralvalue").text(Math.round(faceapi.faces[id_canvas].ap_value.neutral));
            $(".sadnessvalue").text(Math.round(faceapi.faces[id_canvas].ap_value.sadness));
            $(".surprisevalue").text(Math.round(faceapi.faces[id_canvas].ap_value.surprise));
            $(".pitchvalue").text(Math.round(faceapi.faces[id_canvas].ap_value.pitch));
            $(".rollvalue").text(Math.round(faceapi.faces[id_canvas].ap_value.roll));
            $(".yawvalue").text(Math.round(faceapi.faces[id_canvas].ap_value.yaw));
            $(".mouth_openvalue").text(Math.round(faceapi.faces[id_canvas].ap_value.mouth_open));
            $(".smilevalue").text(Math.round(faceapi.faces[id_canvas].ap_value.smile));
            /************************画关键点************************/
            $(".face-top").empty();
            $(".face-top").append("<li><canvas id=face_top width=484px height=484px></canvas></li>")
            var canvas3 = document.getElementById("face_top");
            var context3 = canvas3.getContext('2d');
            context3.drawImage(img, 0, 0, 100, 100, 142, 142, 200, 200)
            var hscale = 100 / (bbox.y2 - bbox.y1) * 2
            var wscale = 100 / (bbox.x2 - bbox.x1) * 2
            for (var i = 0; i < kpoint.length; i++) {
                context3.beginPath();
                context3.arc((kpoint[i][0] - bbox.x1) * wscale + 142, (kpoint[i][1] - bbox.y1) * hscale + 142, 1, 0, 2 * Math.PI);
                context3.fillStyle = "red";
                context3.fill();
                context3.stroke();
            }
        }
    })

    $("#file").change(function (e) {
        $(".cover").css({"background": "rgba(0,0,0,0.8)", "border": "none"});
        var src = window.URL.createObjectURL($("#file")[0].files[0]);
        $(".face-top").empty();
        $(".face-top").append("<img src='' alt='点击一张示例图片'>")
        $(".face-top").children("img").attr("src", src);
        var zhixing = true;
        $(".face-top").children("img")[0].onload = function () {
            if (zhixing) {
                var base64img = getBase64Image($(".face-top").children("img")[0]);
                var img = $(".face-top").children("img")[0];
                var formData = new FormData();
                formData.append("base64", base64img);
                $.ajax({
                    url: globalurl,
                    method: "POST",
                    cache: false,
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (data) {
                        zhixing = false;
                        var face_number = data.faces.length;
                        $(".infor").css("display", "none");
                        $(".infor_message").css("display", "block");
                        $(".infor_message").empty();
                        var message = "<p>已检测到图中 " + face_number + " 张人脸，点击人脸图片查看结果信息。您可将以上信息传给其他API进行后续处理和分析。推荐使用人脸属性和人脸关键点API。</p>";
                        $(".infor_message").append(message);
                        sessionStorage.setItem("faceapi", JSON.stringify(data));
                        $(".demo-container").children("ul").empty();
                        $(".faceapi").html(JSON.stringify(data));
                        $(".confidencevalue").html("");
                        $(".bboxvalue").text("");
                        $(".kpointvalue").text("");
                        data.faces.forEach(function (value, index, array) {
                            var bbox = value.bounding_boxes;
                            $(".demo-container").children("ul").append("<li><canvas id=" + "canvas" + index + " width=100px height=100px></canvas></li>");
                            var canvas2 = document.getElementById("canvas" + index);
                            var context2 = canvas2.getContext('2d');
                            context2.drawImage(img, bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1, 0, 0, 100, 100)
                        })

                    }
                })
            }
        }
    });


    $("#camera_button").click(function (e) {
        $(".cover").css({"background": "rgba(0,0,0,0.8)", "border": "none"});

        function getMedia() {
            if (navigator.getUserMedia) {
                navigator.getUserMedia({
                    'video': true,
                }, successFunc, errorFunc);    //success是获取成功的回调函数
            } else {
                alert('Native device media streaming (getUserMedia) not supported in this browser.');
            }
        }

        function successFunc(stream) {
            //alert('Succeed to get media!');
            $(".camera").children("span").text("拍照检测");
            if (video.mozSrcObject !== undefined) {
                //Firefox中，video.mozSrcObject最初为null，而不是未定义的，我们可以靠这个来检测Firefox的支持
                video.mozSrcObject = stream;
            } else {
                video.srcObject = stream;
                // video.src = window.URL && window.URL.createObjectURL(stream) || stream;
            }
        }

        function errorFunc(e) {
            alert('Error！' + e);
        }

        if ($(".camera").children("span")[0].innerText == "摄像头") {
            $(".face-top").empty()
            $(".face-top").append(" <video muted height=482px width=482px autoplay=\"autoplay\"></video>");
            var video = document.querySelector('video');
            getMedia()
        } else {
            var video = document.querySelector('video');
            var canvas = document.createElement("canvas");
            canvas.width = 482;
            canvas.height = 482;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            var img = document.createElement("img");
            img.src = canvas.toDataURL('image/png');
            img.height = 482;
            img.width = 482;
            $(".face-top").empty();
            $(".face-top").append(img);
            var formData = new FormData();
            formData.append("base64", img.src);
            $.ajax({
                url: globalurl,
                method: "POST",
                cache: false,
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    var face_number = data.faces.length;
                    $(".infor").css("display", "none");
                    $(".infor_message").css("display", "block");
                    $(".infor_message").empty();
                    var message = "<p>已检测到图中 " + face_number + " 张人脸，点击人脸图片查看结果信息。您可将以上信息传给其他API进行后续处理和分析。推荐使用人脸属性和人脸关键点API。</p>";
                    $(".infor_message").append(message);
                    sessionStorage.setItem("faceapi", JSON.stringify(data));
                    $(".demo-container").children("ul").empty();
                    $(".faceapi").html(JSON.stringify(data));
                    $(".confidencevalue").html("");
                    $(".bboxvalue").text("");
                    $(".kpointvalue").text("");
                    data.faces.forEach(function (value, index, array) {
                        var bbox = value.bounding_boxes;
                        $(".demo-container").children("ul").append("<li><canvas id=" + "canvas" + index + " width=100px height=100px></canvas></li>");
                        var canvas2 = document.getElementById("canvas" + index);
                        var context2 = canvas2.getContext('2d');
                        context2.drawImage(img, bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1, 0, 0, 100, 100)
                    });
                    $(".camera").children("span").text("摄像头")
                }
            })
        }
    });

    $(".submit").click(function () {
        $(".cover").css({"background": "rgba(0,0,0,0.8)", "border": "none"});
        var searchUrl = $(".imgUrl").val();
        $(".face-top").empty();
        $(".face-top").append("<img></img>");
        $(".face-top").children("img")[0].src = searchUrl;
        var zhixing = true;
        $(".face-top").children("img")[0].onload = function () {
            if (zhixing) {
                // var img = $(".face-top").children("img")[0];
                var formData = new FormData();
                formData.append("imgurl", searchUrl);
                $.ajax({
                    url: globalurl,
                    method: "POST",
                    cache: false,
                    processData: false,
                    contentType: false,
                    data: formData,
                    success: function (data) {
                        zhixing = false;
                        // $(".face-top").empty();
                        // $(".face-top").append("<img></img>");
                        // $(".face-top").children("img")[0].src = searchUrl;
                        var img = $(".face-top").children("img")[0];
                        var face_number = data.faces.length;
                        $(".infor").css("display", "none");
                        $(".infor_message").css("display", "block");
                        $(".infor_message").empty();
                        var message = "<p>已检测到图中 " + face_number + " 张人脸，点击人脸图片查看结果信息。您可将以上信息传给其他API进行后续处理和分析。推荐使用人脸属性和人脸关键点API。</p>";
                        $(".infor_message").append(message);
                        sessionStorage.setItem("faceapi", JSON.stringify(data));
                        $(".demo-container").children("ul").empty();
                        $(".faceapi").html(JSON.stringify(data));
                        $(".confidencevalue").html("");
                        $(".bboxvalue").text("");
                        $(".kpointvalue").text("");
                        data.faces.forEach(function (value, index, array) {
                            var bbox = value.bounding_boxes;
                            $(".demo-container").children("ul").append("<li><canvas id=" + "canvas" + index + " width=100px height=100px></canvas></li>");
                            var canvas2 = document.getElementById("canvas" + index);
                            var context2 = canvas2.getContext('2d');
                            context2.drawImage(img, bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1, 0, 0, 100, 100)
                        })
                    }
                })
            }
        }
    })
});