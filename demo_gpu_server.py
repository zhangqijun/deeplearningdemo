#!usr/bin/env python3
# -*- coding:utf-8 _*-
'''
@author:qijun zhang
@file: mtcnn_server
@time: 7/10/19  9:59 AM
'''
import warnings

warnings.filterwarnings("ignore")
from flask import Flask, request, render_template
import uuid
import os
import base64
import hashlib
import requests
import time
import json
from flask import make_response
import cv2
import matplotlib.pyplot as plt
import numpy as np

ALLOWED_EXTENSIONS = set(['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG'])
app = Flask(__name__)
UPLOAD_FOLDER = 'static'
app._static_folder = UPLOAD_FOLDER

glow_tag = [s.replace(".npy", "") for s in os.listdir("model/glow_direction") if s.endswith(".npy")]
directions = np.concatenate([[np.load(os.path.join("model/glow_direction", s + ".npy")) for s in glow_tag]])
stylegan_tag = [s.replace(".npy", "") for s in os.listdir("model/stylegan_direction") if s.endswith(".npy")]
styleganz = np.concatenate([[np.load(os.path.join("model/stylegan_direction", s + ".npy")) for s in stylegan_tag]], axis=0)


def allowed_files(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


def rename_filename(old_file_name):
    basename = os.path.basename(old_file_name)
    name, ext = os.path.splitext(basename)
    new_name = str(uuid.uuid1()) + ext
    return new_name


@app.route('/favicon.ico', methods=['GET'])
def favicon():
    return app.send_static_file('favicon.ico')


@app.route("/hair_colour", methods=['GET', 'POST'])
def hair_colour():
    '''
    segmentation face,change colour(hair and lip)
    :return:json result
    '''
    if request.method == 'POST':
        file_binary = base64.b64decode(request.form["base64"].split(",")[1]) if (
                "base64" in request.form) else requests.get(request.form["imgurl"], verify=False).content
        c = json.dumps(json.dumps(
            np.array([eval(request.form["hairc"].replace("rgb", ""))[::-1],
                      eval(request.form["uplipc"].replace("rgb", ""))[::-1],
                      eval(request.form["downlipc"].replace("rgb", ""))[::-1]]).tolist()))
        name = hashlib.md5(file_binary).hexdigest()
        file_name = 'static/tmpimg/' + name + "_hc.png"
        nparr = np.fromstring(file_binary, dtype=np.uint8)
        img = cv2.imdecode(nparr, 1)
        cv2.imwrite(file_name, img)
        writename = name + time.asctime().replace(" ", "") + ".png"
        cmd = "docker run  --rm " \
              + "-v " + os.path.join(os.getcwd(), "static/tmpimg") + ":/static " \
              + " zzz9958123/haircolour python3 makeup.py  --img-path /static/" + name + "_hc.png" + " --color " + c + " --outputname /static/" + writename
        os.system(cmd)
        if os.path.exists('static/tmpimg/' + writename):
            res = {"name": 'static/tmpimg/' + writename, "status": True}
        else:
            res = {"status": False}
        resp = make_response()
        resp.status_code = 200
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Content-Type"] = "application/json"
        resp.response = json.dumps(res)
        return resp
    return render_template('hair_colour.html')


@app.route("/glow_interpolation", methods=['GET', 'POST'])
def glow_interpolation():
    '''
    interpolation face use glow
    :return:json result
    '''
    if request.method == 'POST':
        file_binary = requests.get(request.form["base64"], verify=False).content if (
            request.form["base64"].startswith("http")) else base64.b64decode(request.form["base64"].split(",")[1])
        name = hashlib.md5(file_binary).hexdigest()
        gifname = os.path.join("static/tmpimg/",
                               name + "_" + os.path.splitext(os.path.basename(request.form["imgsrc"]))[0] + "_glow.gif")
        filename = os.path.join("static/tmpimg", name + ".png")
        nparr = np.fromstring(file_binary, dtype=np.uint8)
        cv2.imwrite(filename, cv2.imdecode(nparr, 1))
        if not os.path.exists(gifname):
            cmd = "docker run  --rm " \
                  + "-v " + os.path.join(os.getcwd(), "static/tmpimg") + ":/static " \
                  + "-v " + os.path.join(os.getcwd(), "static/static_img") + ":/npy " \
                  + " zzz9958123/glow python3 /root/glow_inference_c.py  --output /static --method interpolation --input /static/" + name + ".png" + " --target_latent /npy/" + os.path.basename(
                request.form["imgsrc"]) + ".npy"
            os.system(cmd)
            os.rename(filename + ".gif", gifname)
            res = {"res": "success", "name": gifname, "status": True}
        else:
            res = {"res": "exists", "name": gifname, "status": True}
        resp = make_response()
        resp.status_code = 200
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Content-Type"] = "application/json"
        resp.response = json.dumps(res)
        return resp
    return render_template('glow_interpolation.html')


@app.route("/glow_manipulate", methods=['GET'])
def glow_manipulate():
    '''
    manipulate face att use glow
    :return: html
    '''
    return render_template('glow_manipulate.html')


@app.route("/glow_manipulate_encode", methods=['POST'])
def glow_encode():
    '''
    encode face to latent space
    :return:json result
    '''
    file_binary = base64.b64decode(request.form["base64"].split(",")[1]) if (
            "base64" in request.form) else requests.get(request.form["imgurl"], verify=False).content
    name = hashlib.md5(file_binary).hexdigest()
    filename = os.path.join("static/tmpimg", name + ".png")
    npyname = filename + ".npy"
    if not os.path.exists(npyname):
        nparr = np.fromstring(file_binary, dtype=np.uint8)
        cv2.imwrite(filename, cv2.imdecode(nparr, 1))
        cmd = "docker run  --rm " \
              + "-v " + os.path.join(os.getcwd(), "static/tmpimg") + ":/static " \
              + "-v " + os.path.join(os.getcwd(), "static/static_img") + ":/npy " \
              + " zzz9958123/glow python3 glow_inference_c.py  --output /static --method encode --input /static/" + name + ".png"
        os.system(cmd)
    res = {"res": "exists", "name": name, "status": True}
    resp = make_response()
    resp.status_code = 200
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Content-Type"] = "application/json"
    resp.response = json.dumps(res)
    return resp


@app.route("/glow_manipulate_decode", methods=['POST'])
def glow_decode():
    '''
    decode latent to glow face
    :return:json result
    '''
    latent = np.expand_dims(np.load(os.path.join("static/tmpimg", request.form["name"] + ".png.npy")), 0)
    ma_vec = np.array([request.form[s] for s in glow_tag]).astype(np.float32) / 100
    newlatent = latent + np.sum(np.expand_dims(ma_vec, 1) * directions, axis=0)
    np.save(os.path.join("static/tmpimg", request.form["name"] + "_newlatent.npy"), newlatent)
    decodename = request.form["name"] + time.asctime().replace(" ", "") + "_decode.png"
    cmd = "docker run  --rm " \
          + "-v " + os.path.join(os.getcwd(), "static/tmpimg") + ":/static " \
          + "-v " + os.path.join(os.getcwd(), "static/static_img") + ":/npy " \
          + " zzz9958123/glow python3 glow_inference_c.py  --output /static --method decode --input /static/" + \
          request.form["name"] + "_newlatent.npy"
    os.system(cmd)
    decodeimg = np.load("static/tmpimg/" + request.form["name"] + "_newlatent.npy_decode.npy")
    cv2.imwrite(os.path.join("static/tmpimg", decodename), decodeimg[0, :, :, ::-1])
    res = {"res": "exists", "name": decodename, "status": True}
    resp = make_response()
    resp.status_code = 200
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Content-Type"] = "application/json"
    resp.response = json.dumps(res)
    return resp


@app.route("/stylegan_interpolation", methods=['GET', 'POST'])
def stylegan_interpolation():
    '''
    interpolation use stylegan
    :return:json result
    '''
    if request.method == 'POST':
        file_binary = requests.get(request.form["base64"], verify=False).content if (
            request.form["base64"].startswith("http")) else base64.b64decode(request.form["base64"].split(",")[1])
        name = hashlib.md5(file_binary).hexdigest()
        gifname = os.path.join("static/tmpimg/",
                               name + "_" + os.path.splitext(os.path.basename(request.form["imgsrc"]))[
                                   0] + "_stylegan.gif")
        filename = os.path.join("static/tmpimg", name + ".png")
        nparr = np.fromstring(file_binary, dtype=np.uint8)
        cv2.imwrite(filename, cv2.imdecode(nparr, 1))
        if not os.path.exists(gifname):
            cmd = "docker run  --rm " \
                  + "-v " + os.path.join(os.getcwd(), "static/tmpimg") + ":/static " \
                  + "-v " + os.path.join(os.getcwd(), "static/static_img") + ":/npy " \
                  + " zzz9958123/stylegan_encoder python3 /root/stylegan_inference.py  --output /static --method interpolation --input /static/" + name + ".png" + " --target_latent /npy/" + os.path.basename(
                request.form["imgsrc"]) + "_stylegan.npy"
            os.system(cmd)
            os.rename(filename + "_stylegan.gif", gifname)
            res = {"res": "success", "name": gifname, "status": True}
        else:
            res = {"res": "exists", "name": gifname, "status": True}
        resp = make_response()
        resp.status_code = 200
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Content-Type"] = "application/json"
        resp.response = json.dumps(res)
        return resp
    return render_template('stylegan_interpolation.html')


@app.route("/stylegan_manipulate", methods=['GET'])
def stylegan_manipulate():
    '''
    manipulate face att use stylegan
    :return: html
    '''
    return render_template('stylegan_manipulate.html')


@app.route("/stylegan_manipulate_encode", methods=['POST'])
def stylegan_manipulate_encode():
    '''
    encode face to latent space
    :return:json result
    '''
    file_binary = base64.b64decode(request.form["base64"].split(",")[1]) if (
            "base64" in request.form) else requests.get(request.form["imgurl"], verify=False).content
    name = hashlib.md5(file_binary).hexdigest()
    filename = os.path.join("static/tmpimg", name + ".png")
    nparr = np.fromstring(file_binary, dtype=np.uint8)
    cv2.imwrite(filename, cv2.imdecode(nparr, 1))
    npyname = filename + "_stylegan.npy"
    if not os.path.exists(npyname):
        cmd = "docker run  --rm " \
              + "-v " + os.path.join(os.getcwd(), "static/tmpimg") + ":/static " \
              + "-v " + os.path.join(os.getcwd(), "static/static_img") + ":/npy " \
              + " zzz9958123/stylegan_encoder python3 /root/stylegan_inference.py  --output /static --method encode --input /static/" + name + ".png"
        os.system(cmd)
    res = {"res": "exists", "name": name + ".png", "status": True}
    resp = make_response()
    resp.status_code = 200
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Content-Type"] = "application/json"
    resp.response = json.dumps(res)
    return resp


@app.route("/stylegan_manipulate_decode", methods=['POST'])
def stylegan_manipulate_decode():
    '''
    decode latent to face
    :return:json result
    '''
    latent = np.expand_dims(np.load(os.path.join("static/tmpimg", request.form["name"] + "_stylegan.npy")), 0)
    ma_vec = np.array([request.form[s] for s in stylegan_tag]).astype(np.float32) / 50
    newlatent = latent.copy()
    newlatent[:, :8, :] = (latent + np.sum(np.expand_dims(np.expand_dims(ma_vec, 1), 1) * styleganz, axis=0))[:, :8, :]
    np.save(os.path.join("static/tmpimg", request.form["name"] + "_newlatent.npy"), newlatent)
    decodename = request.form["name"] + time.asctime().replace(" ", "") + "_stylegandecode.png"
    cmd = "docker run  --rm " \
          + "-v " + os.path.join(os.getcwd(), "static/tmpimg") + ":/static " \
          + "-v " + os.path.join(os.getcwd(), "static/static_img") + ":/npy " \
          + " zzz9958123/stylegan_encoder python3 /root/stylegan_inference.py  --output /static --method decode --input /static/" + \
          request.form["name"] + "_newlatent.npy"
    os.system(cmd)
    decodeimg = np.load("static/tmpimg/" + request.form["name"] + "_newlatent.npy_decode.npy")
    cv2.imwrite(os.path.join("static/tmpimg", decodename), decodeimg[0, :, :, ::-1])
    res = {"res": "exists", "name": decodename, "status": True}
    resp = make_response()
    resp.status_code = 200
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Content-Type"] = "application/json"
    resp.response = json.dumps(res)
    return resp


@app.route("/densepose", methods=['GET', 'POST'])
def densepose():
    '''
    Human gesture analysis
    :return:json result
    '''
    if request.method == 'POST':
        file_binary = base64.b64decode(request.form["base64"].split(",")[1]) if (
                "base64" in request.form) else requests.get(request.form["imgurl"], verify=False).content
        name = hashlib.md5(file_binary).hexdigest()
        if not os.path.exists(os.path.join("static/tmpimg", name + ".png")):
            nparr = np.fromstring(file_binary, dtype=np.uint8)
            img = cv2.imdecode(nparr, 1)
            cv2.imwrite(os.path.join("static/tmpimg", name + ".png"), img)
            cmd = "docker run  --rm " \
                  + "-v " + os.path.join(os.getcwd(), "static/tmpimg") + ":/static " \
                  + "-v " + os.path.join(os.getcwd(), "model/densepose_file") + ":/densepose_file " \
                  + "-v " + os.path.join(os.getcwd(), "model/densepose_data") + ":/densepose/DensePoseData " \
                  + "-v " + os.path.join(os.getcwd(), "model/densepose_file",
                                         "vis.py") + ":/densepose/detectron/utils/vis.py " \
                  + " zzz9958123/densepose:c2-cuda10.1-cudnn7 python2 tools/infer_simple.py --cfg configs/DensePose_ResNet101_FPN_s1x-e2e.yaml --output-dir /static --image-ext jpg --wts /densepose_file/DensePose_ResNet101_FPN_s1x-e2e.pkl " \
                  + "/static/" + os.path.basename(name + ".png")
            os.system(cmd)
        file_name = 'static/tmpimg/' + name + ".png"
        im = cv2.imread(file_name)
        if os.path.exists('static/tmpimg/' + name + '_IUV.png'):
            IUV = cv2.imread('static/tmpimg/' + name + '_IUV.png')
            plt.style.use({'figure.figsize': (4, 3)})
            plt.imshow(im[:, :, ::-1])
            plt.contour(IUV[:, :, 1] / 256., 10, linewidths=1)
            plt.contour(IUV[:, :, 2] / 256., 10, linewidths=1)
            plt.axis('off')
            plt.savefig(file_name)
            plt.clf()
            bbox = json.loads(open(os.path.join("static/tmpimg", name + "_res.txt"), "r").read())
            print(np.array(bbox["boxes"]).shape)
            res = {"res": bbox, "name": name, "status": True}
        else:
            res = {"res": "未检测到完整人体", "status": False}
        resp = make_response()
        resp.status_code = 200
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Content-Type"] = "application/json"
        resp.response = json.dumps(res)
        return resp
    return render_template('densepose.html')


@app.route("/detectron2", methods=['GET', 'POST'])
def detectron2():
    '''
    object detection and segmentation
    :return:json result
    '''
    if request.method == 'POST':
        file_binary = base64.b64decode(request.form["base64"].split(",")[1]) if (
                "base64" in request.form) else requests.get(request.form["imgurl"], verify=False).content
        name = hashlib.md5(file_binary).hexdigest()
        file_name = 'static/tmpimg/' + name + "_detectron2.png"
        if not os.path.exists(file_name):
            nparr = np.fromstring(file_binary, dtype=np.uint8)
            img = cv2.imdecode(nparr, 1)
            cv2.imwrite(file_name, img)
            cmd = "docker run  --rm " \
                  + "-v " + os.path.join(os.getcwd(), "static/tmpimg") + ":/static " \
                  + "-v " + os.path.join(os.getcwd(),
                                         "model/detectron2_file/model_final_f10217.pkl") + ":/detectron2_repo/model_final_f10217.pkl " \
                  + "-v " + os.path.join(os.getcwd(), "model/detectron2_file",
                                         "demo.py") + ":/detectron2_repo/demo/demo.py " \
                  + "-v " + os.path.join(os.getcwd(), "model/detectron2_file",
                                         "predictor.py") + ":/detectron2_repo/demo/predictor.py " \
                  + "-v " + os.path.join(os.getcwd(), "model/detectron2_file",
                                         "visualizer.py") + ":/detectron2_repo/detectron2/utils/visualizer.py " \
                  + " zzz9958123/detectron2 python3 demo/demo.py --config-file configs/COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml --input " + "/static/" + os.path.basename(
                name + "_detectron2.png") + " --output /static --opts MODEL.WEIGHTS model_final_f10217.pkl "
            os.system(cmd)
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
    return render_template('detectron2.html')


if __name__ == "__main__":
    if os.path.exists("./ssl/cert"):
        app.run(host='0.0.0.0', port=5001, debug=False,
                ssl_context=('./ssl/cert', './ssl/key'))
    else:
        app.run(host='0.0.0.0', port=5001, debug=False)
