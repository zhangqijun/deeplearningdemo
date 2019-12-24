# what is it
Collect all kinds of deep learning projects, quickly build demo. Use the minimum code to Reproducing function 

It can be divided into CPU version and GPU version. Some project will adopt GPU version which the model can only run on GPU or the model with poor experience on CPU 

* Small model use cpu inference

* Large model uses docker container inference,and destroy the container after completion

[[中文说明]](/readme_cn.md) [[deploy]](https://pc.zzz9958123.com:5000) [[video tutorial]](https://youtu.be/qS3-gk3_UBI)

# sample
<p align="center">openface <br> <img src="./static/static_img/openfacesample.png" ></p>
<p align="center">detecron2 <br> <img src="./static/static_img/detectron2sample.png"></p>
<p align="center">face 3D reconsturction <br> <img src="./static/static_img/prnetsample.png" ></p>

# demo list
| name | inference | ?pu | model | source
| :-: | :-: | :-: | :-: | :-:
| face detection | memory | cpu | mtcnn | -
| key point | container | cpu | openface | [github](https://github.com/TadasBaltrusaitis/OpenFace)
| face alignment | container | cpu | face-alignment | -
| segmentation | container | gpu | detecron2 | [github](https://github.com/facebookresearch/detectron2)
| segmentation | container | cpu | maskrcnn | [github](https://github.com/facebookresearch/maskrcnn-benchmark)
| pose estimation | container | gpu | densepose | [github](https://github.com/facebookresearch/DensePose)
| makeup | container | gpu | face-makeup.PyTorch | [github](https://github.com/zllrunning/face-makeup.PyTorch)
| attribute predict | memory | cpu | attribute-predict | -
| face verification | memory | cpu | arcface | [github](https://github.com/deepinsight/insightface)
| face 3D reconsturction | container | cpu | prnet | [github](https://github.com/YadiraF/PRNet)
| super resolution | container | cpu | srgan | [github](https://github.com/brade31919/SRGAN-tensorflow)
| AImakeup | memory | cpu | beautygan | [github](https://github.com/Honlan/BeautyGAN)
| attribute manipulate | container | gpu | stylegan | [github](https://github.com/NVlabs/stylegan)
| attribute manipulate | container | gpu | glow | [github](https://github.com/openai/glow)
| face interpolation | container | gpu | glow | [github](https://github.com/openai/glow)
| face interpolation | container | gpu | stylegan | [github](https://github.com/NVlabs/stylegan)
| image inpaint | - | web | - | [nvidia-playground](https://www.nvidia.com/en-us/research/ai-playground/)
| domain transfer | - | web | guagan | [nvidia-playground](https://www.nvidia.com/en-us/research/ai-playground/)
| domain transfer | - | web | gannimal | [nvidia-playground](https://www.nvidia.com/en-us/research/ai-playground/)
| tf-js | - | web | - | [github](https://github.com/justadudewhohacks/face-api.js)



# Install
* main image
```
docker pull zzz9958123/demo_server
```
* project image
```
docker pull zzz9958123/glow
docker pull zzz9958123/detectron2
docker pull zzz9958123/densepose
docker pull zzz9958123/openface
docker pull zzz9958123/densepose
docker pull zzz9958123/maskrcnn-benchmark
docker pull zzz9958123/prnet
docker pull zzz9958123/haircolour
docker pull zzz9958123/face_alignment
docker pull zzz9958123/srgan
```

* download model from [[GD]](https://drive.google.com/drive/folders/1YV2B_WE5CtpFzokCTtM1rTFxB3ebRuY-?usp=sharing) [[baidu]](https://pan.baidu.com/s/1XAOyBFsvwKMAwt4sSEQ0TQ)

* Place your domain certificate in the SSL folder to make HTTPS work.This is not a necessary step, unless you want the webcam to work

# Run
```
docker-compose up
```
go check **http(s)://0.0.0.0:5000** 


# rest-api
All projects support rest API methods  
URL is the project address,Post requests to submit form, input {Base64: Base64 picture}, and return JSON calculation result. Refer to response JSON of demo page for structure

## example
```
import requests
import base64
res = requests.post("https://pc.zzz9958123.com:5000/attribute_predict",data={"base64":b"data:img/png;base64,"+base64.b64encode(open("abc.png","rb").read())}).content
print(res)
```

