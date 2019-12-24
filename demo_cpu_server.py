#!usr/bin/env python3
# -*- coding:utf-8 _*-
'''
@author:qijun zhang
@file: demo_cpu_server
@time: 7/10/19  9:59 AM
'''
# src code is some project which requires Python processing to get results
from src.mtcnn.mtcnn_inference import *
from src.openface.openface_inference import *
from src.attribute_predict.attribute_predict_inference import *
from src.verification.arcface_inference import *
from src.beautygan.makeup_inference import *
#don't like warnings
import warnings
warnings.filterwarnings("ignore")
from flask import Flask, request, render_template
import uuid
import hashlib
import base64
import requests
import json
from flask import make_response
import cv2

ALLOWED_EXTENSIONS = set(['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG'])
app = Flask(__name__)
UPLOAD_FOLDER = 'static'
app._static_folder = UPLOAD_FOLDER




def allowed_files(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


def rename_filename(old_file_name):
    basename = os.path.basename(old_file_name)
    name, ext = os.path.splitext(basename)
    new_name = str(uuid.uuid1()) + ext
    return new_name


@app.route("/", methods=['GET', 'POST'])
def root():
    # main entrance
    return render_template('index.html')


@app.route('/favicon.ico', methods=['GET'])
def favicon():
    # for favicon.ico
    return app.send_static_file('favicon.ico')


@app.route("/mtcnn", methods=['GET', 'POST'])
def mtcnn():
    '''
    mtcnn get face bbox and 5 key points
    :return:json result
    '''
    if request.method == 'POST':
        #old fashion input way
        ## TODO file_binary = requests.get(request.form["base64"], verify=False).content if (request.form["base64"].startswith("http")) else base64.b64decode(request.form["base64"].split(",")[1])
        if request.form["mode"] == "base64":
            file_binary = base64.b64decode(request.form["base64"].split(",")[1])
        if request.form["mode"] == "image_url":
            image_url = request.form["image_url"]
            file_binary = requests.get(image_url).content
        if request.form["mode"] == "file_path":
            file_path = os.path.basename(request.form["file_path"])
            with open(os.path.join(UPLOAD_FOLDER, "static_img", file_path), "rb") as f:
                file_binary = f.read()
        if request.form["mode"] == "image_file":
            file = request.files['image_file']
            old_file_name = file.filename
            if file and allowed_files(old_file_name):
                filename = rename_filename(old_file_name)
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                file_path = file_path.replace(".jpeg", ".jpg")
                file.save(file_path)
            with open(file_path, "rb") as f:
                file_binary = f.read()
        nparr = np.fromstring(file_binary, dtype=np.uint8)
        img = cv2.imdecode(nparr, 1)[:, :, ::-1]
        # inference with one command line
        res = mtcnn_inference(img)
        resp = make_response()
        resp.status_code = 200
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Content-Type"] = "application/json"
        resp.response = json.dumps(res)
        return resp
    return render_template('mtcnn.html')


@app.route("/openface", methods=['GET', 'POST'])
def openface():
    '''
    openface get face bbox 68 key point and many detail face information.
    :return:json result
    '''
    if request.method == 'POST':
        # middle fashion input way
        file_binary = base64.b64decode(request.form["base64"].split(",")[1]) if (
                "base64" in request.form) else requests.get(request.form["imgurl"], verify=False).content
        name = hashlib.md5(file_binary).hexdigest()
        file_name = os.path.join('static/tmpimg/', name, name + "_openface.png")
        if not os.path.exists(file_name):
            nparr = np.fromstring(file_binary, dtype=np.uint8)
            img = cv2.imdecode(nparr, 1)
            os.makedirs(os.path.dirname(file_name), exist_ok=True)
            cv2.imwrite(file_name, img)
            # inference with docker container,use rm to delete container ,make once inference leave no memory trash
            cmd = "docker run  --rm " \
                  + "-v   " + os.path.join(os.getcwd(), os.path.dirname(file_name)) + ":/tmp/" + name \
                  + " zzz9958123/openface FaceLandmarkImg -f /tmp/" + name+"/"+name + "_openface.png" + "  -out_dir /tmp/" + name + " -nomask"
            os.system(cmd)
        #read result trans to 'dict' in variable res
        res = openface_inference(name)
        resp = make_response()
        resp.status_code = 200
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Content-Type"] = "application/json"
        resp.response = json.dumps(res)
        return resp
    return render_template('openface.html')


@app.route("/attribute_predict", methods=['GET', 'POST'])
def attribute_predict():
    '''
    face attribute predict,use mtcnn align face
    :return:json result
    '''
    if request.method == 'POST':
        file_binary = base64.b64decode(request.form["base64"].split(",")[1]) if (
                "base64" in request.form) else requests.get(request.form["imgurl"], verify=False).content
        name = hashlib.md5(file_binary).hexdigest()
        file_name = 'static/tmpimg/' + name + "_atp.png"
        nparr = np.fromstring(file_binary, dtype=np.uint8)
        img = cv2.imdecode(nparr, 1)
        cv2.imwrite(file_name, img)
        img = img[:, :, ::-1]
        #depend on mtcnn inference to detec face bbox,not smart,need change
        mtcnnres = mtcnn_inference(img)
        scaled = []
        #cut faces in image
        for i in range(len(mtcnnres["faces"])):
            bb = mtcnnres["faces"][i]["bounding_boxes"]
            scaled.append(cv2.resize(
                img[np.max([bb["y1"], 0]):np.min([bb["y2"], img.shape[0]]),
                np.max([bb["x1"], 0]):np.min([bb["x2"], img.shape[1]]), :],
                (112, 112)))
        scaled = np.array(scaled)
        #one command to predict attribute
        ap_value = ap_inference(scaled)
        label = "age,beauty,blurness,anger,disgust,fear,happiness,neutral,sadness,surprise,pitch,roll,yaw,mouth_open,smile".split(",")
        #use pandas make result json,not good idea for throughput but works
        dres = pd.DataFrame(ap_value,columns=label).to_dict(orient="records")
        res = mtcnnres
        for i in range(len(mtcnnres["faces"])):
            res["faces"][i]["ap_value"] = dres[i]
        resp = make_response()
        resp.status_code = 200
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Content-Type"] = "application/json"
        resp.response = json.dumps(res)
        return resp
    return render_template('attribute_predict.html')


@app.route("/beautygan", methods=['GET', 'POST'])
def beautygan():
    '''
    beutygan devlop by tencent youtu lab ,makeup face with reference image.(not align)
    :return:json result
    '''
    if request.method == 'POST':
        file_binary = requests.get(request.form["base64"], verify=False).content if (
            request.form["base64"].startswith("http")) else base64.b64decode(request.form["base64"].split(",")[1])
        name = hashlib.md5(file_binary).hexdigest()
        file_name = 'static/tmpimg/' + name + "_beautygan.png"
        nparr = np.fromstring(file_binary, dtype=np.uint8)
        img = cv2.imdecode(nparr, 1)
        ref_img = cv2.imread(os.path.join("static/makeup", os.path.basename(request.form["imgsrc"])))
        cv2.imwrite(file_name, img)
        #inference use 256 height,width image,result is makeup face
        res_img = beautygan_inference(cv2.resize(img, (256, 256))[:, :, ::-1],
                                      cv2.resize(ref_img[:, :, ::-1], (256, 256)))[0]
        res_img = res_img * 255
        cv2.imwrite(os.path.join('static/tmpimg/', name + os.path.basename(request.form["imgsrc"])),
                    res_img.astype(np.uint8)[:, :, ::-1])
        if os.path.exists(file_name):
            res = {"res": "完成", "name": name + os.path.basename(request.form["imgsrc"]), "status": True}
        else:
            res = {"res": "未检测到个体", "status": False}
        resp = make_response()
        resp.status_code = 200
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Content-Type"] = "application/json"
        resp.response = json.dumps(res)
        return resp
    return render_template('beautygan.html')


@app.route("/verification", methods=['GET', 'POST'])
def verification():
    '''
    verification is input two face,and verification two face is same person,return distance of two image
    :return:json result
    '''
    if request.method == 'POST':
        #accept two image of face
        file_binary1 = requests.get(request.form["p1"], verify=False).content if (request.form["p1"].startswith("http")) else base64.b64decode(request.form["p1"].split(",")[1])
        file_binary2 = requests.get(request.form["p2"], verify=False).content if (request.form["p2"].startswith("http")) else base64.b64decode(request.form["p2"].split(",")[1])
        img1 = cv2.imdecode(np.fromstring(file_binary1, np.uint8), 1)[:, :, ::-1]
        img2 = cv2.imdecode(np.fromstring(file_binary2, np.uint8), 1)[:, :, ::-1]
        #mtcnn inference bbox to align face,only take index 0 face of image
        mtcnnres1 = mtcnn_inference(img1)
        mtcnnres2 = mtcnn_inference(img2)
        bb = mtcnnres1["faces"][0]["bounding_boxes"]
        scaled1 = cv2.resize(img1[np.max([bb["y1"], 0]):np.min([bb["y2"], img1.shape[0]]),
                             np.max([bb["x1"], 0]):np.min([bb["x2"], img1.shape[1]]), :], (112, 112))
        bb = mtcnnres2["faces"][0]["bounding_boxes"]
        scaled2 = cv2.resize(img2[np.max([bb["y1"], 0]):np.min([bb["y2"], img2.shape[0]]),
                             np.max([bb["x1"], 0]):np.min([bb["x2"], img2.shape[1]]), :], (112, 112))
        assert scaled1.shape == scaled2.shape == (112, 112, 3), "img size is not correct,should be (112,112)"
        data = np.concatenate([[scaled1], [scaled2], [cv2.flip(scaled1, 1)], [cv2.flip(scaled2, 1)]]).astype(np.float32)
        data -= 127.5
        data *= 0.0078125
        #one command line to verification
        result, dist = verification_inference(data)
        res = {"res": result, "dist": dist}
        resp = make_response()
        resp.status_code = 200
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Content-Type"] = "application/json"
        resp.response = json.dumps(res)
        return resp
    return render_template('verification.html')


@app.route("/maskrcnn", methods=['GET', 'POST'])
def maskrcnn():
    '''
    this maskrcnn devlop by facebook research team,detec object in image,and make mask of it.
    :return:json result
    '''
    if request.method == 'POST':
        file_binary = base64.b64decode(request.form["base64"].split(",")[1]) if (
                "base64" in request.form) else requests.get(request.form["imgurl"], verify=False).content
        name = hashlib.md5(file_binary).hexdigest()
        file_name = 'static/tmpimg/' + name + "_maskrcnn.png"
        if not os.path.exists(file_name):
            nparr = np.fromstring(file_binary, dtype=np.uint8)
            img = cv2.imdecode(nparr, 1)
            cv2.imwrite(file_name, img)
            cmd = "docker run  --rm " \
                  + "-v " + os.path.join(os.getcwd(), "static/tmpimg") + ":/static " \
                  + "-v " + os.path.join(os.getcwd(), "model/maskrcnn") + ":/model_file " \
                  + "-v " + os.path.join(os.getcwd(),
                                         "model/maskrcnn/predictor.py") + ":/maskrcnn-benchmark/demo/predictor.py " \
                  + " zzz9958123/maskrcnn-benchmark python /model_file/do_file.py --image  " \
                  + "/static/" + os.path.basename(file_name)
            t1 = time.time()
            os.system(cmd)
            print("use time %d" % (time.time() - t1))
        if os.path.exists(file_name + ".txt"):
            res = json.loads(open(file_name + ".txt", "r").read())
            res = {"res": res, "name": name, "status": True}
        else:
            res = {"res": "未检测到个体", "status": False}
        resp = make_response()
        resp.status_code = 200
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Content-Type"] = "application/json"
        resp.response = json.dumps(res)
        return resp
    return render_template('maskrcnn.html')


@app.route("/face_alignment", methods=['GET', 'POST'])
def face_alignment():
    '''
    face alignment.consider remove this one
    :return:json result
    '''
    if request.method == 'POST':
        file_binary = base64.b64decode(request.form["base64"].split(",")[1]) if (
                "base64" in request.form) else requests.get(request.form["imgurl"], verify=False).content
        name = hashlib.md5(file_binary).hexdigest()
        file_name = 'static/tmpimg/' + name + "_facealign.png"
        if not os.path.exists(file_name):
            nparr = np.fromstring(file_binary, dtype=np.uint8)
            img = cv2.imdecode(nparr, 1)
            cv2.imwrite(file_name, img)
            # margin_ratio is face margin to image edge,image_size is output size
            cmd_align = "docker run  --rm " \
                        + "-v " + os.path.join(os.getcwd(), "static/tmpimg") + ":/static " \
                        + " zzz9958123/face_alignment python face_alignment.py " \
                        + os.path.join("/static", os.path.basename(file_name)) \
                        + " --margin_ratio 0.6 --image_size 500 --output_img /static/" + os.path.basename(file_name)
            os.system(cmd_align)
        if os.path.exists(file_name):
            res = {"res": "完成", "name": name, "status": True}
        else:
            res = {"res": "未检测到个体", "status": False}
        resp = make_response()
        resp.status_code = 200
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Content-Type"] = "application/json"
        resp.response = json.dumps(res)
        return resp
    return render_template('face_alignment.html')


@app.route("/srgan", methods=['GET', 'POST'])
def srgan():
    '''
    image super resolution,actually have 3 model.but only use srgan
    :return:json result
    '''
    if request.method == 'POST':
        file_binary = base64.b64decode(request.form["base64"].split(",")[1]) if (
                "base64" in request.form) else requests.get(request.form["imgurl"], verify=False).content
        name = hashlib.md5(file_binary).hexdigest()
        file_name = 'static/tmpimg/' + name + "_srgan.png"
        #Check whether the result has been inferenced
        if not os.path.exists(file_name):
            nparr = np.fromstring(file_binary, dtype=np.uint8)
            img = cv2.imdecode(nparr, 1)
            cv2.imwrite(file_name, img)
            cmd = "docker run  --rm " \
                  + "-v " + os.path.join(os.getcwd(), "static/tmpimg") + ":/static " \
                  + " zzz9958123/srgan python3 srgandemo.py " \
                  + os.path.join("/static", os.path.basename(file_name))
            os.system(cmd)
        #check inference is successful
        if os.path.exists(file_name):
            res = {"res": "完成", "name": name, "status": True}
        else:
            res = {"res": "未检测到个体", "status": False}
        resp = make_response()
        resp.status_code = 200
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Content-Type"] = "application/json"
        resp.response = json.dumps(res)
        return resp
    return render_template('srgan.html')


@app.route("/prnet", methods=['GET', 'POST'])
def prnet():
    '''
    face 3D reconstuction use prnet
    :return:json result
    '''
    if request.method == 'POST':
        file_binary = base64.b64decode(request.form["base64"].split(",")[1]) if (
                "base64" in request.form) else requests.get(request.form["imgurl"], verify=False).content
        name = hashlib.md5(file_binary).hexdigest()
        file_name = os.path.join('static/tmpimg/', name, name + "_prnet.png")
        if not os.path.exists(os.path.dirname(file_name)):
            os.makedirs(os.path.dirname(file_name), exist_ok=True)
            nparr = np.fromstring(file_binary, dtype=np.uint8)
            img = cv2.imdecode(nparr, 1)
            cv2.imwrite(file_name, img)
            cmd = "docker run  --rm -it  " \
                  + "-v " + os.path.join(os.getcwd(), "static/tmpimg") + ":/static " \
                  + " zzz9958123/prnet  python demo.py -i /static/" + name \
                  + " -o /static/" + name + " --is3d True --isFront True  --isKpt True --isDlib True --isTexture True --gpu -1 --isFront True --texture_size 484"
            os.system(cmd)
        # check inference is successful
        if os.path.exists("static/tmpimg/" + name + "/" + name + "_prnet_kpt.txt"):
            kpt = pd.read_csv("static/tmpimg/" + name + "/" + name + "_prnet_kpt.txt", header=None, sep=' ').rename(
                columns={0: "x", 1: "y", 2: "z"}).to_dict(orient="records") # load key point
            with open(os.path.join(os.getcwd(), "static/tmpimg", name, name + "_prnet.mtl"), 'r',
                      encoding='utf-8') as f:# change path in mtl
                s = f.read().replace("/static/" + name + "/", "")
            open(os.path.join(os.getcwd(), "static/tmpimg/", name, name + "_prnet.mtl"), 'w', encoding='utf-8').write(s)
            open(os.path.join(os.getcwd(), "static/tmpimg/", name, name + "_prnet.html"), 'w', encoding='utf-8').write(
                open(os.path.join(os.getcwd(), "static/head.html"), 'r', encoding='utf-8').read().replace("head3d", name + "_prnet"))# change path in html
            res = {"res": kpt, "name": name, "status": True}
        else:
            res = {"res": "未检测到个体", "status": False}
        resp = make_response()
        resp.status_code = 200
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Content-Type"] = "application/json"
        resp.response = json.dumps(res)
        return resp
    return render_template('prnet.html')


if __name__ == "__main__":
    #https is not necessary,but web camera only work in https mode
    if os.path.exists("./ssl/cert"):
        app.run(host='0.0.0.0', port=5000, debug=False,
                ssl_context=('./ssl/cert', './ssl/key'))
    else:
        app.run(host='0.0.0.0', port=5000, debug=False)
