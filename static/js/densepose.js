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
        $(".face-top").append("<img src=/static/static_img/stback.png alt='点击一张示例图片'>");
        $(".face-top").children("img").attr("src", imgUrl);
        $.ajax({
            url: globalurl,
            method: "POST",
            data: {
                base64: getBase64Image($(".face-top").children("img")[0]),
            },
            success: function (data) {
                if (data.status) {
                    var person_number = data.res.boxes.length / 2;
                    $(".infor").css("display", "none");
                    $(".infor_message").css("display", "block");
                    $(".infor_message").empty();
                    var message = "<p>已检测到图中 " + person_number + " 个对象，点击上方图片查看结果信息。您可将以上信息传给其他API进行后续处理和分析。</p>";
                    $(".infor_message").append(message);
                    $(".demo-container").children("ul").empty();
                    $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + "_uv.png ></li>");
                    $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + ".png ></li>");
                    $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + "_INDS.png ></li>");
                    $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + "_IUV.png ></li>");
                    $(".faceapi").html(JSON.stringify(data));
                } else {
                    $(".infor").css("display", "none");
                    $(".infor_message").css("display", "block");
                    $(".infor_message").empty();
                    var message = "<p> " + data.res + " </p>";
                    $(".infor_message").append(message);
                }
            }
        });

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
        })
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
        })

        /***************************选项卡切换****************************/

        $(".result").click(function () {
            $(".response").css({"color": "#000", "background": "#f6f7fb"});
            $(this).css({"color": "#00b2e0", "background": "none"});
            $(".response-content").css("display", "none");
            $(".result-content").css("display", "block");
        })
        $(".response").click(function () {
            $(".result").css({"color": "#000", "background": "#f6f7fb"});
            $(this).css({"color": "#00b2e0", "background": "none"})
            $(".result-content").css("display", "none");
            $(".response-content").css("display", "block");
        })
    })

    $(document).on('click', '.demo-container ul li img', function () {
        $(".infor").css("display", "block");
        $(".infor_message").css("display", "none");
        var imgsrc = $(this)[0].src;
        $(".face-top").children()[0].src = imgsrc
    });

    $("#file").change(function (e) {
        var zhixing = true;
        $(".cover").css({"background": "rgba(0,0,0,0.8)", "border": "none"});
        var src = window.URL.createObjectURL($("#file")[0].files[0]);
        $(".face-top").empty();
        $(".face-top").append("<img src=/static/stback.png alt='点击一张示例图片'>")
        $(".face-top").children("img").attr("src", src);
        $(".face-top").children("img")[0].onload = function () {
            if (zhixing) {
                var base64img = getBase64Image($(".face-top").children("img")[0])
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
                        if (data.status) {
                            var person_number = data.res.boxes.length / 2;
                            $(".infor").css("display", "none");
                            $(".infor_message").css("display", "block");
                            $(".infor_message").empty();
                            var message = "<p>已检测到图中 " + person_number + " 个对象，点击上方图片查看结果信息。您可将以上信息传给其他API进行后续处理和分析。</p>";
                            $(".infor_message").append(message);
                            $(".demo-container").children("ul").empty();
                            $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + "_uv.png ></li>");
                            $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + ".png ></li>");
                            $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + "_INDS.png ></li>");
                            $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + "_IUV.png ></li>");
                            $(".faceapi").html(JSON.stringify(data));
                            zhixing = false
                        } else {
                            $(".infor").css("display", "none");
                            $(".infor_message").css("display", "block");
                            $(".infor_message").empty();
                            var message = "<p> " + data.res + " </p>";
                            $(".infor_message").append(message);
                        }
                    }
                });
            }
        };
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
            $(".camera").children("span").text("拍照检测")
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
            $(".camera").children("span").text("摄像头")
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
                    if (data.status) {
                        var person_number = data.res.boxes.length / 2;
                        $(".infor").css("display", "none");
                        $(".infor_message").css("display", "block");
                        $(".infor_message").empty();
                        var message = "<p>已检测到图中 " + person_number + " 个对象，点击上方图片查看结果信息。您可将以上信息传给其他API进行后续处理和分析。</p>";
                        $(".infor_message").append(message);
                        $(".demo-container").children("ul").empty();
                        $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + "_uv.png ></li>");
                        $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + ".png ></li>");
                        $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + "_INDS.png ></li>");
                        $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + "_IUV.png ></li>");
                        $(".faceapi").html(JSON.stringify(data));
                    } else {
                        $(".infor").css("display", "none");
                        $(".infor_message").css("display", "block");
                        $(".infor_message").empty();
                        var message = "<p> " + data.res + " </p>";
                        $(".infor_message").append(message);
                    }
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
        $(".cover").css({"background": "rgba(0,0,0,0.8)", "border": "none"});
        $(".face-top").children("img")[0].onload = function () {
            if (zhixing) {
                var formData = new FormData();
                formData.append("imgurl", searchUrl);
                $.ajax({
                    url: globalurl,
                    method: "POST",
                    cache: false,
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (data) {
                        if (data.status) {
                            var person_number = data.res.boxes.length;
                            $(".infor").css("display", "none");
                            $(".infor_message").css("display", "block");
                            $(".infor_message").empty();
                            var message = "<p>已检测到图中 " + person_number + " 个对象，点击上方图片查看结果信息。您可将以上信息传给其他API进行后续处理和分析。</p>";
                            $(".infor_message").append(message);
                            $(".demo-container").children("ul").empty();
                            $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + "_uv.png ></li>");
                            $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + ".png ></li>");
                            $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + "_INDS.png ></li>");
                            $(".demo-container").children("ul").append("<li><img src=/static/tmpimg/" + data.name + "_IUV.png ></li>");
                            $(".faceapi").html(JSON.stringify(data));
                            var zhixing = false
                        } else {
                            $(".infor").css("display", "none");
                            $(".infor_message").css("display", "block");
                            $(".infor_message").empty();
                            var message = "<p> " + data.res + " </p>";
                            $(".infor_message").append(message);
                        }
                    }
                });
            }
        };
    })
});