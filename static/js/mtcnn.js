$(function () {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    var globalurl = "https://pc.zzz9958123.com:5000/mtcnn";
    /************************图片切换************************/
    $(".swiper-container ul li").click(function () {
        var imgUrl = $(this).children("img").attr("src");
        var img = $(this).children("img")[0];
        $(".cover").css("background", "rgba(0,0,0,0.8)");
        $(".cover").css("border", "none");
        $(this).children(".cover").css("background", "rgba(0,0,0,0)");
        $(this).children(".cover").css("border", "2px solid #00b2e0");
        $.ajax({
            url: globalurl,
            method: "POST",
            data: {
                file_path: imgUrl,
                mode: "file_path"
            },
            success: function (data) {
                var face_number = data.faces.length;
                $(".infor").css("display", "none");
                $(".infor_message").css("display", "block");
                $(".infor_message").empty();
                var message = "<p>已检测到图中 " + face_number + " 张人脸，点击人脸图片查看结果信息。您可将以上信息传给其他API进行后续处理和分析。推荐使用人脸属性和人脸关键点API。</p>";
                $(".infor_message").append(message);
                sessionStorage.setItem("faceapi", JSON.stringify(data));
                $(".face-top").empty();
                $(".face-top").append("<img src=/static/static_img/stback.png alt='点击一张示例图片'>")
                $(".face-top").children("img").attr("src", imgUrl);
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

    $(document).on('click', '.demo-container ul li canvas', function () {
        $(".infor").css("display", "block");
        $(".infor_message").css("display", "none");
        var img = $(this)[0];
        var id_canvas = Number($(this).attr("id").replace("canvas", ""));
        var faceapi = JSON.parse(sessionStorage.getItem("faceapi"))
        var confidence = faceapi.faces[id_canvas].confidence;
        var bbox = faceapi.faces[id_canvas].bounding_boxes;
        var kpoint = faceapi.faces[id_canvas].kpoint;
        var kpointstr = JSON.stringify(kpoint)
        $(".confidencevalue").html(confidence);
        $(".bboxvalue").text("x1:" + bbox.x1 + "\n" + "y1:" + bbox.y1 + "\n" + "x2:" + bbox.x2 + "\n" + "y2:" + bbox.y2 + "\n");
        $(".kpointvalue").text(kpointstr);
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
            context3.arc((kpoint[i][0] - bbox.x1) * wscale + 142, (kpoint[i][1] - bbox.y1) * hscale + 142, 3, 0, 2 * Math.PI);
            context3.fillStyle = "red";
            context3.fill();
            context3.stroke();
        }


    })

    $("#file").change(function (e) {
        $(".cover").css({"background": "rgba(0,0,0,0.8)", "border": "none"});
        src = window.URL.createObjectURL($("#file")[0].files[0]);
        $(".face-top").empty();
        $(".face-top").append("<img src=/static/stback.png alt='点击一张示例图片'>")
        $(".face-top").children("img").attr("src", src);
        var img = $(".face-top").children("img")[0];
        var formData = new FormData();
        formData.append("image_file", $("#file")[0].files[0]);
        formData.append("mode", "image_file");
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
                })

            }
        })
    })


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
            formData.append("mode", "base64");
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
                    })

                }
            })
        }
    })

    $(".submit").click(function () {
        $(".cover").css({"background": "rgba(0,0,0,0.8)", "border": "none"});
        var searchUrl = $(".imgUrl").val();
        $(".face-top").empty()
        $(".face-top").append("<img src=" + searchUrl + "></img>")
        // $(".face-top").children("img").attr("src", searchUrl);
        var img = $(".face-top").children("img")[0]
        $.ajax({
            url: globalurl,
            method: "POST",
            // cache: false,
            data: {
                mode: "image_url",
                image_url: searchUrl,
            },
            // processData: false,
            // contentType: false,
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
                })
            }
        })
    })

})