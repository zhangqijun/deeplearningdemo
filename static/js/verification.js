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

    function postit() {
        try {
            var base64img1 = getBase64Image($(".face-top1").children("img")[0]);
        } catch {
            var base64img1 = $(".face-top1").children("img")[0].src;
        }
        try {
            var base64img2 = getBase64Image($(".face-top2").children("img")[0]);
        } catch {
            var base64img2 = $(".face-top2").children("img")[0].src;
        }

        $.ajax({
            url: globalurl,
            method: "POST",
            data: {
                p1: base64img1,
                p2: base64img2,
            },
            success: function (data) {
                $(".infor").css("display", "block");
                sessionStorage.setItem("faceapi", JSON.stringify(data));
                $(".faceapi").html(JSON.stringify(data));
                $(".resvalue").text(data.res);
                $(".distvalue").text(data.dist);
            }
        })
    }

    function posturl() {
        var url1 = $(".face-top1").children("img")[0].src;
        var url2 = $(".face-top2").children("img")[0].src;
        $.ajax({
            url: globalurl,
            method: "POST",
            data: {
                url1: url1,
                url2: url2,
            },
            success: function (data) {
                $(".infor").css("display", "block");
                sessionStorage.setItem("faceapi", JSON.stringify(data));
                $(".faceapi").html(JSON.stringify(data));
                $(".resvalue").text(data.res);
                $(".distvalue").text(data.dist);
            }
        })
    }

    /************************图片切换************************/
    $(".face-top1").click(function () {
        $(".swiper-container2").css("display", "none");
        $(".swiper-container1").css("display", "block");
    });
    $(".face-top2").click(function () {
        $(".swiper-container1").css("display", "none");
        $(".swiper-container2").css("display", "block");
    });

    $(".swiper-container1 ul li").click(function () {
        var imgUrl1 = $(this).children("img").attr("src");
        var imgUrl2 = $(".face-top2").children("img").attr("src");
        $(".face-top1").empty();
        $(".face-top1").append("<img src='' alt='点击一张示例图片'>")
        $(".cover").css("background", "rgba(0,0,0,0.8)");
        $(".cover").css("border", "none");
        $(this).children(".cover").css("background", "rgba(0,0,0,0)");
        $(this).children(".cover").css("border", "2px solid #00b2e0");
        var img1 = $(".face-top1").children("img").attr("src", imgUrl1);
        img1[0].onload = function () {
            if ((imgUrl1 != undefined) && (imgUrl2 != undefined)) {
                postit()
            } else {
                console.log("has undefined")
            }
        };


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
            $(this).css({"color": "#00b2e0", "background": "none"});
            $(".result-content").css("display", "none");
            $(".response-content").css("display", "block");
        })
    });

    $(".swiper-container2 ul li").click(function () {
            var imgUrl2 = $(this).children("img").attr("src");
            var imgUrl1 = $(".face-top1").children("img").attr("src");
            $(".cover").css("background", "rgba(0,0,0,0.8)");
            $(".cover").css("border", "none");
            $(this).children(".cover").css("background", "rgba(0,0,0,0)");
            $(this).children(".cover").css("border", "2px solid #00b2e0");
            $(".face-top2").empty();
            $(".face-top2").append("<img src='' alt='点击一张示例图片'>");
            var img = $(".face-top2").children("img").attr("src", imgUrl2);
            // $(".face-top2").children("img").attr("src", imgUrl2);
            img[0].onload = function () {
                if ((imgUrl1 != undefined) && (imgUrl2 != undefined)) {
                    postit()
                } else {
                    console.log("has undefined")
                }
            };


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
        }
    )

    $("#file1").change(function (e) {
        $(".cover").css({"background": "rgba(0,0,0,0.8)", "border": "none"});
        var src = window.URL.createObjectURL($("#file1")[0].files[0]);
        $(".face-top1").empty();
        $(".face-top1").append("<img src='' alt='点击一张示例图片'>");
        $(".face-top1").children("img").attr("src", src);
        var imgUrl1 = $(".face-top1").children("img").attr("src");
        var imgUrl2 = $(".face-top2").children("img").attr("src");
        var img = $(".face-top1").children("img");
        img[0].onload = function () {
            if ((imgUrl1 != undefined) && (imgUrl2 != undefined)) {
                postit()
            } else {
                console.log("has undefined")
            }
        }
    });

    $("#file2").change(function (e) {
        $(".cover").css({"background": "rgba(0,0,0,0.8)", "border": "none"});
        var src = window.URL.createObjectURL($("#file2")[0].files[0]);
        $(".face-top2").empty();
        $(".face-top2").append("<img src='' alt='点击一张示例图片'>");
        $(".face-top2").children("img").attr("src", src);
        var imgUrl1 = $(".face-top1").children("img").attr("src");
        var imgUrl2 = $(".face-top2").children("img").attr("src");
        var img = $(".face-top2").children("img");
        img[0].onload = function () {
            if ((imgUrl1 != undefined) && (imgUrl2 != undefined)) {
                postit()
            } else {
                console.log("has undefined")
            }
        }
    });


    $("#camera_button1").click(function (e) {
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
            $(".camera1").children("span").text("拍照检测");
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

        if ($(".camera1").children("span")[0].innerText == "图1摄像头") {
            $(".face-top1").empty();
            $(".face-top1").append(" <video muted height=400px width=400px autoplay=\"autoplay\"></video>");
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
            $(".face-top1").empty();
            $(".face-top1").append(img);
            var imgUrl1 = $(".face-top1").children("img").attr("src");
            var imgUrl2 = $(".face-top2").children("img").attr("src");
            var img = $(".face-top1").children("img");
            img[0].onload = function () {
                if ((imgUrl1 != undefined) && (imgUrl2 != undefined)) {
                    postit()
                } else {
                    console.log("has undefined")
                }
            };
            $(".camera1").children("span").text("图1摄像头");
            $(".camera2").children("span").text("图2摄像头");
        }
    });

    $("#camera_button2").click(function (e) {
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
            $(".camera2").children("span").text("拍照检测");
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

        if ($(".camera2").children("span")[0].innerText == "图2摄像头") {
            $(".face-top2").empty();
            $(".face-top2").append(" <video muted height=400px width=400px autoplay=\"autoplay\"></video>");
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
            $(".face-top2").empty();
            $(".face-top2").append(img);
            var imgUrl1 = $(".face-top1").children("img").attr("src");
            var imgUrl2 = $(".face-top2").children("img").attr("src");
            var img = $(".face-top2").children("img");
            img[0].onload = function () {
                if ((imgUrl1 != undefined) && (imgUrl2 != undefined)) {
                    postit()
                } else {
                    console.log("has undefined")
                }
            };
            $(".camera1").children("span").text("图1摄像头");
            $(".camera2").children("span").text("图2摄像头");
        }
    });

    $(".submit1").click(function () {
        $(".cover").css({"background": "rgba(0,0,0,0.8)", "border": "none"});
        var searchUrl = $(".imgUrl1").val();
        $(".face-top1").empty();
        $(".face-top1").append("<img src=" + searchUrl + "></img>");
        $(".face-top1").children("img").attr("src", searchUrl);
        var img = $(".face-top1").children("img");
        var imgUrl1 = $(".face-top1").children("img").attr("src");
        var imgUrl2 = $(".face-top2").children("img").attr("src");
        img[0].onload = function () {
            if ((imgUrl1 != undefined) && (imgUrl2 != undefined)) {
                postit()
            } else {
                console.log("has undefined")
            }
        };
    })
    $(".submit2").click(function () {
        $(".cover").css({"background": "rgba(0,0,0,0.8)", "border": "none"});
        var searchUrl = $(".imgUrl2").val();
        $(".face-top2").empty();
        $(".face-top2").append("<img src=" + searchUrl + "></img>");
        $(".face-top2").children("img").attr("src", searchUrl);
        var img = $(".face-top2").children("img");
        var imgUrl1 = $(".face-top1").children("img").attr("src");
        var imgUrl2 = $(".face-top2").children("img").attr("src");
        img[0].onload = function () {
            if ((imgUrl1 != undefined) && (imgUrl2 != undefined)) {
                postit()
            } else {
                console.log("has undefined")
            }
        };
    })
});